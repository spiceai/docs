/*
Copyright 2024-2026 The Spice.ai OSS Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

//! GitHub release types and operations.

use super::{GitHubClient, GitHubError};
use flate2::read::GzDecoder;
use serde::Deserialize;
use std::path::Path;
use tar::Archive;

/// A GitHub release.
#[derive(Debug, Deserialize)]
pub struct RepoRelease {
    pub url: String,
    pub html_url: String,
    pub assets_url: String,
    pub tag_name: String,
    pub name: Option<String>,
    pub draft: bool,
    pub prerelease: bool,
    pub created_at: String,
    pub published_at: Option<String>,
    pub assets: Vec<ReleaseAsset>,
}

impl RepoRelease {
    /// Check if the release has a specific asset.
    #[must_use]
    pub fn has_asset(&self, name: &str) -> bool {
        self.assets.iter().any(|a| a.name == name)
    }

    /// Get a specific asset by name.
    #[must_use]
    pub fn get_asset(&self, name: &str) -> Option<&ReleaseAsset> {
        self.assets.iter().find(|a| a.name == name)
    }
}

/// A GitHub release asset.
#[derive(Debug, Deserialize)]
pub struct ReleaseAsset {
    pub url: String,
    pub id: u64,
    pub name: String,
    pub content_type: String,
    pub size: u64,
    pub download_count: u64,
    pub browser_download_url: String,
}

/// Get the latest release from GitHub.
pub async fn get_latest_release(client: &GitHubClient) -> Result<RepoRelease, GitHubError> {
    let url = client.latest_release_url();
    client.get(&url).await
}

/// Get a specific release by version tag.
///
/// The release is fetched by its tag rather than searched for in the release list, which
/// GitHub pages 30 at a time: a search of the first page cannot find any older release.
pub async fn get_release(client: &GitHubClient, version: &str) -> Result<RepoRelease, GitHubError> {
    let url = client.release_by_tag_url(version);
    match client.get(&url).await {
        Err(GitHubError::Api { status: 404, .. }) => Err(GitHubError::ReleaseNotFound {
            version: version.to_string(),
        }),
        result => result,
    }
}

/// Download a release asset and extract it to a directory.
pub async fn download_release_asset(
    client: &GitHubClient,
    release: &RepoRelease,
    asset_name: &str,
    download_dir: &Path,
) -> Result<(), GitHubError> {
    let asset = release
        .get_asset(asset_name)
        .ok_or_else(|| GitHubError::AssetNotFound {
            name: asset_name.to_string(),
        })?;

    tracing::debug!(
        "Downloading asset: {} ({})",
        asset.name,
        format_size(asset.size)
    );

    let data = download_reporting_progress(client, asset, "Downloading").await?;

    // Extract tar.gz
    extract_tar_gz(&data, download_dir)?;

    Ok(())
}

/// Download an asset, reporting progress on stderr under `label`.
async fn download_reporting_progress(
    client: &GitHubClient,
    asset: &ReleaseAsset,
    label: &str,
) -> Result<Vec<u8>, GitHubError> {
    let total_size = asset.size;
    let start_time = std::time::Instant::now();

    let data = client
        .download_asset(asset, |downloaded| {
            let elapsed = start_time.elapsed().as_secs_f64();
            let speed = if elapsed > 0.0 {
                downloaded as f64 / elapsed / 1024.0 / 1024.0
            } else {
                0.0
            };
            let percent = (downloaded as f64 / total_size as f64) * 100.0;

            eprint!(
                "\r{label}: {:.1}% ({}/{}) @ {:.1} MB/s",
                percent,
                format_size(downloaded),
                format_size(total_size),
                speed
            );
        })
        .await?;

    eprintln!(); // New line after progress

    Ok(data)
}

/// Download a release asset with fallback to alternative asset names.
///
/// Tries each asset name in order until one succeeds.
/// Returns the name of the asset that was successfully downloaded.
pub async fn download_release_asset_with_fallback(
    client: &GitHubClient,
    release: &RepoRelease,
    asset_names: &[String],
    download_dir: &Path,
) -> Result<String, GitHubError> {
    for asset_name in asset_names {
        if release.has_asset(asset_name) {
            download_release_asset(client, release, asset_name, download_dir).await?;
            return Ok(asset_name.clone());
        }
        tracing::debug!("Asset not found: {asset_name}, trying next...");
    }

    // None of the asset names were found
    let tried = asset_names.join(", ");
    Err(GitHubError::AssetNotFound { name: tried })
}

/// Upgrade the CLI binary in-place by downloading and replacing the current executable.
///
/// This function:
/// 1. Downloads the CLI asset from the release
/// 2. Extracts the binary to a temporary file
/// 3. Atomically replaces the current executable with the new one
///
/// # Errors
///
/// Returns an error if the download fails, extraction fails, or the file replacement fails.
pub async fn upgrade_cli_in_place(
    client: &GitHubClient,
    release: &RepoRelease,
    asset_name: &str,
) -> Result<(), GitHubError> {
    let asset = release
        .get_asset(asset_name)
        .ok_or_else(|| GitHubError::AssetNotFound {
            name: asset_name.to_string(),
        })?;

    tracing::debug!(
        "Downloading CLI asset: {} ({})",
        asset.name,
        format_size(asset.size)
    );

    let data = download_reporting_progress(client, asset, "Downloading CLI").await?;

    // Get the current executable path
    let current_exe = std::env::current_exe().map_err(|e| GitHubError::Io {
        message: format!("Failed to get current executable path: {e}"),
    })?;

    // Create a temporary directory next to the executable (not in /tmp) to guarantee
    // the same filesystem, so that fs::rename works atomically without EXDEV.
    let exe_dir = current_exe.parent().ok_or_else(|| GitHubError::Io {
        message: "Failed to get executable parent directory".to_string(),
    })?;
    let temp_dir = tempfile::tempdir_in(exe_dir).map_err(|e| GitHubError::Io {
        message: format!("Failed to create temporary directory: {e}"),
    })?;

    // Extract tar.gz to temp directory
    extract_tar_gz(&data, temp_dir.path())?;

    // Find the extracted CLI binary
    let cli_binary_name = if cfg!(windows) { "spice.exe" } else { "spice" };
    let extracted_binary = temp_dir.path().join(cli_binary_name);

    if !extracted_binary.exists() {
        return Err(GitHubError::Io {
            message: format!(
                "Extracted CLI binary not found at {}",
                extracted_binary.display()
            ),
        });
    }

    // We cannot overwrite a running executable directly — Linux returns ETXTBSY and
    // Windows locks the file. Use rename to atomically swap the directory entry: the
    // old inode stays alive (referenced by the running process) while the new binary
    // takes the path. On Windows, rename-over-running-exe fails, so we rename the old
    // binary away first.
    #[cfg(windows)]
    {
        let backup_path = current_exe.with_extension("old.exe");
        // Try to remove old backup if it exists
        let _ = std::fs::remove_file(&backup_path);
        // Rename current executable to backup
        std::fs::rename(&current_exe, &backup_path).map_err(|e| GitHubError::Io {
            message: format!("Failed to backup current executable: {e}"),
        })?;
    }

    // Atomically move the new binary into place.
    std::fs::rename(&extracted_binary, &current_exe).map_err(|e| GitHubError::Io {
        message: format!("Failed to replace CLI binary: {e}"),
    })?;

    // Make the binary executable on Unix
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let permissions = std::fs::Permissions::from_mode(0o755);
        std::fs::set_permissions(&current_exe, permissions).map_err(|e| GitHubError::Io {
            message: format!("Failed to set executable permissions: {e}"),
        })?;
    }

    Ok(())
}
/// Extract a tar.gz archive to a directory.
fn extract_tar_gz(data: &[u8], dest: &Path) -> Result<(), GitHubError> {
    let decoder = GzDecoder::new(data);
    let mut archive = Archive::new(decoder);

    archive.unpack(dest).map_err(|e| GitHubError::Io {
        message: format!("Failed to extract archive: {e}"),
    })?;

    Ok(())
}

/// Format a byte size as a human-readable string.
fn format_size(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if bytes >= GB {
        format!("{:.1} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.1} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.1} KB", bytes as f64 / KB as f64)
    } else {
        format!("{bytes} B")
    }
}

pub struct Arch(pub String);

pub enum SystemType {
    Linux(Arch),
    Darwin(Arch),
    Windows(Arch),
    Other(Arch, String),
}

impl SystemType {
    /// Get the OS type for the current platform.
    pub fn this_pc() -> SystemType {
        let arch = Arch(get_rust_arch().to_string());
        match std::env::consts::OS {
            "linux" => SystemType::Linux(arch),
            "macos" => SystemType::Darwin(arch),
            "windows" => SystemType::Windows(arch),
            other => SystemType::Other(arch, other.to_string()),
        }
    }

    fn arch(&self) -> &str {
        match self {
            SystemType::Linux(Arch(a))
            | SystemType::Darwin(Arch(a))
            | SystemType::Windows(Arch(a))
            | SystemType::Other(Arch(a), _) => a,
        }
    }

    /// Get the OS type name for the current platform.
    fn os_type_name(&self) -> &str {
        match self {
            SystemType::Linux(_) => "linux",
            SystemType::Darwin(_) => "darwin",
            SystemType::Windows(_) => "windows",
            SystemType::Other(_, name) => name,
        }
    }

    /// Get the CLI asset prefix for the current platform.
    fn cli_asset_prefix(&self) -> &str {
        match self {
            SystemType::Windows(_) => "spice.exe",
            _ => "spice",
        }
    }

    /// Get the runtime asset prefix for the current platform.
    fn runtime_asset_prefix(&self) -> &str {
        match self {
            SystemType::Windows(_) => "spiced.exe",
            _ => "spiced",
        }
    }

    /// Get the runtime asset names for the current platform.
    ///
    /// Returns a list of possible asset names to try, in order of preference.
    /// This handles the naming change between versions:
    /// - v2.0+: models built-in, no `models_` variant exists
    /// - v1.11+/trunk: `spiced_metal_...` (models included by default)
    /// - v1.11 and earlier: `spiced_models_metal_...` (models suffix explicit)
    ///
    /// # Arguments
    /// * `flavor` - The flavor to install: "default" (auto-detect), or "cuda" (explicit CUDA)
    /// * `target_version` - The release tag (e.g. "v2.0.0-rc.1") to determine naming strategy
    pub fn runtime_asset_names(&self, flavor: &str, target_version: &str) -> Vec<String> {
        let mut names = Vec::new();

        // Determine the accelerator based on flavor
        let accelerator = match flavor {
            "cuda" => {
                // Explicit CUDA request - try to detect CUDA version
                #[cfg(target_os = "linux")]
                {
                    get_cuda_version()
                }
                #[cfg(not(target_os = "linux"))]
                {
                    tracing::warn!("CUDA flavor is only supported on Linux");
                    None
                }
            }
            _ => {
                // Default: auto-detect accelerator
                detect_accelerator()
            }
        };

        if let Some(accel) = accelerator {
            // New naming (v1.11+/trunk): accelerator without "models_" prefix
            names.push(format!(
                "{prefix}_{accel}_{os}_{arch}.tar.gz",
                prefix = self.runtime_asset_prefix(),
                os = self.os_type_name(),
                arch = self.arch()
            ));

            // Old naming (v1.11 and earlier): with "models_" prefix
            // v2+ no longer publishes a models variant, so skip it
            if !is_v2_or_later(target_version) {
                names.push(format!(
                    "{prefix}_models_{accel}_{os}_{arch}.tar.gz",
                    prefix = self.runtime_asset_prefix(),
                    os = self.os_type_name(),
                    arch = self.arch()
                ));
            }
        }

        // Fallback: base runtime without accelerator
        names.push(format!(
            "{prefix}_{os}_{arch}.tar.gz",
            prefix = self.runtime_asset_prefix(),
            os = self.os_type_name(),
            arch = self.arch()
        ));

        names
    }

    /// Get the CLI asset name for the current platform.
    pub fn cli_asset_name(&self) -> String {
        format!(
            "{prefix}_{os}_{arch}.tar.gz",
            prefix = self.cli_asset_prefix(),
            os = self.os_type_name(),
            arch = self.arch()
        )
    }
}

/// Check if a version tag represents v2.0 or later.
///
/// Parses the major version from tags like "v2.0.0", "v2.0.0-rc.1", "v10.1.0".
/// Returns `false` for unparseable tags (conservative fallback keeps old behavior).
fn is_v2_or_later(tag: &str) -> bool {
    let version_str = tag.strip_prefix('v').unwrap_or(tag);
    version_str
        .split('.')
        .next()
        .and_then(|major| major.parse::<u32>().ok())
        .is_some_and(|major| major >= 2)
}

/// Architecture name shared by the Rust target and the release asset.
fn get_rust_arch() -> &'static str {
    std::env::consts::ARCH
}

/// Detect hardware accelerator (Metal on macOS, CUDA on Linux).
fn detect_accelerator() -> Option<String> {
    #[cfg(target_os = "macos")]
    {
        if has_metal_device() {
            return Some("metal".to_string());
        }
    }

    #[cfg(target_os = "linux")]
    {
        if let Some(cuda_version) = get_cuda_version() {
            // Supported CUDA compute capabilities
            let supported = ["80", "86", "87", "89", "90"];
            if supported.contains(&cuda_version.as_str()) {
                return Some(format!("cuda_{cuda_version}"));
            }
            tracing::warn!(
                "Detected GPU with compute capability {cuda_version}, but this version is not supported for model acceleration. Falling back to CPU."
            );
        }
    }

    None
}

/// Check if the system has a Metal-capable GPU (macOS only).
#[cfg(target_os = "macos")]
fn has_metal_device() -> bool {
    use std::process::Command;

    tracing::debug!("Checking for Metal support via system_profiler");

    match Command::new("system_profiler")
        .args(["SPDisplaysDataType", "-detailLevel", "mini"])
        .output()
    {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            stdout.contains("Metal Support: Metal")
        }
        Err(_) => false,
    }
}

/// Get CUDA compute capability (Linux only).
#[cfg(target_os = "linux")]
fn get_cuda_version() -> Option<String> {
    use std::process::Command;

    tracing::debug!("Checking for CUDA via nvidia-smi");

    let output = Command::new("nvidia-smi")
        .args(["--query-gpu=compute_cap", "--format=csv,noheader"])
        .output()
        .ok()?;

    if !output.status.success() {
        return None;
    }

    let version = String::from_utf8_lossy(&output.stdout)
        .trim()
        .replace('.', "");

    if version.is_empty() {
        None
    } else {
        Some(version)
    }
}

#[cfg(test)]
mod tests {
    use super::super::GitHubClient;
    use super::{download_release_asset_with_fallback, get_release, upgrade_cli_in_place};
    use sha2::{Digest, Sha256};
    use std::collections::{HashMap, VecDeque};
    use std::io::{Read, Write};
    use std::path::{Path, PathBuf};
    use std::sync::{Arc, Mutex};
    use std::time::Duration;

    const TAG: &str = "v9.9.9";
    const RUNTIME_ASSET: &str = "spiced_linux_x86_64.tar.gz";
    const CLI_ASSET: &str = "spice_linux_x86_64.tar.gz";
    const SUMS: &str = "SHA256SUMS";
    /// Both markers are 16 bytes, so the stored archives have one length.
    const LEGIT_MARKER: &str = "LEGIT_RUNTIME_OK";
    const EVIL_MARKER: &str = "ATTACKER_RUNTIME";

    fn sha256_hex(bytes: &[u8]) -> String {
        format!("{:x}", Sha256::digest(bytes))
    }

    /// A tar.gz member of `contents`. Equal-length contents produce equal-length
    /// archives when the tar metadata is the same, which is what a size check
    /// treats as the published asset.
    fn tar_gz(entry_name: &str, contents: &[u8]) -> Vec<u8> {
        let encoder = flate2::write::GzEncoder::new(Vec::new(), flate2::Compression::none());
        let mut builder = tar::Builder::new(encoder);
        let mut header = tar::Header::new_gnu();
        header.set_size(contents.len() as u64);
        header.set_mode(0o755);
        header.set_mtime(0);
        header.set_cksum();
        builder
            .append_data(&mut header, entry_name, contents)
            .expect("tar entry is appended");
        builder
            .into_inner()
            .expect("tar builder is finished")
            .finish()
            .expect("gzip stream is finished")
    }

    fn member(entry_name: &str, marker: &str) -> (Vec<u8>, Vec<u8>) {
        assert_eq!(marker.len(), 16, "markers must be the same length");
        let mut payload = format!("#!/bin/sh\nprintf '%s\\n' {marker}\n").into_bytes();
        payload.resize(96, b'\n');
        let archive = tar_gz(entry_name, &payload);
        (archive, payload)
    }

    struct Pair {
        legit_archive: Vec<u8>,
        legit_payload: Vec<u8>,
        evil_archive: Vec<u8>,
        evil_payload: Vec<u8>,
    }

    fn same_size_pair(entry_name: &str) -> Pair {
        let (legit_archive, legit_payload) = member(entry_name, LEGIT_MARKER);
        let (evil_archive, evil_payload) = member(entry_name, EVIL_MARKER);
        assert_eq!(
            legit_archive.len(),
            evil_archive.len(),
            "the substitute must be the same size the release records"
        );
        assert_ne!(legit_archive, evil_archive);
        assert_ne!(sha256_hex(&legit_archive), sha256_hex(&evil_archive));
        Pair {
            legit_archive,
            legit_payload,
            evil_archive,
            evil_payload,
        }
    }

    struct Routes {
        bodies: Mutex<HashMap<String, VecDeque<Vec<u8>>>>,
    }

    fn spawn_server(routes: Arc<Routes>) -> String {
        let listener = std::net::TcpListener::bind("127.0.0.1:0").expect("bind");
        let addr = listener.local_addr().expect("local addr");
        std::thread::spawn(move || {
            for conn in listener.incoming() {
                let Ok(mut conn) = conn else { continue };
                let routes = Arc::clone(&routes);
                std::thread::spawn(move || {
                    let _ = conn.set_read_timeout(Some(Duration::from_secs(5)));
                    let mut buf = Vec::new();
                    let mut tmp = [0u8; 1024];
                    loop {
                        match conn.read(&mut tmp) {
                            Ok(0) => return,
                            Ok(n) => {
                                buf.extend_from_slice(&tmp[..n]);
                                if buf.windows(4).any(|window| window == b"\r\n\r\n") {
                                    break;
                                }
                            }
                            Err(_) => return,
                        }
                    }
                    let text = String::from_utf8_lossy(&buf);
                    let path = text
                        .lines()
                        .next()
                        .and_then(|line| line.split_whitespace().nth(1))
                        .unwrap_or("/");
                    let path = path.split('?').next().unwrap_or(path);
                    let body = {
                        let mut map = routes.bodies.lock().expect("routes");
                        let Some(queue) = map.get_mut(path) else {
                            let resp = b"HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n";
                            let _ = conn.write_all(resp);
                            return;
                        };
                        if queue.len() > 1 {
                            queue.pop_front().expect("queued body")
                        } else {
                            queue.front().expect("body").clone()
                        }
                    };
                    let header = format!(
                        "HTTP/1.1 200 OK\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
                        body.len()
                    );
                    let _ = conn.write_all(header.as_bytes());
                    let _ = conn.write_all(&body);
                });
            }
        });
        format!("http://{addr}")
    }

    fn asset_json(
        id: u64,
        name: &str,
        size: u64,
        download_url: &str,
        digest: Option<&str>,
    ) -> serde_json::Value {
        let mut value = serde_json::json!({
            "url": "",
            "id": id,
            "name": name,
            "content_type": "application/gzip",
            "size": size,
            "download_count": 0,
            "browser_download_url": download_url,
        });
        if let Some(digest) = digest {
            value["digest"] = serde_json::Value::String(digest.to_string());
        }
        value
    }

    /// What the asset URL returns. The release metadata always describes
    /// `pair.legit_archive` (its size, and its sha256 when `record_sha256`).
    enum Download {
        /// Every fetch is the substitute. Its length is the recorded size.
        Substitute,
        /// The first fetch is the recorded archive. A later fetch is the substitute.
        RecordedThenSubstitute,
        /// The fetch is the recorded archive, and the release records no sha256.
        RecordedWithoutSha256,
    }

    struct Fixture {
        base: String,
        asset_name: &'static str,
        pair: Pair,
    }

    fn serve(asset_name: &'static str, entry_name: &str, download: Download) -> Fixture {
        // The env opt-out must not be inherited from the test process.
        std::env::remove_var("SPICE_INSTALL_ALLOW_UNVERIFIED");
        let pair = same_size_pair(entry_name);
        let record_sha256 = !matches!(download, Download::RecordedWithoutSha256);
        let bodies = match download {
            Download::Substitute => vec![pair.evil_archive.clone()],
            Download::RecordedThenSubstitute => {
                vec![pair.legit_archive.clone(), pair.evil_archive.clone()]
            }
            Download::RecordedWithoutSha256 => vec![pair.legit_archive.clone()],
        };
        let recorded = sha256_hex(&pair.legit_archive);
        let routes = Arc::new(Routes {
            bodies: Mutex::new(HashMap::new()),
        });
        let base = spawn_server(Arc::clone(&routes));
        let asset_url = format!("{base}/download/{asset_name}");
        let sums_url = format!("{base}/download/{SUMS}");
        let sums = format!("{recorded}  {asset_name}\n");
        let digest = record_sha256.then(|| format!("sha256:{recorded}"));
        let mut assets = vec![asset_json(
            1,
            asset_name,
            pair.legit_archive.len() as u64,
            &asset_url,
            digest.as_deref(),
        )];
        if record_sha256 {
            assets.push(asset_json(2, SUMS, sums.len() as u64, &sums_url, None));
        }
        let release_path = format!("/repos/spiceai/spiceai/releases/tags/{TAG}");
        {
            let mut map = routes.bodies.lock().expect("routes");
            map.insert(
                release_path,
                VecDeque::from([serde_json::to_vec(&serde_json::json!({
                    "url": "",
                    "html_url": "",
                    "assets_url": "",
                    "tag_name": TAG,
                    "name": TAG,
                    "draft": false,
                    "prerelease": false,
                    "created_at": "2026-01-01T00:00:00Z",
                    "published_at": "2026-01-01T00:00:00Z",
                    "assets": assets,
                }))
                .expect("release json")]),
            );
            map.insert(format!("/download/{asset_name}"), VecDeque::from(bodies));
            if record_sha256 {
                map.insert(
                    format!("/download/{SUMS}"),
                    VecDeque::from([sums.into_bytes()]),
                );
            }
        }
        Fixture {
            base,
            asset_name,
            pair,
        }
    }

    fn client(base: &str) -> GitHubClient {
        GitHubClient::new("spiceai", "spiceai").with_api_base(base)
    }

    async fn release_of(fixture: &Fixture) -> super::RepoRelease {
        get_release(&client(&fixture.base), TAG)
            .await
            .expect("the release metadata is fetched before the asset")
    }

    fn assert_dir_empty(dest: &Path) {
        let left: Vec<_> = std::fs::read_dir(dest)
            .expect("destination is readable")
            .map(|entry| entry.expect("entry").file_name())
            .collect();
        assert!(
            left.is_empty(),
            "refusing the download must not leave a file behind: {left:?}"
        );
    }

    /// `spice install`, the runtime download in `spice upgrade`, and the install
    /// `spice run` performs when no runtime is present all call
    /// `download_release_asset_with_fallback` and then use whatever it extracted.
    #[tokio::test]
    async fn install_upgrade_and_run_refuse_a_same_size_substituted_runtime() {
        let fixture = serve(RUNTIME_ASSET, "spiced", Download::Substitute);
        let release = release_of(&fixture).await;
        let dest = tempfile::tempdir().expect("dest");
        let result = download_release_asset_with_fallback(
            &client(&fixture.base),
            &release,
            &[fixture.asset_name.to_string()],
            dest.path(),
        )
        .await;
        let installed = dest.path().join("spiced");
        if installed.exists() {
            let bytes = std::fs::read(&installed).expect("installed runtime is readable");
            // install.rs marks this path executable, then spice run starts it
            // with Command::new (context.rs get_run_cmd).
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;
                let _ =
                    std::fs::set_permissions(&installed, std::fs::Permissions::from_mode(0o755));
            }
            let ran = std::process::Command::new(&installed).output();
            panic!(
                "a same-size substitute was installed at {} (attacker payload: {}). spice run starts that path. spawn: {ran:?}. download: {result:?}",
                installed.display(),
                bytes == fixture.pair.evil_payload,
            );
        }
        assert!(
            result.is_err(),
            "a same-size substitute must not be accepted: {result:?}"
        );
        assert_dir_empty(dest.path());
    }

    /// The bytes that were checked have to be the bytes that are extracted.
    /// A second download of the same URL, after the check, must not be installed.
    /// A same-size body that does not match the recorded sha256 must be refused.
    #[tokio::test]
    async fn checked_runtime_bytes_are_the_bytes_extracted() {
        let substitute = serve(RUNTIME_ASSET, "spiced", Download::Substitute);
        let release = release_of(&substitute).await;
        let dest = tempfile::tempdir().expect("dest");
        let mismatch = download_release_asset_with_fallback(
            &client(&substitute.base),
            &release,
            &[substitute.asset_name.to_string()],
            dest.path(),
        )
        .await;
        assert!(
            mismatch.is_err(),
            "a same-size substitute must be refused, not extracted: {mismatch:?}"
        );
        assert_dir_empty(dest.path());

        let fixture = serve(RUNTIME_ASSET, "spiced", Download::RecordedThenSubstitute);
        let release = release_of(&fixture).await;
        let dest = tempfile::tempdir().expect("dest");
        let result = download_release_asset_with_fallback(
            &client(&fixture.base),
            &release,
            &[fixture.asset_name.to_string()],
            dest.path(),
        )
        .await;
        let installed = dest.path().join("spiced");
        if let Ok(downloaded) = result {
            let bytes = std::fs::read(&installed).unwrap_or_default();
            assert_eq!(
                bytes, fixture.pair.legit_payload,
                "asset {downloaded} was extracted from a later download of the same URL, not from the bytes whose sha256 matched"
            );
            assert_ne!(bytes, fixture.pair.evil_payload);
        } else {
            assert!(
                !installed.exists(),
                "a refused download must not leave the substituted runtime"
            );
            assert_dir_empty(dest.path());
        }
    }

    /// No sha256 is recorded for the asset. A matching size is not enough.
    #[tokio::test]
    async fn a_release_that_records_no_sha256_is_not_installed() {
        let fixture = serve(RUNTIME_ASSET, "spiced", Download::RecordedWithoutSha256);
        let release = release_of(&fixture).await;
        let dest = tempfile::tempdir().expect("dest");
        let result = download_release_asset_with_fallback(
            &client(&fixture.base),
            &release,
            &[fixture.asset_name.to_string()],
            dest.path(),
        )
        .await;
        assert!(
            result.is_err(),
            "a download with no recorded sha256 must be refused: {result:?}"
        );
        assert_dir_empty(dest.path());
    }

    struct RestoreExe {
        path: PathBuf,
        bytes: Vec<u8>,
        mode: u32,
    }

    impl RestoreExe {
        /// Write the original bytes back when `upgrade_cli_in_place` replaced the
        /// path. Writing the running inode fails with ETXTBSY, and that inode is
        /// still the original binary, so it is left untouched.
        fn restore_if_replaced(&self) {
            let current = std::fs::read(&self.path).unwrap_or_default();
            if current == self.bytes {
                return;
            }
            std::fs::write(&self.path, &self.bytes).expect("restore cli");
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;
                std::fs::set_permissions(&self.path, std::fs::Permissions::from_mode(self.mode))
                    .expect("restore cli mode");
            }
        }
    }

    impl Drop for RestoreExe {
        fn drop(&mut self) {
            let current = std::fs::read(&self.path).unwrap_or_default();
            if current != self.bytes {
                let _ = std::fs::write(&self.path, &self.bytes);
                #[cfg(unix)]
                {
                    use std::os::unix::fs::PermissionsExt;
                    let _ = std::fs::set_permissions(
                        &self.path,
                        std::fs::Permissions::from_mode(self.mode),
                    );
                }
            }
        }
    }

    fn hold_current_exe() -> RestoreExe {
        let path = std::env::current_exe().expect("current exe");
        let bytes = std::fs::read(&path).expect("current exe bytes");
        #[cfg(unix)]
        let mode = {
            use std::os::unix::fs::PermissionsExt;
            std::fs::metadata(&path)
                .expect("metadata")
                .permissions()
                .mode()
        };
        #[cfg(not(unix))]
        let mode = 0;
        RestoreExe { path, bytes, mode }
    }

    /// `spice upgrade` replaces the running CLI through `upgrade_cli_in_place`
    /// after the same download used for the runtime.
    #[tokio::test]
    async fn upgrade_refuses_a_same_size_substituted_cli() {
        static LOCK: Mutex<()> = Mutex::new(());
        let _guard = LOCK.lock().expect("upgrade lock");
        let restore = hold_current_exe();

        let fixture = serve(CLI_ASSET, "spice", Download::Substitute);
        let release = release_of(&fixture).await;
        let mismatch = upgrade_cli_in_place(&client(&fixture.base), &release, CLI_ASSET).await;
        let after_mismatch = std::fs::read(&restore.path).unwrap_or_default();
        restore.restore_if_replaced();
        assert!(
            mismatch.is_err(),
            "spice upgrade must refuse a same-size substitute CLI: {mismatch:?}"
        );
        assert_eq!(
            after_mismatch, restore.bytes,
            "spice upgrade must not replace the CLI before it refuses the download"
        );

        let fixture = serve(CLI_ASSET, "spice", Download::RecordedThenSubstitute);
        let release = release_of(&fixture).await;
        let checked = upgrade_cli_in_place(&client(&fixture.base), &release, CLI_ASSET).await;
        let after_check = std::fs::read(&restore.path).unwrap_or_default();
        restore.restore_if_replaced();
        if checked.is_ok() {
            assert_eq!(
                after_check, fixture.pair.legit_payload,
                "spice upgrade installed a later download of the CLI instead of the bytes whose sha256 matched"
            );
        } else {
            assert_eq!(
                after_check, restore.bytes,
                "a refused CLI upgrade must leave the existing binary unchanged"
            );
        }
    }
}
