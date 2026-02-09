import http from "http";

const url = process.env.SERVER_HEALTH_URL || "http://127.0.0.1:3001/health";
const maxAttempts = Number(process.env.SERVER_HEALTH_MAX_ATTEMPTS) || 30;
const intervalMs = Number(process.env.SERVER_HEALTH_INTERVAL_MS) || 500;

let attempts = 0;

const scheduleRetry = (message) => {
  attempts += 1;
  if (message) {
    console.error(message);
  }
  if (attempts >= maxAttempts) {
    console.error(`Health check failed after ${maxAttempts} attempts.`);
    process.exit(1);
  }
  setTimeout(ping, intervalMs);
};

const ping = () => {
  const request = http.get(url, (response) => {
    response.resume();
    if (response.statusCode === 200) {
      console.log("Health check succeeded.");
      process.exit(0);
    }
    scheduleRetry(`Health check returned ${response.statusCode ?? "unknown"} status.`);
  });

  request.on("error", (error) => {
    scheduleRetry(`Health check failed: ${error.message}`);
  });
};

ping();
