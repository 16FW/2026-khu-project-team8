import json
import os
from datetime import datetime, timezone

import boto3
from boto3.dynamodb.conditions import Key


SERVICE_NAME = "ai_news_curator_lite"
USER_ID = "demo"
TABLE_NAME = os.environ.get("TABLE_NAME", "ai_news_curator_lite_table")

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps(body, ensure_ascii=False)
    }


def error_response(status_code, message):
    return response(status_code, {"message": message})


def parse_body(event):
    raw_body = event.get("body")
    if not raw_body:
        return {}

    try:
        return json.loads(raw_body)
    except json.JSONDecodeError:
        return None


def get_route(event):
    route_key = event.get("routeKey")
    if route_key and route_key != "$default":
        return route_key

    request_context = event.get("requestContext", {})
    http_context = request_context.get("http", {})
    method = http_context.get("method") or event.get("httpMethod", "")
    path = http_context.get("path") or event.get("path", "")
    return f"{method.upper()} {path}"


def now_iso():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def handle_health():
    return response(200, {
        "status": "ok",
        "service": SERVICE_NAME
    })


def handle_get_news(event):
    query_params = event.get("queryStringParameters") or {}
    keyword = (query_params.get("keyword") or "ai").strip().lower()

    print(f"Returning mock news for keyword={keyword}")
    return response(200, {
        "keyword": keyword,
        "items": [
            {
                "title": f"Mock {keyword.upper()} serverless news",
                "summary": "This is a mock summary for Day 4 implementation.",
                "source": "mock",
                "url": "https://example.com",
                "publishedAt": "2026-05-25"
            }
        ]
    })


def handle_create_keyword(event):
    body = parse_body(event)
    if body is None:
        return error_response(400, "invalid_json_body")

    keyword = str(body.get("keyword", "")).strip().lower()
    if not keyword:
        return error_response(400, "keyword_required")

    item = {
        "PK": f"USER#{USER_ID}",
        "SK": f"KEYWORD#{keyword}",
        "keyword": keyword,
        "createdAt": now_iso()
    }

    print(f"Creating keyword item: {item}")
    table.put_item(Item=item)

    return response(201, {
        "message": "keyword_created",
        "keyword": keyword
    })


def handle_get_keywords():
    pk = f"USER#{USER_ID}"
    print(f"Querying keywords for PK={pk}")

    result = table.query(
        KeyConditionExpression=Key("PK").eq(pk) & Key("SK").begins_with("KEYWORD#")
    )

    items = [
        {
            "keyword": item.get("keyword"),
            "createdAt": item.get("createdAt")
        }
        for item in result.get("Items", [])
    ]

    return response(200, {"items": items})


def lambda_handler(event, context):
    print("Received event:", json.dumps(event, ensure_ascii=False))

    try:
        route = get_route(event)
        print(f"Resolved route: {route}")

        if route == "GET /health":
            return handle_health()
        if route == "GET /news":
            return handle_get_news(event)
        if route == "POST /keywords":
            return handle_create_keyword(event)
        if route == "GET /keywords":
            return handle_get_keywords()

        return error_response(404, "not_found")
    except Exception as exc:
        print(f"Unhandled error: {exc}")
        return error_response(500, "internal_server_error")
