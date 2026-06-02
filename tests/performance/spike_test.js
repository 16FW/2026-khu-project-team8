import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = requiredBaseUrl();

export const options = {
  stages: [
    { duration: "20s", target: 2 },
    { duration: "10s", target: 20 },
    { duration: "30s", target: 20 },
    { duration: "10s", target: 2 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    checks: ["rate>0.95"],
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<2000"],
  },
};

export default function () {
  const response = http.get(`${BASE_URL}/health`);

  check(response, {
    "health returns 200": (result) => result.status === 200,
    "health envelope succeeds": hasSuccessEnvelope,
  });

  sleep(0.5);
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
