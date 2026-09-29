# Bitbucket Pipelines changesets 조건은 파이프라인 종류마다 보는 커밋이 다르다

문서·설정만 바꾼 변경에서 테스트나 배포를 건너뛰려고 스텝에 `condition.changesets` 를 건다. 이때 **"바뀐 파일" 을 어느 커밋 범위로 계산하는지**가 파이프라인 종류마다 다르다.

```yaml
pipelines:
  pull-requests:
    '**':
      - step:
          name: Unit test
          condition:
            changesets:
              excludePaths:
                - 'docs/**'
                - '*.md'
          script: [ ... ]
  branches:
    develop:
      - step:
          name: Build & deploy
          condition:
            changesets:
              excludePaths:
                - 'docs/**'
                - '*.md'
          script: [ ... ]
```

## 범위 차이

| 파이프라인 | 판정에 쓰는 변경 |
| --- | --- |
| `pull-requests` | PR 에 담긴 **모든 커밋**의 변경 |
| `branches` · `default` 등 그 외 | **마지막 커밋 하나**의 변경 |

공식 문서 문구: "In a pull-requests pipeline, all commits are taken into account … For other types of pipelines, only the last commit is considered."

## PR 머지는 괜찮다

브랜치 파이프라인이 마지막 커밋만 본다고 해서 PR 머지에서 스텝이 잘못 빠지지는 않는다. 머지 커밋의 변경은 **첫 번째 부모 대비 diff**, 즉 PR 전체 변경이기 때문이다.

```bash
# 머지 커밋이 담은 변경 = PR 전체
git diff --stat <merge-commit>^1 <merge-commit>
```

Bitbucket API 의 `GET /2.0/repositories/{ws}/{repo}/diffstat/{merge-commit}` 도 같은 목록을 준다.

## 새는 경우: 여러 커밋을 한 번에 직접 push

PR 을 거치지 않고 브랜치에 커밋 여러 개를 한 번에 push 하면, **마지막 커밋만**으로 판정한다. 앞 커밋이 앱 코드를 바꿨어도 마지막 커밋이 문서만 바꿨다면 배포 스텝이 건너뛰어진다. 문서에도 "failing pipelines turn green only because the failing step is skipped on the next run" 같은 비직관적 동작을 경고한다.

→ 경로 조건을 건 브랜치에는 직접 push 를 한 커밋 단위로 하거나, PR 머지로만 들어오게 한다.

## includePaths 보다 excludePaths

- `includePaths` — **나열한 경로가 바뀌었을 때만** 돈다. 빌드 입력(새 설정 파일, 스크립트 등)을 목록에 빠뜨리면 배포가 **조용히** 빠진다.
- `excludePaths` — **나열한 경로 밖이 하나라도 바뀌면** 돈다. 목록이 틀려도 "CI 가 한 번 더 도는" 쪽으로만 틀린다.

스킵이 목적이면 `excludePaths` 가 안전한 기본값이다. 두 옵션은 한 스텝에 같이 쓸 수 없다.

## 형식 검사 같은 전역 게이트는 조건 밖에

문서만 바꾼 PR 에서도 포맷 검사(`prettier --check .` 등)는 그 문서를 검사한다. 이런 스텝까지 경로 조건으로 빼면 문서 포맷 오류가 머지 후에야 드러난다 — 테스트·빌드·배포만 조건을 걸고 형식 검사는 항상 돌린다.

## 참고

- [Step options — Bitbucket Cloud](https://support.atlassian.com/bitbucket-cloud/docs/step-options/)
- [Stage options — Bitbucket Cloud](https://support.atlassian.com/bitbucket-cloud/docs/stage-options/)
