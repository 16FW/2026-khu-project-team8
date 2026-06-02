# API Usage

## 기본 URL

배포 후 CloudFormation output의 `ApiEndpoint`를 사용합니다.

```text
https://{api_id}.execute-api.{region}.amazonaws.com/Prod
```

모든 JSON 응답은 공통 envelope를 사용합니다.

```json
{
  "success": true,
  "data": {},
  "message": "ok"
}
```

오류 응답은 `success: false`, `data: null`, `error.code`, `error.message`를 포함합니다.

## API 예제

### 상태 확인

```powershell
Invoke-RestMethod -Method Get -Uri "$BaseUrl/health"
```

### Mock 뉴스 조회

```powershell
Invoke-RestMethod -Method Get -Uri "$BaseUrl/news?keyword=aws"
```

`keyword`를 생략하면 `ai`를 사용합니다.

### 키워드 등록

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "$BaseUrl/keywords" `
  -ContentType "application/json" `
  -Body '{"keyword":"aws"}'
```

키워드는 앞뒤 공백을 제거하고 소문자로 저장합니다. 최대 길이는 40자이며 문자, 숫자, 공백, 하이픈, 언더스코어를 허용합니다.

### 키워드 목록 조회

```powershell
Invoke-RestMethod -Method Get -Uri "$BaseUrl/keywords"
```

### 키워드 삭제

```powershell
Invoke-RestMethod -Method Delete -Uri "$BaseUrl/keywords/aws"
```

### 오늘의 뉴스 카드 조회

```powershell
Invoke-RestMethod -Method Get -Uri "$BaseUrl/news/today"
```

저장된 키워드별 DynamoDB 뉴스 카드를 조회하고, 데이터가 없으면 지원되는 키워드에 한해 seed 카드를 반환합니다.

## Local Invoke

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
sam local invoke AiNewsCuratorLiteFunction --event ../backend/events/create_keyword_event.json
sam local invoke AiNewsCuratorLiteFunction --event ../backend/events/get_keywords_event.json
sam local invoke AiNewsCuratorLiteFunction --event ../backend/events/delete_keyword_event.json
sam local invoke AiNewsCuratorLiteFunction --event ../backend/events/get_today_news_event.json
```

기본 `sam build`와 `sam local invoke`에는 실행 중인 Docker가 필요합니다. Docker 없이 코드 패키징만 확인하려면 다음 명령어를 사용합니다.

```powershell
sam build --no-use-container
```

`POST /keywords`, `GET /keywords`, `DELETE /keywords/{keyword}`, `GET /news/today`는 DynamoDB를 사용하므로 로컬 호출 시 AWS 자격 증명과 테이블 설정이 필요합니다.

## 배포 후 Smoke Test

저장소 루트에서:

```powershell
.\scripts\smoke_test.ps1 `
  -BaseUrl "https://{api_id}.execute-api.{region}.amazonaws.com/Prod" `
  -Keyword "aws"
```

스크립트는 `GET /health`, 키워드 CRUD, mock 뉴스, 오늘의 뉴스 흐름을 순서대로 확인합니다.
