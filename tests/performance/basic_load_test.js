import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = requiredBaseUrl();

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "5m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    checks: ["rate>0.99"],
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["avg<500"],
  },
};

export default function () {
  const healthResponse = http.get(`${BASE_URL}/health`);

  check(healthResponse, {
    "health returns 200": (response) => response.status === 200,
    "health envelope succeeds": hasSuccessEnvelope,
  });

  sleep(5);

  const keywordsResponse = http.get(`${BASE_URL}/keywords`);

  check(keywordsResponse, {
    "keywords returns 200": (response) => response.status === 200,
    "keywords envelope succeeds": hasSuccessEnvelope,
  });

  sleep(5);

  const todayNewsResponse = http.get(`${BASE_URL}/news/today`);

  check(todayNewsResponse, {
    "today news returns 200": (response) => response.status === 200,
    "today news envelope succeeds": hasSuccessEnvelope,
  });

  sleep(5);
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