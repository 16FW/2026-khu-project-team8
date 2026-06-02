import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = requiredBaseUrl();
const INTERVAL_SECONDS = Number(__ENV.INTERVAL_SECONDS || 60);

export const options = {
  vus: 1,
  iterations: 5,
  thresholds: {
    checks: ["rate>0.99"],
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<3000"],
  },
};

export default function () {
  const response = http.get(`${BASE_URL}/health`, {
    tags: { scenario: "cold_start_observation" },
  });

  check(response, {
    "health returns 200": (result) => result.status === 200,
    "health envelope succeeds": hasSuccessEnvelope,
  });

  sleep(INTERVAL_SECONDS);
}

function requiredBaseUrl() {
  if (!__ENV.BASE_URL) {
    throw new Error("BASE_URL is required");
  }

  return __ENV.BASE_URL.replace(/\/+$/, "");
}

function hasSuccessEnvelope(response) {
  try {
    return response.json("success") === true;
  } catch {
    return false;
  }
}
