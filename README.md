# AI News Curator Lite

AI News Curator Lite는 컴퓨터공학과 학생과 개발자 취업 준비생을 위한 개인화 기술 뉴스 큐레이션 서비스입니다.

사용자는 AI, Backend, Cloud, AWS, Database, Security, DevOps 등의 관심 키워드를 선택할 수 있으며, 해당 키워드에 맞는 오늘의 뉴스 카드를 짧은 요약과 함께 확인할 수 있습니다.

이 프로젝트는 단순 CRUD 서비스가 아니라, AWS 서버리스 아키텍처를 활용한 백엔드/클라우드 포트폴리오 프로젝트입니다.

## 주요 기능

- 관심 키워드 등록/조회/삭제
- 오늘의 뉴스 카드 조회
- 키워드별 뉴스 조회
- 뉴스 저장
- 뉴스 좋아요
- 인기 키워드 통계
- 관리자 뉴스 등록
- CloudWatch 기반 모니터링
- k6 기반 부하 테스트

## 기술 스택

### Frontend
- React
- S3
- CloudFront

### Backend
- Node.js
- TypeScript
- AWS Lambda
- API Gateway

### Database
- DynamoDB

### Monitoring & Test
- CloudWatch
- k6
- GA4

## Architecture

```text
User
  ↓
S3 + CloudFront
  ↓
API Gateway
  ↓
Lambda
  ↓
DynamoDB

Monitoring:
CloudWatch Logs / Metrics