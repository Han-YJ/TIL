# Bitbucket Pipelines 동시 배포 잠금에 걸린 배포는 다시 실행 필요

같은 배포 환경(`deployment: test` 등)을 쓰는 파이프라인 두 개가 겹치면, 뒤에 시작한 쪽의 배포 스텝은 `HALTED`(이유 `concurrent_deployment`)로 멈춤.

## 헷갈리는 점

- 파이프라인은 **자기가 시작된 커밋**을 빌드. 앞 파이프라인이 배포에 성공해도 올라간 건 앞 커밋이고, 뒤 머지분은 없음.
- 앞 배포가 끝나도 멈춘 스텝은 **저절로 다시 시작하지 않음**. 빌드와 배포가 한 스텝이면 빌드조차 안 된 상태.
- 그래서 머지를 연달아 하면 dev 는 앞 커밋에 머묾. 「머지했으니 배포됐겠지」 가 틀리는 지점.

## 처리

멈춘 스텝 다시 실행, 또는 파이프라인 중지 후 같은 브랜치로 새로 실행.

```bash
# 멈춘 파이프라인 중지
curl -X POST -u "$USER:$TOKEN" \
  ".../repositories/<ws>/<repo>/pipelines/{uuid}/stopPipeline"
# 브랜치 최신 커밋으로 새로 실행
curl -X POST -u "$USER:$TOKEN" -H 'Content-Type: application/json' \
  -d '{"target":{"type":"pipeline_ref_target","ref_type":"branch","ref_name":"develop"}}' \
  ".../repositories/<ws>/<repo>/pipelines/"
```

연달아 머지했으면 **마지막 파이프라인의 배포 스텝 결과**까지 확인해야 dev 반영 여부 판단 가능.
