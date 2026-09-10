
use serde::Serialize;
use reqwest::Client;
use std::time::Duration;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

const DEFAULT_EDGE_API_URL: &str = "https://onyx-edge.axim.us.com";

#[derive(Debug)]
pub enum TelemetryError {
    RequestFailed(reqwest::Error),
    SerializationError(serde_json::Error),
}

impl From<reqwest::Error> for TelemetryError {
    fn from(err: reqwest::Error) -> Self {
        TelemetryError::RequestFailed(err)
    }
}

impl From<serde_json::Error> for TelemetryError {
    fn from(err: serde_json::Error) -> Self {
        TelemetryError::SerializationError(err)
    }
}

#[derive(Serialize)]
struct HeartbeatPayload<'a> {
    session_id: &'a str,
    user_id: &'a str,
    client_version: &'a str,
}

#[derive(Serialize)]
pub struct LogEntry {
    pub level: String,
    pub message: String,
}

#[derive(Serialize, Clone)]
pub struct TelemetryPayload {
    pub cpu: f64,
    pub ram: f64,
    #[serde(rename = "latencyMs")]
    pub latency_ms: f64,
}

pub async fn send_session_heartbeat(session_id: &str, user_id: &str) -> Result<(), TelemetryError> {
    let client = Client::new();
    let url = format!(
        "{}/api/v1/session/heartbeat",
        option_env!("ONYX_EDGE_API_URL").unwrap_or(DEFAULT_EDGE_API_URL).trim_end_matches('/')
    );
    let payload = HeartbeatPayload {
        session_id,
        user_id,
        client_version: env!("CARGO_PKG_VERSION"),
    };

    let response = client.post(&url)
        .json(&payload)
        .send()
        .await?;
    response.error_for_status()?;

    Ok(())
}

pub async fn send_telemetry_batch(logs: &[LogEntry]) -> Result<(), TelemetryError> {
    let client = Client::new();
    let url = format!(
        "{}/api/v1/telemetry/batch",
        option_env!("ONYX_EDGE_API_URL").unwrap_or(DEFAULT_EDGE_API_URL).trim_end_matches('/')
    );

    let response = client.post(&url)
        .json(&logs)
        .send()
        .await?;
    response.error_for_status()?;

    Ok(())
}

pub async fn send_telemetry_ingest(payload: &TelemetryPayload) -> Result<(), TelemetryError> {
    let client = Client::new();
    let url = format!(
        "{}/api/telemetry/ingest",
        option_env!("ONYX_EDGE_API_URL").unwrap_or(DEFAULT_EDGE_API_URL).trim_end_matches('/')
    );

    let response = client.post(&url)
        .header("Authorization", "Bearer MOCK_TOKEN")
        .json(&payload)
        .send()
        .await?;
    response.error_for_status()?;

    Ok(())
}

pub fn spawn_telemetry_dispatch(edge_health: Arc<AtomicBool>) {
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_millis(1000));
        let mut cpu = 10.0;
        let mut ram = 120.0;

        loop {
            interval.tick().await;

            // Mock vitals sampling
            cpu = f64::min(cpu + 1.0, 100.0);
            ram = f64::min(ram + 2.0, 1024.0);
            let payload = TelemetryPayload {
                cpu,
                ram,
                latency_ms: 15.0,
            };

            match send_telemetry_ingest(&payload).await {
                Ok(_) => {
                    edge_health.store(true, Ordering::SeqCst);
                }
                Err(_) => {
                    edge_health.store(false, Ordering::SeqCst);
                    tokio::time::sleep(Duration::from_secs(5)).await;
                }
            }
        }
    });
}
