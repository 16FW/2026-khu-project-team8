# Cost and Operations Policy

## 목적

AI News Curator Lite는 포트폴리오용 MVP이므로 상시 실행 서버를 피하고, 사용량이 적을 때 비용 부담이 작은 AWS 서버리스 구성을 사용합니다.

## 현재 비용 정책

| 서비스 | 현재 설정 | 비용 관리 기준 |
| --- | --- | --- |
| AWS Lambda | `128 MB`, timeout `10 seconds` | 짧은 요청 처리만 수행하고 장시간 작업은 넣지 않음 |
| API Gateway HTTP API | 요청 기반 과금 | 불필요한 엔드포인트를 추가하지 않음 |
| DynamoDB | 두 테이블 모두 `PAY_PER_REQUEST` | 초기 트래픽이 작으므로 프로비저닝 용량을 상시 확보하지 않음 |
| CloudWatch Logs | Lambda 기본 로그 사용 | 운영 배포 시 보관 기간을 설정하고 오래된 로그를 정리 |

EC2, RDS, NAT Gateway처럼 상시 비용이 발생할 수 있는 리소스는 현재 MVP에서 사용하지 않습니다.

## 운영 체크리스트

- 배포 후 `scripts/smoke_test.ps1`로 핵심 API 흐름을 확인합니다.
- CloudWatch Logs에서 `request_received`, `response_sent`, `request_failed`를 확인합니다.
- 테스트가 끝난 스택을 유지할 필요가 없으면 CloudFormation 스택을 삭제합니다.
- 외부 뉴스 API와 AI 요약을 추가할 때는 호출량 제한, 재시도 횟수, timeout을 함께 설계합니다.
- 운영 환경으로 확장할 때는 CloudWatch Logs 보관 기간과 비용 알람을 명시적으로 설정합니다.

## 현재 범위 밖의 비용

현재 구현에는 외부 뉴스 API, AI 모델 API, EventBridge 정기 실행, 정적 프론트엔드 호스팅 비용이 없습니다. 향후 이 기능을 추가할 때는 월 호출량 가정과 예산 상한을 별도로 산정해야 합니다.
