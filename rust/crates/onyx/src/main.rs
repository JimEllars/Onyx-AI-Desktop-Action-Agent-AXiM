use std::time::Duration;
use tokio::time;

#[tokio::main]
async fn main() {
    println!("Starting Onyx...");
    // Keep app running for testing
    let mut interval = time::interval(Duration::from_secs(1));
    loop {
        interval.tick().await;
    }
}
