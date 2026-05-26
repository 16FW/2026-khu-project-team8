# Day 7 - Today News API

## Goal

- Added a DynamoDB `NewsTable` for news card storage.
- Added `GET /news/today` to return news cards based on the MVP user's saved keywords.
- Kept real news API calls, crawling, AI summarization, and scheduled ingestion out of scope for this step.

## DynamoDB Table Design

### KeywordTable

The existing keyword table remains unchanged.

- Partition key: `user_id`
- Sort key: `keyword`
- Billing mode: `PAY_PER_REQUEST`
- MVP user id: `demo_user`

### NewsTable

`NewsTable` stores news cards grouped by keyword.

- Partition key: `keyword`
- Sort key: `published_at`
- Billing mode: `PAY_PER_REQUEST`

Example item:

```json
{
  "keyword": "aws",
  "published_at": "2026-05-26T00:00:00Z",
  "title": "Serverless teams refine Lambda and DynamoDB cost practices",
  "summary": "PAY_PER_REQUEST tables and lean Lambda handlers remain a practical baseline for early MVP backends.",
  "source": "seed",
  "url": "https://example.com/news/serverless-cost",
  "image_url": "https://example.com/images/serverless-cost.png"
}
```

## API Changes

### GET /news/today

Returns today's news cards for the current MVP user.

Current behavior:

1. Query `KeywordTable` for `user_id = demo_user`.
2. For each saved keyword, query `NewsTable` by `keyword`.
3. If the news table has no items for a seed-supported keyword, return an MVP seed news card.
4. Sort cards by `published_at` descending.

Response:

```json
{
  "user_id": "demo_user",
  "keywords": ["aws"],
  "items": [
    {
      "keyword": "aws",
      "title": "Serverless teams refine Lambda and DynamoDB cost practices",
      "summary": "PAY_PER_REQUEST tables and lean Lambda handlers remain a practical baseline for early MVP backends.",
      "source": "seed",
      "url": "https://example.com/news/serverless-cost",
      "image_url": "https://example.com/images/serverless-cost.png",
      "published_at": "2026-05-26T00:00:00Z"
    }
  ]
}
```

If the user has no saved keywords, the API returns an empty keyword list and an empty item list.

## Local Event

The local API Gateway event file is:

```text
backend/events/get_today_news_event.json
```

Run from the `infra` directory:

```bash
sam local invoke AiNewsCuratorLiteFunction --event ../backend/events/get_today_news_event.json
```

This command queries DynamoDB, so local execution requires valid AWS credentials and deployed table names from the SAM template environment.

## Deployment

Run from the `infra` directory:

```bash
sam build
sam deploy --stack-name ai-news-curator-lite
```

If `samconfig.toml` is configured:

```bash
sam deploy
```

## Test Commands

Replace `{api_id}` and `{region}` with the deployed API Gateway values.

### curl

```bash
curl https://{api_id}.execute-api.{region}.amazonaws.com/Prod/health

curl -X POST https://{api_id}.execute-api.{region}.amazonaws.com/Prod/keywords \
  -H "Content-Type: application/json" \
  -d "{\"keyword\":\"aws\"}"

curl https://{api_id}.execute-api.{region}.amazonaws.com/Prod/news/today
```

### PowerShell

```powershell
Invoke-RestMethod -Method Get -Uri "https://{api_id}.execute-api.{region}.amazonaws.com/Prod/health"

Invoke-RestMethod -Method Post `
  -Uri "https://{api_id}.execute-api.{region}.amazonaws.com/Prod/keywords" `
  -ContentType "application/json" `
  -Body '{"keyword":"aws"}'

Invoke-RestMethod -Method Get -Uri "https://{api_id}.execute-api.{region}.amazonaws.com/Prod/news/today"
```

## Notes

- README should not include day-by-day work logs.
- `NewsTable` is prepared for future ingestion from a real news API, crawler, or scheduled pipeline.
- Day 7 intentionally does not implement crawling, AI summaries, or EventBridge scheduling.
- The current API uses `demo_user`; future authentication can replace it with a Cognito/JWT user id.
