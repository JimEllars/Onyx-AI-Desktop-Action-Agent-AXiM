use std::time::Duration;
use tokio::time;
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::Arc;
use telemetry::send_session_heartbeat;

pub struct App {
    pub heartbeat_status: Arc<AtomicBool>,
    pub edge_health: Arc<AtomicBool>,
    pub queue_depth: Arc<AtomicUsize>,
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
            edge_health: Arc::new(AtomicBool::new(true)),
            queue_depth: Arc::new(AtomicUsize::new(0)),
        }
    }

    pub fn start_heartbeat_task(&self, session_id: String, user_id: String) {
        let status = self.heartbeat_status.clone();
        let edge_health = self.edge_health.clone();
        tokio::spawn(async move {
            let mut interval = time::interval(Duration::from_secs(60));
            loop {
                interval.tick().await;
                match send_session_heartbeat(&session_id, &user_id).await {
                    Ok(_) => {
                        status.store(true, Ordering::SeqCst);
                        edge_health.store(true, Ordering::SeqCst);
                    }
                    Err(_) => {
                        status.store(false, Ordering::SeqCst);
                        edge_health.store(false, Ordering::SeqCst);
                    }
                }
            }
        });
    }
}
