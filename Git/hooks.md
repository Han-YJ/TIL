# Git Hooks

특정 순간에 git 이 **자동으로 실행하는 스크립트**. 커밋 전에 포맷·린트를 돌리거나, 커밋 메시지 형식을 강제하거나, push 전에 테스트를 돌리는 데 쓴다.

## 1. 대표적인 훅

| 훅 | 실행 시점 | 실패(0 아닌 종료)하면 |
|---|---|---|
| `pre-commit` | `git commit` 직후, 커밋이 만들어지기 **전** | 커밋이 취소된다 |
| `commit-msg` | 커밋 메시지가 확정된 뒤 | 커밋이 취소된다 |
| `pre-push` | `git push` 직전 | push 가 중단된다 |

## 2. 기본 위치와 `.sample`

기본 위치는 `.git/hooks/` 다. `git init` 하면 템플릿에서 예시 파일이 복사돼 들어온다.

```bash
$ ls .git/hooks
applypatch-msg.sample   commit-msg.sample   pre-commit.sample
pre-push.sample         pre-rebase.sample   ...
```

**`.sample` 이 붙어 있으면 git 이 무시한다.** 이름에서 `.sample` 을 떼야 실행된다. 즉 대부분의 저장소는 **실행되는 훅이 0개**인 상태다.

```bash
$ mv .git/hooks/pre-commit.sample .git/hooks/pre-commit
$ chmod +x .git/hooks/pre-commit   # 실행 권한 필요
```

## 3. 왜 훅은 팀에 안 퍼지나 — 그리고 그게 왜 의도인가

`.git/` 은 **git 이 추적하지 않는다.** 그래서 `.git/hooks/pre-commit` 을 만들어도 커밋되지 않고, 동료가 clone 해도 따라오지 않는다.

이건 버그나 설계 실수가 아니라 **보안 결정**이다. 훅은 자동 실행되는 임의의 코드라서, 만약 레포에 딸려 와 clone 에 포함된다면:

```bash
git clone https://example.com/모르는-레포
cd 모르는-레포
git commit -m "test"     # ← 남이 쓴 코드가 내 권한으로 실행됨
```

**clone 만으로 원격 코드 실행**이 성립한다. 그래서 git 은 훅을 「저장소의 내용」이 아니라 「내 클론의 로컬 설정」으로 분류하고, 공식 문서(`githooks(5)`)도 "훅은 clone 시 복사되지 않는다" 를 명시한다.

## 4. `core.hooksPath` — 공유를 여는 opt-in

git 2.9(2016) 부터 **훅을 찾을 디렉터리를 바꿀 수 있다.**

```bash
git config core.hooksPath .githooks
```

이렇게 하면 git 은 `.githooks/pre-commit` 을 찾는다. **`.githooks/` 는 평범한 폴더라 커밋된다.**

|  | 위치 | 커밋 가능 | 팀에 자동 배포 |
|---|---|---|---|
| 기본 | `.git/hooks/` | ✗ | ✗ |
| `core.hooksPath` | `.githooks/` (이름 자유) | ✓ | 설정 실행 후 ✓ |

중요한 건 **이것도 여전히 opt-in** 이라는 점이다. 레포에 `.githooks/pre-commit` 이 커밋돼 있어도 **clone 만으로는 안 돈다.** 각자 한 번 `git config core.hooksPath ...` 를 실행해야 켜진다. 3절의 안전 속성이 그대로 유지된다.

## 5. 그 한 줄을 자동화하기 — `prepare` 스크립트

Node 프로젝트면 `package.json` 의 `prepare` 가 `npm install`·`pnpm install` 시점에 자동 실행된다.

```json
{
  "scripts": {
    "prepare": "git config core.hooksPath .githooks || true"
  }
}
```

`|| true` 는 `.git` 이 없는 환경(예: `.dockerignore` 로 `.git` 을 제외한 도커 빌드)에서 install 이 실패하지 않게 하는 안전장치다.

**husky 가 하는 일이 본질적으로 이것이다** — 훅을 추적되는 폴더(`.husky/`)에 두고, 설치 시점에 `core.hooksPath` 를 그쪽으로 돌린다. 크로스 플랫폼 처리와 엣지 케이스가 얹혀 있을 뿐이다. 훅이 한두 개라면 의존성 없이 위 두 줄로 충분하다.

## 6. lint-staged 는 다른 역할

훅이 심어지면 **그 안에서 무엇을 돌릴지**가 남는다. 여기서 레포 전체를 검사하면(`prettier --check .`) 매 커밋마다 수천 파일을 훑어 느려진다.

`lint-staged` 는 `git diff --cached` 로 **지금 커밋하려는 파일만** 뽑아 명령에 넘기고, `--write` 로 수정된 결과를 자동으로 다시 스테이징한다.

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,json,md}": "prettier --write"
  }
}
```

정리하면 **husky = 훅을 심는 도구 · lint-staged = 훅 안에서 돌릴 내용**이고, 역할이 완전히 다르다.

## 7. 직접 만든다면 — 부분 스테이징 함정

훅을 손으로 쓸 때 가장 흔한 버그가 이것이다.

```sh
#!/bin/sh
files=$(git diff --cached --name-only --diff-filter=ACMR)
prettier --write $files
git add $files     # ← 위험
```

한 파일에 **스테이징한 변경과 안 한 변경이 섞여 있으면**, `prettier` 는 워킹 트리 전체를 고치고 `git add` 가 **커밋할 생각이 없던 부분까지 스테이징한다.** lint-staged 가 대신 처리해 주는 것이 이 엣지다.

직접 쓴다면 갈라서 처리한다 — 워킹 트리가 깨끗한 파일만 고쳐서 다시 add 하고, 변경이 남은 파일은 **검사만 하고 사용자에게 넘긴다.**

```sh
unstaged=$(git diff --name-only)
# $unstaged 에 든 파일은 --write 대상에서 빼고 --check 만 돌린다
```

## 8. 훅은 로컬 강제다 — CI 를 대체하지 않는다

- 훅은 우회할 수 있다 (`git commit` 에 훅 건너뛰기 옵션이 있다)
- 다른 환경·다른 도구로 들어오는 커밋도 있다

그래서 **훅은 앞단, CI 는 백스톱**으로 둘 다 두는 구성이 일반적이다. CI 에만 두면 공백 한 줄 때문에 빌드 전체가 red 가 되고 파이프라인 한 번이 통째로 버려진다. 훅만 두면 강제가 안 된다.

## 참고

- `githooks(5)` — `git help githooks`
- `core.hooksPath` 는 git **2.9 이상**에서 동작한다
