# AI News Curator Lite

서버리스 기반 AI/IT 뉴스 큐레이션 MVP 프로젝트입니다.

## Project Name

ai_news_curator_lite

## Goal

AI News Curator Lite는 사용자가 관심 키워드를 선택하면 관련 IT/AI 뉴스를 수집하고 요약하여 제공하는 서버리스 기반 뉴스 큐레이션 MVP입니다.

단순한 뉴스 조회 기능에 그치지 않고, AWS 서버리스 환경에서 배포, 비용 관리, 모니터링, 성능 검증, 사용자 지표 수집까지 고려한 백엔드 구조를 설계하는 데 초점을 두었습니다.

## Target Users

- 컴퓨터공학과 학생
- 개발자 취업 준비생
- 기술 트렌드를 빠르게 읽고 싶은 입문자
- AI/백엔드/클라우드 뉴스를 매일 간단히 확인하고 싶은 사람

## MVP Scope

### 필수 기능

- 관심 키워드 등록/조회/삭제
- 오늘의 뉴스 카드 조회
- 키워드별 뉴스 조회
- 뉴스 저장
- 뉴스 좋아요
- 인기 키워드 통계
- 관리자 뉴스 등록
- CloudWatch 로그/메트릭 확인
- k6 부하 테스트
- 실사용자 지표 수집

### 제외 기능

- 자동 뉴스 크롤링
- 복잡한 회원가입/로그인
- JWT 인증
- 실시간 AI 요약 호출
- 추천 알고리즘 고도화
- 관리자 전용 프론트 페이지
- EC2 상시 배포
- RDS/MySQL 사용

## Architecture

```text
User
  ↓
React Static Frontend
  ↓
S3 + CloudFront
  ↓
API Gateway HTTP API
  ↓
Lambda
  ↓
DynamoDB

Monitoring:
CloudWatch Logs
CloudWatch Metrics

User Analytics:
GA4 or Custom Event API

Admin Input:
Admin API or JSON bulk upload
```

## Day 4 Local Run

Lambda runtime은 `python3.12`입니다. 로컬에 Python 3.12가 없으면 Docker Desktop을 실행한 상태에서 빌드합니다.

```bash
cd infra
sam build
sam local invoke AiNewsCuratorLiteFunction --event ../backend/events/health_event.json
sam local invoke AiNewsCuratorLiteFunction --event ../backend/events/get_news_event.json
```
