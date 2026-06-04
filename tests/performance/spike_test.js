import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 10 },
    { duration: "30s", target: 200 },
    { duration: "2m", target: 200 },
    { duration: "30s", target: 10 },
    { duration: "2m", target: 10 },
  ],

  thresholds: {
    http_req_failed: ["rate<0.05"],
  },
};

export default function () {
  const res = http.get(
    "https://h8imnoue1k.execute-api.ap-northeast-2.amazonaws.com/Prod/health"
  );

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  if (res.status !== 200) {
  console.log(`FAIL STATUS: ${res.status}`);
}

  sleep(1);
}