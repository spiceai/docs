use std::process::Command;
use xlsx_ole_bounds::{open_xlsx, self_referential_difat, short_directory_stream};

#[test]
fn short_ole_directory_stream_is_an_error() {
    let bytes = short_directory_stream();
    assert!(
        bytes.len() < 2048,
        "crafted file is {} bytes",
        bytes.len()
    );
    match std::panic::catch_unwind(|| open_xlsx(&bytes)) {
        Ok(Err(_)) => {}
        Ok(Ok(_)) => panic!("malformed OLE workbook was parsed as a spreadsheet"),
        Err(payload) => {
            let message = payload
                .downcast_ref::<String>()
                .map(String::as_str)
                .or_else(|| payload.downcast_ref::<&str>().copied())
                .unwrap_or("panic");
            panic!(
                "parser panicked on a {}-byte workbook: {message}",
                bytes.len()
            );
        }
    }
}

#[test]
fn self_referential_difat_stays_within_address_limit() {
    let bytes = self_referential_difat();
    assert_eq!(bytes.len(), 512);
    let output = Command::new(env!("CARGO_BIN_EXE_probe"))
        .arg("alloc")
        .output()
        .expect("probe process");
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        output.status.success(),
        "a 512-byte workbook did not stay inside a 64 MiB address space: status={:?} stderr={stderr}",
        output.status
    );
}
