//! Spec for the Spice 2.4.2 FTP download path.
//!
//! `read_ftp_data` is the body of `read_ftp_data` in
//! `crates/runtime-object-store/src/store/ftp.rs` at spiceai/spiceai tag v2.4.2.
//! It reads a file with suppaftp 6.3.0 `retr_as_stream` and returns the bytes
//! it got. These tests require a transfer the server marks as failed to be an
//! error, so they fail until that function stops returning the partial body.

#[cfg(test)]
mod tests {
    use std::io::{ErrorKind, Read, Write};
    use std::net::{Shutdown, TcpListener, TcpStream};
    use std::os::unix::io::AsRawFd;
    use std::sync::mpsc::{self, Receiver};
    use std::thread::{self, JoinHandle};
    use std::time::Duration;

    use futures::AsyncReadExt;
    use suppaftp::types::FileType;
    use suppaftp::AsyncFtpStream;

    const FULL_CSV: &[u8] = b"id,name\n1,alpha\n2,bravo\n3,charlie\n";
    const PREFIX: &[u8] = b"id,name\n1,alpha\n";

    /// Spice v2.4.2 `read_ftp_data`.
    async fn read_ftp_data(
        mut client: AsyncFtpStream,
        location: String,
        start: usize,
        read_size: usize,
    ) -> Result<Vec<u8>, String> {
        client
            .transfer_type(FileType::Binary)
            .await
            .map_err(|e| e.to_string())?;
        client
            .resume_transfer(start)
            .await
            .map_err(|e| e.to_string())?;
        let mut stream = client
            .retr_as_stream(location)
            .await
            .map_err(|e| e.to_string())?;

        let mut result = Vec::with_capacity(read_size);
        let mut buf = vec![0; 4096];
        let mut total = 0;

        loop {
            if total >= read_size {
                break;
            }
            let n = stream.read(&mut buf).await.map_err(|e| e.to_string())?;
            if n == 0 {
                break;
            }
            let bytes_to_take = (read_size - total).min(n);
            result.extend_from_slice(&buf[..bytes_to_take]);
            total += n;
        }
        Ok(result)
    }

    fn data_rows(bytes: &[u8]) -> usize {
        let text = String::from_utf8_lossy(bytes);
        let mut lines = text.split_inclusive('\n').filter(|line| line.ends_with('\n'));
        let _header = lines.next();
        lines.count()
    }

    fn write_all(socket: &mut TcpStream, bytes: &[u8]) {
        socket.write_all(bytes).expect("write the control reply");
    }

    fn read_line(socket: &mut TcpStream, buf: &mut Vec<u8>) -> Option<String> {
        buf.clear();
        let mut byte = [0u8; 1];
        loop {
            match socket.read(&mut byte) {
                Ok(0) => return None,
                Ok(_) => {
                    buf.push(byte[0]);
                    if byte[0] == b'\n' {
                        break;
                    }
                }
                Err(error)
                    if error.kind() == ErrorKind::WouldBlock
                        || error.kind() == ErrorKind::TimedOut =>
                {
                    return None;
                }
                Err(_) => return None,
            }
        }
        Some(String::from_utf8_lossy(buf).trim().trim_end_matches('\r').to_string())
    }

    fn pasv_reply(port: u16) -> String {
        format!(
            "227 Entering Passive Mode (127,0,0,1,{},{})\r\n",
            port >> 8,
            port & 0xff
        )
    }

    fn set_buf(stream: &TcpStream, option: libc::c_int) {
        unsafe {
            let small: libc::c_int = 1024;
            libc::setsockopt(
                stream.as_raw_fd(),
                libc::SOL_SOCKET,
                option,
                &small as *const libc::c_int as *const libc::c_void,
                std::mem::size_of::<libc::c_int>() as libc::socklen_t,
            );
        }
    }

    fn abort_with_rst(stream: TcpStream) {
        let linger = libc::linger {
            l_onoff: 1,
            l_linger: 0,
        };
        unsafe {
            libc::setsockopt(
                stream.as_raw_fd(),
                libc::SOL_SOCKET,
                libc::SO_LINGER,
                &linger as *const libc::linger as *const libc::c_void,
                std::mem::size_of::<libc::linger>() as libc::socklen_t,
            );
        }
        drop(stream);
    }

    struct Session {
        port: u16,
        reply: Receiver<String>,
        server: JoinHandle<()>,
    }

    /// Send `body` on the data connection, close it, then send `completion`.
    fn server_sends(body: Vec<u8>, completion: &'static str) -> Session {
        let (tx, rx) = mpsc::channel();
        let control = TcpListener::bind("127.0.0.1:0").expect("bind the control listener");
        let port = control.local_addr().expect("control address").port();
        let server = thread::spawn(move || {
            let (mut socket, _) = control.accept().expect("accept the control connection");
            socket
                .set_read_timeout(Some(Duration::from_secs(2)))
                .expect("read timeout");
            write_all(&mut socket, b"220 ready\r\n");
            let mut buf = Vec::new();
            loop {
                let Some(line) = read_line(&mut socket, &mut buf) else {
                    break;
                };
                let verb = line.split(' ').next().unwrap_or_default().to_ascii_uppercase();
                match verb.as_str() {
                    "USER" => write_all(&mut socket, b"331 password required\r\n"),
                    "PASS" => write_all(&mut socket, b"230 logged in\r\n"),
                    "TYPE" => write_all(&mut socket, b"200 type set\r\n"),
                    "REST" => write_all(&mut socket, b"350 restarting\r\n"),
                    "PASV" => {
                        let data = TcpListener::bind("127.0.0.1:0").expect("bind the data listener");
                        let data_port = data.local_addr().expect("data address").port();
                        write_all(&mut socket, pasv_reply(data_port).as_bytes());
                        let next = read_line(&mut socket, &mut buf).expect("RETR follows PASV");
                        let next_verb = next.split(' ').next().unwrap_or_default().to_ascii_uppercase();
                        assert_eq!(next_verb, "RETR");
                        write_all(&mut socket, b"150 sending\r\n");
                        let (mut data_sock, _) = data.accept().expect("accept the data connection");
                        data_sock.write_all(&body).expect("send the file body");
                        let _ = data_sock.shutdown(Shutdown::Both);
                        drop(data_sock);
                        write_all(&mut socket, format!("{completion}\r\n").as_bytes());
                        let _ = tx.send(completion.to_string());
                    }
                    "QUIT" => {
                        write_all(&mut socket, b"221 bye\r\n");
                        break;
                    }
                    _ => write_all(&mut socket, b"502 not implemented\r\n"),
                }
            }
        });
        Session {
            port,
            reply: rx,
            server,
        }
    }

    /// Honest server writes `payload`. An on-path forwarder delivers `keep` bytes
    /// and a FIN to the client, then resets the server's data socket.
    fn server_cut_on_path(payload: Vec<u8>, keep: usize) -> Session {
        let (tx, rx) = mpsc::channel();
        let control = TcpListener::bind("127.0.0.1:0").expect("bind the control listener");
        let port = control.local_addr().expect("control address").port();
        let server = thread::spawn(move || {
            let (mut socket, _) = control.accept().expect("accept the control connection");
            socket
                .set_read_timeout(Some(Duration::from_secs(2)))
                .expect("read timeout");
            write_all(&mut socket, b"220 ready\r\n");
            let mut buf = Vec::new();
            loop {
                let Some(line) = read_line(&mut socket, &mut buf) else {
                    break;
                };
                let verb = line.split(' ').next().unwrap_or_default().to_ascii_uppercase();
                match verb.as_str() {
                    "USER" => write_all(&mut socket, b"331 password required\r\n"),
                    "PASS" => write_all(&mut socket, b"230 logged in\r\n"),
                    "TYPE" => write_all(&mut socket, b"200 type set\r\n"),
                    "REST" => write_all(&mut socket, b"350 restarting\r\n"),
                    "PASV" => {
                        let data = TcpListener::bind("127.0.0.1:0").expect("bind the data listener");
                        let data_port = data.local_addr().expect("data address").port();
                        write_all(&mut socket, pasv_reply(data_port).as_bytes());
                        let next = read_line(&mut socket, &mut buf).expect("RETR follows PASV");
                        let next_verb = next.split(' ').next().unwrap_or_default().to_ascii_uppercase();
                        assert_eq!(next_verb, "RETR");
                        write_all(&mut socket, b"150 sending\r\n");
                        let (to_client, _) = data.accept().expect("accept the data connection");

                        let pair = TcpListener::bind("127.0.0.1:0").expect("bind the cut pair");
                        let pair_addr = pair.local_addr().expect("cut pair address");
                        let mut server_end = TcpStream::connect(pair_addr).expect("dial the cut pair");
                        let (mut from_server, _) = pair.accept().expect("accept the cut pair");
                        set_buf(&server_end, libc::SO_SNDBUF);
                        set_buf(&from_server, libc::SO_RCVBUF);

                        let payload_for_server = payload.clone();
                        let writer = thread::spawn(move || {
                            server_end
                                .set_write_timeout(Some(Duration::from_secs(2)))
                                .expect("write timeout");
                            server_end.write_all(&payload_for_server).is_ok()
                        });

                        let mut forwarded = 0usize;
                        let mut scratch = [0u8; 64];
                        let mut to_client = to_client;
                        while forwarded < keep {
                            let n = from_server.read(&mut scratch).expect("read the honest body");
                            if n == 0 {
                                break;
                            }
                            let take = (keep - forwarded).min(n);
                            to_client
                                .write_all(&scratch[..take])
                                .expect("forward the prefix");
                            forwarded += take;
                        }
                        let _ = to_client.shutdown(Shutdown::Both);
                        drop(to_client);
                        abort_with_rst(from_server);
                        let server_wrote_all = writer.join().expect("honest writer");
                        let completion = if server_wrote_all {
                            "226 transfer complete"
                        } else {
                            "426 transfer aborted"
                        };
                        write_all(&mut socket, format!("{completion}\r\n").as_bytes());
                        let _ = tx.send(completion.to_string());
                    }
                    "QUIT" => {
                        write_all(&mut socket, b"221 bye\r\n");
                        break;
                    }
                    _ => write_all(&mut socket, b"502 not implemented\r\n"),
                }
            }
        });
        Session {
            port,
            reply: rx,
            server,
        }
    }

    async fn login(port: u16) -> Result<AsyncFtpStream, String> {
        let mut client = AsyncFtpStream::connect(format!("127.0.0.1:{port}"))
            .await
            .map_err(|error| error.to_string())?;
        client
            .login("user", "pass")
            .await
            .map_err(|error| error.to_string())?;
        Ok(client)
    }

    async fn download(port: u16, read_size: usize) -> Result<Vec<u8>, String> {
        let client = login(port).await?;
        read_ftp_data(client, "daily.csv".to_string(), 0, read_size).await
    }

    fn finish(session: Session) -> String {
        let reply = session
            .reply
            .recv_timeout(Duration::from_secs(3))
            .expect("the server sends a completion reply");
        session.server.join().expect("the server thread");
        reply
    }

    fn assert_failed_transfer_is_not_the_file(result: Result<Vec<u8>, String>, reply: &str) {
        assert!(
            reply.starts_with("426") || reply.starts_with("451"),
            "the server has to be the side that marks the transfer failed, got {reply}"
        );
        match result {
            Err(_) => {}
            Ok(bytes) => panic!(
                "a transfer the server marked failed ({reply}) was returned as the file: {} bytes, {} data rows, body {:?}",
                bytes.len(),
                data_rows(&bytes),
                String::from_utf8_lossy(&bytes)
            ),
        }
    }

    #[tokio::test]
    async fn server_426_after_a_prefix_is_not_returned_as_the_file() {
        let session = server_sends(PREFIX.to_vec(), "426 transfer aborted");
        let result = download(session.port, FULL_CSV.len()).await;
        let reply = finish(session);
        assert_failed_transfer_is_not_the_file(result, &reply);
    }

    #[tokio::test]
    async fn server_451_after_a_prefix_is_not_returned_as_the_file() {
        let session = server_sends(PREFIX.to_vec(), "451 local error in processing");
        let result = download(session.port, FULL_CSV.len()).await;
        let reply = finish(session);
        assert_failed_transfer_is_not_the_file(result, &reply);
    }

    #[tokio::test]
    async fn on_path_cut_that_makes_the_server_send_426_is_not_returned_as_the_file() {
        let mut payload = PREFIX.to_vec();
        while payload.len() < 8 * 1024 * 1024 {
            payload.extend_from_slice(b"9,zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz\n");
        }
        let read_size = payload.len();
        let session = server_cut_on_path(payload, PREFIX.len());
        let result = download(session.port, read_size).await;
        let reply = finish(session);
        assert_failed_transfer_is_not_the_file(result, &reply);
    }

    #[tokio::test]
    async fn completed_transfer_returns_every_row() {
        let session = server_sends(FULL_CSV.to_vec(), "226 transfer complete");
        let result = download(session.port, FULL_CSV.len()).await;
        let reply = finish(session);
        assert_eq!(reply, "226 transfer complete");
        assert_eq!(result.expect("a completed transfer is the file"), FULL_CSV);
    }
}
