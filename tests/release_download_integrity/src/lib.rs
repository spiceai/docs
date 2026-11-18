//! Spice CLI release download path from tag v2.4.3
//! (`40af136fc6989bf19a685cb58d6a08e5509e903b`).
//!
//! `spice install` and the runtime half of `spice upgrade` call
//! `download_release_asset_with_fallback`. `spice upgrade` replaces the CLI
//! through `upgrade_cli_in_place`. `spice run` installs through the same
//! runtime download when no runtime is already present, then starts that file.

pub mod github;
