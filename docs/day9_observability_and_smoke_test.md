# Day 9 - Observability and Smoke Tests

## Goal

- Added structured Lambda logs for request and response flow.
- Added request-level logging with method, path, status code, and request id.
- Added clearer error logs for failed requests and unhandled exceptions.
- Added a deployment smoke test script.
- Kept the Day 8 response envelope unchanged.
- Kept real news API calls, AI summaries, crawling, and EventBridge scheduling out of scope.

## Lambda Logging

The Lambda handler now uses Python's built-in `logging` module instead of direct `print` calls.

Request start log:

```text
INFO request_received method=GET path=/health request_id=...
```

Route resolution log:

```text
INFO route_resolved method=GET path=/health route=GET /health request_id=...
```

Response log:

```text
INFO response_sent method=GET path=/health status_code=200 request_id=... message=ok
```

Client or server failure log:

```text
WARNING request_failed method=GET path=/news status_code=400 request_id=... error=keyword_invalid_characters
ERROR request_failed method=GET path=/keywords status_code=500 request_id=... error=keyword_table_not_configured
```

Unhandled exceptions are logged with stack traces through `logger.exception`.

## Smoke Test Script

The smoke test script is:

```text
scripts/smoke_test.ps1
```

It checks the deployed API with the following sequence:

1. `GET /health`
2. `POST /keywords`
3. `GET /keywords`
4. `GET /news?keyword=...`
5. `GET /news/today`
6. `DELETE /keywords/{keyword}`

Run after deployment:

```powershell
.\scripts\smoke_test.ps1 -BaseUrl "https://{api_id}.execute-api.{region}.amazonaws.com/Prod"
```

Optional keyword:

```powershell
.\scripts\smoke_test.ps1 `
  -BaseUrl "https://{api_id}.execute-api.{region}.amazonaws.com/Prod" `
  -Keyword "cloud"
```

Each API response must keep the Day 8 envelope:

```json
{
  "success": true,
  "data": {},
  "message": "ok"
}
```

The script exits with an error if a request returns a non-2xx status or if `success` is not `true`.

## CloudWatch Log Checks

After calling the API, check the Lambda log group in CloudWatch Logs. The log group name is based on the deployed Lambda function created by the SAM stack.

Useful strings to search:

```text
request_received
response_sent
request_failed
keyword_create_requested
keywords_query_requested
keyword_delete_requested
news_mock_returned
```

Expected healthy flow for `GET /health`:

```text
request_received method=GET path=/health
route_resolved method=GET path=/health route=GET /health
response_sent method=GET path=/health status_code=200
```

## Deployment

Run from the `infra` directory:

```powershell
sam build
sam deploy --stack-name ai-news-curator-lite
```

If `samconfig.toml` is configured:

```powershell
sam deploy
```

## Local Checks

Run from the repository root:

```powershell
python -m py_compile backend/app.py
```

Run from the `infra` directory:

```powershell
sam validate
sam build
```

`sam local invoke` may require a valid AWS login because SAM resolves AWS credentials while preparing the local runtime environment.

## Notes

- The MVP still uses `demo_user`.
- Day 9 does not add real news ingestion.
- Day 9 does not add AI summarization.
- Day 9 does not add scheduled execution.
