# Day 10 - MVP Completion

## 목표

- README를 포트폴리오 제출용으로 정리했습니다.
- API 사용법, 아키텍처, 비용 및 운영 정책을 현재 구현 기준으로 정리했습니다.
- 프로젝트 한계와 확장 계획을 명시했습니다.
- 제출 및 발표용 포트폴리오 문서를 추가했습니다.
- 기존 기능 회귀 검증 명령어를 정리했습니다.

## 최종 문서

| 문서 | 목적 |
| --- | --- |
| `README.md` | 프로젝트 소개와 실행 방법 |
| `docs/api_usage.md` | API 요청 예제와 local invoke 명령어 |
| `docs/architecture.md` | 서버리스 구성과 데이터 모델 |
| `docs/cost_policy.md` | 비용 관리와 운영 체크리스트 |
| `docs/portfolio.md` | 제출 및 발표용 요약 |

README에는 Day별 작업 기록을 넣지 않고 최종 프로젝트 설명만 유지합니다.

## 회귀 검증

저장소 루트에서:

```powershell
python -m py_compile backend/app.py
```

`infra` 디렉터리에서:

```powershell
sam validate
sam build
sam local invoke AiNewsCuratorLiteFunction --event ../backend/events/health_event.json
sam local invoke AiNewsCuratorLiteFunction --event ../backend/events/get_news_event.json
```

기본 `sam build`와 `sam local invoke`에는 실행 중인 Docker가 필요합니다. Docker 없이 패키징만 확인할 때는 `sam build --no-use-container`를 사용합니다.

배포 후 저장소 루트에서:

```powershell
.\scripts\smoke_test.ps1 `
  -BaseUrl "https://{api_id}.execute-api.{region}.amazonaws.com/Prod" `
  -Keyword "aws"
```

## MVP 범위

Day 10에서는 큰 기능 확장을 하지 않습니다. 외부 뉴스 API, AI 요약, EventBridge 스케줄링, 로그인 및 인증은 후속 작업으로 남깁니다.

## 최종 검증 결과

2026-06-02 기준으로 다음 항목을 확인했습니다.

| 항목 | 결과 |
| --- | --- |
| `python -m py_compile backend/app.py` | 통과 |
| `sam validate` | 통과 |
| `sam build --no-use-container` | 통과 |
| `backend/events/*.json` JSON 파싱 | 통과 |
| `scripts/smoke_test.ps1` PowerShell 문법 파싱 | 통과 |
| `sam build` 기본 설정 | Docker 미실행으로 확인 불가 |
| `sam local invoke` | Docker 미실행으로 확인 불가 |
| 배포 API 대상 `scripts/smoke_test.ps1` | 배포 URL이 제공되지 않아 실행하지 않음 |

`tests` 디렉터리에는 현재 자동화 테스트 파일이 없습니다. 배포 환경 회귀 검증은 smoke test 스크립트를 사용합니다.
