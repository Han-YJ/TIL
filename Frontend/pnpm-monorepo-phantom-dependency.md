# pnpm 모노레포 phantom dependency — 왜 로컬에선 절대 안 잡히나

`package.json`에 선언하지 않은 패키지를 import했는데 로컬에선 잘 돌고, **CI에서만** `Failed to resolve import` 로 깨지는 실패 클래스. 원인을 알면 lint로 커밋 전에 차단할 수 있다.

## 메커니즘

pnpm 워크스페이스에서 어떤 패키지(`packages/ui`)가 `@testing-library/user-event`를 선언하면, 호이스팅/스토어 레이아웃에 따라 그 패키지가 **선언하지 않은 다른 워크스페이스(`apps/web`)에서도 우연히 해석**될 수 있다. 로컬 node_modules는 설치 이력이 누적된 상태라 이 우연이 거의 항상 성립한다.

CI는 매번 `pnpm install --frozen-lockfile`로 클린 설치를 하므로 레이아웃이 엄격해지고, 미선언 import가 그제서야 해석 실패한다. **로컬에서 재현이 원리적으로 안 되는 실패**라서, 테스트를 아무리 미리 돌려도 못 잡는다.

## 차단: import/no-extraneous-dependencies

실제 해석 여부와 무관하게 **선언 여부만 검사**하므로 이 클래스를 정확히 잡는다:

```js
// eslint.config — 워크스페이스별 설정
'import/no-extraneous-dependencies': ['error', {
  // 테스트·설정 파일은 devDependencies import 허용
  devDependencies: ['**/*.test.{ts,tsx}', 'test/**', 'scripts/**', '*.config.{ts,mjs}'],
  // 어느 package.json을 "선언"으로 인정할지 — 워크스페이스 자신(+ 필요시 모노레포 루트)
  packageDir: [import.meta.dirname],
}],
```

- `devDependencies` 글롭을 안 열면 테스트 파일의 `@testing-library/*` import가 전부 에러가 되므로 필수
- `packageDir`에 루트를 포함할지는 정책 선택 — 좁힐수록 워크스페이스 자립성이 강해진다
- 룰만 넣으면 로컬/에디터에서만 잡히므로, CI 파이프라인에 lint 스텝이 있어야 게이트로 완성된다

## 곁들임: CI에서만 깨지는 또 다른 클래스 — 타임존

같은 날 같은 파이프라인에서 발견한 다른 환경 의존 실패: 로컬(KST)에서 작성된 날짜 포맷 테스트가 CI(UTC)에서 9시간 어긋나 실패했다. vitest는 설정으로 고정할 수 있다:

```ts
// vitest.config.ts
test: { env: { TZ: 'Asia/Seoul' } }
```

수정 검증도 로컬에서 `TZ=UTC pnpm test`로 CI 조건을 재현해서 했다. **"CI에서만 깨진다"는 곧 "환경 차이를 찾아 로컬에서 그 환경을 재현하라"는 신호**다.
