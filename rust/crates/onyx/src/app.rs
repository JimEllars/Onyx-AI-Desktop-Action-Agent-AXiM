use std::time::Duration;
use tokio::time;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use telemetry::send_session_heartbeat;

pub struct App {
    pub heartbeat_status: Arc<AtomicBool>,
}

impl Default for App {
    fn default() -> Self {
        Self::new()
    }
}

impl App {
    pub fn new() -> Self {
        Self {
            heartbeat_status: Arc::new(AtomicBool::new(true)),
        }
    }

    pub fn start_heartbeat_task(&self, session_id: String, user_id: String) {
        let status = self.heartbeat_status.clone();
        tokio::spawn(async move {
            let mut interval = time::interval(Duration::from_secs(60));
            loop {
                interval.tick().await;
                match send_session_heartbeat(&session_id, &user_id).await {
                    Ok(_) => {
                        status.store(true, Ordering::SeqCst);
                    }
                    Err(_) => {
                        status.store(false, Ordering::SeqCst);
                    }
                }
            }
        });
    }
}
