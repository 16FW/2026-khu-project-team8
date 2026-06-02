# AI News Curator Lite Portfolio

## 프로젝트 소개

AI News Curator Lite는 관심 키워드를 등록하고, 등록된 키워드를 기준으로 오늘의 뉴스 카드를 조회하는 AWS 서버리스 백엔드 MVP입니다.

## 구현 목표

작은 서비스의 백엔드를 처음부터 배포 가능한 형태로 구성하는 것을 목표로 했습니다. API 구현뿐 아니라 Infrastructure as Code, 데이터 모델, 공통 응답 형식, 입력값 검증, 로깅, smoke test까지 포함했습니다.

## 구현 범위

- API Gateway HTTP API와 Python Lambda 기반 REST API
- DynamoDB를 사용한 키워드 등록, 목록 조회, 삭제
- NewsTable 조회 및 seed fallback 기반 뉴스 카드 반환
- AWS SAM 템플릿과 `samconfig.toml` 기반 배포
- 공통 성공 및 오류 응답 형식
- CORS 처리와 키워드 입력값 검증
- CloudWatch에서 확인 가능한 요청 단위 로그
- 배포 후 핵심 흐름을 점검하는 PowerShell smoke test

## 주요 설계 판단

### 서버리스 구성

초기 사용량이 작고 운영 리소스를 최소화해야 하는 MVP 특성에 맞춰 API Gateway, Lambda, DynamoDB를 사용했습니다. DynamoDB는 `PAY_PER_REQUEST`로 설정했습니다.

### 단순한 데이터 모델

KeywordTable은 `user_id`와 `keyword`, NewsTable은 `keyword`와 `published_at`을 복합 키로 사용합니다. 현재는 `demo_user` 한 명만 지원하지만 인증을 추가하면 사용자 식별자를 교체할 수 있습니다.

### 단계적인 뉴스 조회

실제 외부 API 연결 전에 조회 흐름을 먼저 검증할 수 있도록 NewsTable 조회와 seed fallback을 구성했습니다. 이 구조는 추후 수집 파이프라인을 추가해도 조회 API 계약을 유지할 수 있습니다.

### 운영 기본 구성

요청 시작, 라우팅, 응답 상태, 오류를 CloudWatch Logs에서 추적할 수 있도록 로그를 추가했습니다. 배포 후에는 smoke test로 주요 API 흐름을 한 번에 확인합니다.

## 한계

- 외부 뉴스 API, 크롤링, AI 요약은 구현하지 않았습니다.
- 인증 없이 고정 사용자 `demo_user`를 사용합니다.
- EventBridge 예약 수집과 운영 알림은 포함하지 않았습니다.
- 프론트엔드는 현재 범위에 포함하지 않았습니다.

## 확장 계획

1. Cognito 또는 JWT 인증을 추가합니다.
2. 외부 뉴스 수집 Lambda와 EventBridge 스케줄을 추가합니다.
3. AI 요약과 호출량 제한을 추가합니다.
4. CloudWatch 알람과 로그 보관 기간을 설정합니다.
5. 정적 프론트엔드를 연결합니다.

## 발표 시연 순서

1. `GET /health`로 배포 상태를 확인합니다.
2. `POST /keywords`로 `aws` 키워드를 등록합니다.
3. `GET /keywords`로 저장 결과를 확인합니다.
4. `GET /news/today`로 seed fallback 뉴스 카드를 확인합니다.
5. `DELETE /keywords/aws`로 키워드를 삭제합니다.
6. CloudWatch Logs에서 요청과 응답 로그를 확인합니다.
