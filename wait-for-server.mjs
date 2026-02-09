import http from "http";

const url = process.env.SERVER_HEALTH_URL || "http://127.0.0.1:3001/health";
const maxAttempts = Number(process.env.SERVER_HEALTH_MAX_ATTEMPTS) || 30;
const intervalMs = Number(process.env.SERVER_HEALTH_INTERVAL_MS) || 500;

let attempts = 0;

const ping = () => {
  const request = http.get(url, (response) => {
    response.resume();
    process.exit(0);
  });

  request.on("error", () => {
    attempts += 1;
    if (attempts >= maxAttempts) {
      process.exit(1);
    }
    setTimeout(ping, intervalMs);
  });
};

ping();
