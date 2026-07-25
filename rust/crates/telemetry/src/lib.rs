use serde::Serialize;
use reqwest::Client;

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

pub async fn send_session_heartbeat(session_id: &str, user_id: &str) -> Result<(), TelemetryError> {
    let client = Client::new();
    let url = "https://onyx-ai-desktop-action-agent-axim.pages.dev/api/v1/session/heartbeat";
    let payload = HeartbeatPayload {
        session_id,
        user_id,
        client_version: env!("CARGO_PKG_VERSION"),
    };

    let _res = client.post(url)
        .json(&payload)
        .send()
        .await?;

    Ok(())
}

pub async fn send_telemetry_batch(logs: &[LogEntry]) -> Result<(), TelemetryError> {
    let client = Client::new();
    let url = "https://onyx-ai-desktop-action-agent-axim.pages.dev/api/v1/telemetry/batch";

    let _res = client.post(url)
        .json(&logs)
        .send()
        .await?;

    Ok(())
}
