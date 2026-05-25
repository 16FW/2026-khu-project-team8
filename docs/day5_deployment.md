\# Day 5 - AWS Deployment



\## Goal



Day 5의 목표는 Day 4에서 구현한 AWS SAM 기반 서버리스 백엔드를 실제 AWS 환경에 배포하고, API Gateway URL을 통해 핵심 API가 정상 동작하는지 확인하는 것이다.



\## Deployment Target


\- Project: AI News Curator Lite

\- Repository/Folder: ai\_news\_curator\_lite

\- Region: ap-northeast-2

\- Stack Name: ai-news-curator-lite

\- Runtime: Python Lambda

\- Infrastructure: AWS SAM

\- Main Services:

&#x20; - AWS Lambda

&#x20; - Amazon API Gateway

&#x20; - AWS CloudFormation

&#x20; - Amazon S3 for deployment artifacts



\## Commands



```powershell

cd infra



sam validate --region ap-northeast-2



sam build --no-use-container --region ap-northeast-2



sam deploy --guided --region ap-northeast-2

