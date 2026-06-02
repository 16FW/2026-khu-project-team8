import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = requiredBaseUrl();

export const options = {
  stages: [
    { duration: "30s", target: 5 },
    { duration: "1m", target: 5 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    checks: ["rate>0.99"],
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
  },
};

export default function () {
  const responses = http.batch([
    ["GET", `${BASE_URL}/health`],
    ["GET", `${BASE_URL}/news?keyword=aws`],
    ["GET", `${BASE_URL}/news/today`],
  ]);

  check(responses[0], {
    "health returns 200": (response) => response.status === 200,
    "health envelope succeeds": hasSuccessEnvelope,
  });
  check(responses[1], {
    "mock news returns 200": (response) => response.status === 200,
    "mock news envelope succeeds": hasSuccessEnvelope,
  });
  check(responses[2], {
    "today news returns 200": (response) => response.status === 200,
    "today news envelope succeeds": hasSuccessEnvelope,
  });

  sleep(1);
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
