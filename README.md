# AI News Curator Lite

AI News Curator Lite는 사용자가 관심 키워드를 등록하면, 해당 키워드를 기준으로 오늘의 뉴스 카드를 조회할 수 있는 서버리스 백엔드 MVP입니다.

이 프로젝트는 단순 CRUD 구현을 넘어서 AWS SAM 기반 배포, DynamoDB 설계, API 응답 표준화, 로깅, smoke test까지 포함하여 작은 서비스의 백엔드 운영 흐름을 경험하는 것을 목표로 합니다.

## 주요 기능

- 서비스 상태 확인
- 관심 키워드 등록, 목록 조회, 삭제
- 등록한 키워드를 기준으로 오늘의 뉴스 카드 조회
- DynamoDB 뉴스 데이터가 없을 때 seed 뉴스 카드 반환
- 입력값 검증, 공통 API 응답 형식, CORS 처리
- Lambda 요청 단위 로그와 배포 후 smoke test

## 아키텍처 개요

```text
Client
  -> Amazon API Gateway HTTP API
  -> AWS Lambda (Python)
  -> Amazon DynamoDB

Operations
  -> Amazon CloudWatch Logs
  -> Amazon CloudWatch Metrics
```

현재 MVP는 인증 기능 없이 고정 사용자 `demo_user`를 사용합니다. 자세한 내용은 [아키텍처 문서](docs/architecture.md)를 참고하세요.

## 기술 스택

- Backend: Python 3.12, AWS Lambda
- API: Amazon API Gateway HTTP API
- Database: Amazon DynamoDB
- Infrastructure as Code: AWS SAM, AWS CloudFormation
- Operations: Amazon CloudWatch Logs, PowerShell smoke test

## API 목록

| Method | Path | 설명 |
| --- | --- | --- |
| `GET` | `/health` | 서비스 상태 확인 |
| `GET` | `/news?keyword={keyword}` | mock 뉴스 카드 조회 |
| `POST` | `/keywords` | 관심 키워드 등록 |
| `GET` | `/keywords` | 관심 키워드 목록 조회 |
| `DELETE` | `/keywords/{keyword}` | 관심 키워드 삭제 |
| `GET` | `/news/today` | 저장된 키워드 기준 오늘의 뉴스 카드 조회 |

요청 및 응답 예제는 [API 사용법](docs/api_usage.md)을 참고하세요.

## 로컬 실행 방법

저장소 루트에서 Python 문법을 확인합니다.

```powershell
python -m py_compile backend/app.py
```

`infra` 디렉터리에서 SAM 템플릿을 검증하고 빌드합니다.

```powershell
cd infra
sam validate
sam build
sam local invoke AiNewsCuratorLiteFunction --event ../backend/events/health_event.json
sam local invoke AiNewsCuratorLiteFunction --event ../backend/events/get_news_event.json
```

기본 빌드와 `sam local invoke`에는 실행 중인 Docker가 필요합니다. Docker 없이 코드 패키징만 확인하려면 `sam build --no-use-container`를 사용합니다.

키워드 및 오늘의 뉴스 API를 로컬 호출하려면 AWS 자격 증명과 DynamoDB 테이블 환경 변수가 필요합니다. 전체 명령어는 [API 사용법](docs/api_usage.md)을 참고하세요.

## 배포 방법

AWS CloudFormation Stack Name은 언더스코어를 사용할 수 없으므로 `ai-news-curator-lite`를 사용합니다.

```powershell
cd infra
sam build
sam deploy --stack-name ai-news-curator-lite
```

`infra/samconfig.toml` 설정을 사용하는 경우:

```powershell
sam deploy
```

## Smoke Test

배포 후 저장소 루트에서 실행합니다.

```powershell
.\scripts\smoke_test.ps1 `
  -BaseUrl "https://{api_id}.execute-api.{region}.amazonaws.com/Prod" `
  -Keyword "aws"
```

스크립트는 상태 확인, 키워드 등록과 조회, 뉴스 조회, 키워드 삭제 흐름을 순서대로 검증합니다.

## 운영 및 비용 고려사항

- DynamoDB 테이블은 `PAY_PER_REQUEST` 모드를 사용합니다.
- Lambda는 128 MB 메모리와 10초 timeout으로 설정했습니다.
- 상시 실행 서버를 두지 않고 요청이 있을 때만 서버리스 리소스를 사용합니다.
- CloudWatch 로그 보관 기간과 테스트 리소스 정리는 배포 환경에서 별도로 관리해야 합니다.

자세한 정책은 [비용 및 운영 정책](docs/cost_policy.md)을 참고하세요.

## 현재 MVP 한계

- 실제 뉴스 API나 크롤러 대신 mock 및 seed 데이터를 사용합니다.
- AI 요약 기능은 포함하지 않습니다.
- 로그인과 사용자별 인증 없이 `demo_user`만 사용합니다.
- EventBridge 기반 정기 수집은 구현하지 않았습니다.
- 프론트엔드 연결과 운영 알림 설정은 범위에 포함하지 않았습니다.

## 향후 확장 계획

- Cognito 또는 JWT 기반 사용자 인증
- 실제 뉴스 API 연동과 수집 실패 처리
- AI 요약 파이프라인 및 비용 제한
- EventBridge 기반 정기 수집
- CloudWatch 알람과 로그 보관 기간 설정
- 정적 프론트엔드 연결

요약은 [포트폴리오 문서](docs/portfolio.md)를 참고하세요.
