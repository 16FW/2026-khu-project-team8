import http from "k6/http";
import { Counter } from "k6/metrics";

const status429 = new Counter("status_429");
const status500 = new Counter("status_500");
const status502 = new Counter("status_502");
const status503 = new Counter("status_503");

export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "30s", target: 50 },
  ],
};

export default function () {
  const res = http.get(
    "https://h8imnoue1k.execute-api.ap-northeast-2.amazonaws.com/Prod/health"
  );

  if (res.status === 429) status429.add(1);
  if (res.status === 500) status500.add(1);
  if (res.status === 502) status502.add(1);
  if (res.status === 503) status503.add(1);
}