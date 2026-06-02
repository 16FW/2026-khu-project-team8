# Architecture

## 개요

AI News Curator Lite는 API Gateway, Lambda, DynamoDB를 사용하는 서버리스 백엔드 MVP입니다. 현재 범위는 백엔드 API와 운영 기본 구성까지이며 프론트엔드, 인증, 외부 뉴스 수집, 예약 실행은 포함하지 않습니다.

## 요청 흐름

```text
Client
  -> Amazon API Gateway HTTP API
  -> AiNewsCuratorLiteFunction (Python 3.12)
  -> KeywordTable
  -> NewsTable

AiNewsCuratorLiteFunction
  -> Amazon CloudWatch Logs
```

하나의 Lambda 함수가 HTTP method와 path를 기준으로 요청을 라우팅합니다. API Gateway stage는 `Prod`입니다.

## API Gateway

| Method | Path | Lambda 처리 함수 |
| --- | --- | --- |
| `GET` | `/health` | `handle_health` |
| `GET` | `/news` | `handle_get_news` |
| `POST` | `/keywords` | `handle_create_keyword` |
| `GET` | `/keywords` | `handle_get_keywords` |
| `DELETE` | `/keywords/{keyword}` | `handle_delete_keyword` |
| `GET` | `/news/today` | `handle_get_today_news` |

CORS는 `GET`, `POST`, `DELETE`, `OPTIONS`를 허용합니다. MVP 확인을 위해 origin은 `*`로 설정했습니다. 운영 서비스로 확장할 때는 허용 origin을 실제 프론트엔드 주소로 제한해야 합니다.

## DynamoDB

### KeywordTable

| 항목 | 값 |
| --- | --- |
| 용도 | 사용자의 관심 키워드 저장 |
| Partition key | `user_id` |
| Sort key | `keyword` |
| Billing mode | `PAY_PER_REQUEST` |

현재 `user_id`는 고정값 `demo_user`입니다.

### NewsTable

| 항목 | 값 |
| --- | --- |
| 용도 | 키워드별 뉴스 카드 저장 |
| Partition key | `keyword` |
| Sort key | `published_at` |
| Billing mode | `PAY_PER_REQUEST` |

`GET /news/today`는 사용자의 키워드를 조회한 뒤 키워드별 최신 뉴스 카드를 최대 5개 조회합니다. 테이블에 뉴스가 없으면 코드에 포함된 seed 데이터를 사용합니다.

## Lambda 설정

| 항목 | 값 |
| --- | --- |
| Runtime | `python3.12` |
| Memory | `128 MB` |
| Timeout | `10 seconds` |
| Handler | `app.lambda_handler` |

Lambda에는 KeywordTable의 `PutItem`, `GetItem`, `Query`, `DeleteItem` 권한과 NewsTable의 `Query` 권한만 부여합니다.

## 운영 가시성

Lambda는 요청 method, path, request id, 응답 status code를 CloudWatch Logs에 기록합니다. 클라이언트 오류와 서버 오류는 `request_failed` 로그로 구분할 수 있습니다.

## 확장 방향

- 인증 추가 후 `demo_user`를 Cognito 또는 JWT user id로 교체
- 외부 뉴스 API 수집 Lambda와 조회 Lambda 분리
- EventBridge로 수집 작업 예약 실행
- AI 요약 단계와 호출량 제한 추가
- CloudWatch 알람과 로그 보관 기간 설정
