# Day 4 Implementation

## Day 4 목표

Day 4의 목표는 AWS SAM 기반 서버리스 백엔드의 최소 실행 골격을 만들고, `sam build`가 성공하는 구현체를 준비하는 것입니다. 실제 배포는 수행하지 않으며, 외부 뉴스 API 연동과 인증 기능도 제외합니다.

## 구현한 API 목록

| Method | Path | 설명 |
| --- | --- | --- |
| `GET` | `/health` | 서비스 상태 확인 |
| `GET` | `/news` | mock 뉴스 목록 조회 |
| `POST` | `/keywords` | demo 사용자의 관심 키워드 등록 |
| `GET` | `/keywords` | demo 사용자의 관심 키워드 목록 조회 |

## 아키텍처 요약

```text
API Gateway HTTP API
  ↓
Lambda Python 3.12
  ↓
DynamoDB
```

- SAM 리소스: `AiNewsCuratorLiteApi`, `AiNewsCuratorLiteFunction`, `AiNewsCuratorLiteTable`
- Lambda handler: `app.lambda_handler`
- DynamoDB table: `ai_news_curator_lite_table`
- DynamoDB key schema: `PK`, `SK`
- 임시 사용자 ID: `demo`

## 로컬 빌드 명령어

Lambda runtime은 `python3.12`입니다. 로컬에 Python 3.12가 없으면 Docker Desktop을 실행한 뒤 SAM 컨테이너 빌드를 사용합니다. 이 프로젝트는 `infra/samconfig.toml`에서 `sam build`가 컨테이너 빌드를 사용하도록 설정합니다.

```bash
cd infra
sam build
```

## 로컬 테스트 명령어

Lambda 이벤트 파일을 사용한 단일 함수 테스트:

```bash
cd infra
sam local invoke AiNewsCuratorLiteFunction --event ../backend/events/health_event.json
sam local invoke AiNewsCuratorLiteFunction --event ../backend/events/get_news_event.json
sam local invoke AiNewsCuratorLiteFunction --event ../backend/events/create_keyword_event.json
sam local invoke AiNewsCuratorLiteFunction --event ../backend/events/get_keywords_event.json
```

로컬 API 실행:

```bash
cd infra
sam local start-api
```

curl 테스트 예시:

```bash
curl http://127.0.0.1:3000/health
curl "http://127.0.0.1:3000/news?keyword=aws"
curl -X POST http://127.0.0.1:3000/keywords -H "Content-Type: application/json" -d "{\"keyword\":\"aws\"}"
curl http://127.0.0.1:3000/keywords
```

## Day 4에서 제외한 것

- 실제 AWS 배포
- 외부 뉴스 API 연동
- React 프론트엔드 구현
- 인증 및 JWT
- 저장/좋아요 API
- 인기 키워드 통계 API
- 사용자 이벤트 수집 API
- k6 부하 테스트 작성

## Day 5로 넘길 작업

- DynamoDB Local 또는 개발용 AWS DynamoDB 테스트 방식 확정
- 저장 API 구현
- 좋아요 API 구현
- 인기 키워드 통계 API 구현
- 사용자 이벤트 수집 API 구현
- `scripts/seed_news.py` 작성
- `tests/k6/smoke_test.js` 작성
- CloudWatch 로그와 메트릭 확인 절차 문서화
