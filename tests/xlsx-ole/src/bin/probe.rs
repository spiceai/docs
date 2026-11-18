use std::env;
use xlsx_ole_bounds::{open_xlsx, self_referential_difat};

fn main() {
    let bytes: u64 = 64 * 1024 * 1024;
    let limit = libc::rlimit {
        rlim_cur: bytes,
        rlim_max: bytes,
    };
    let rc = unsafe { libc::setrlimit(libc::RLIMIT_AS, &limit) };
    if rc != 0 {
        eprintln!("setrlimit failed: {}", std::io::Error::last_os_error());
        std::process::exit(4);
    }

    let mode = env::args().nth(1).unwrap_or_default();
    if mode != "alloc" {
        eprintln!("unknown mode {mode}");
        std::process::exit(4);
    }

    let workbook = self_referential_difat();
    eprintln!("file_len={}", workbook.len());
    match std::panic::catch_unwind(|| open_xlsx(&workbook)) {
        Ok(Err(error)) => {
            eprintln!("error={error}");
            std::process::exit(0);
        }
        Ok(Ok(_)) => {
            eprintln!("opened");
            std::process::exit(2);
        }
        Err(_) => {
            eprintln!("panic");
            std::process::exit(3);
        }
    }
}
