# Turbopack 자체 debugId 와 sentry CLI 주입이 겹치면 서버 소스맵이 한 줄 어긋난다

Sentry 에 들어온 서버 에러의 원본 위치가 늘 실제 줄보다 **한 줄 위**를 가리켰다. 일부 이벤트에는 소스맵 처리 경고(`js_source_maps`)도 붙었다. 소스맵 업로드 기록은 정상이었다.

환경: Next.js 16.4 (Turbopack 빌드) · `@sentry/nextjs` 11.12 · sentry CLI 0.49

## 업로드가 아니라 산출물을 본다

업로드 실패 가설은 업로드 기록으로 바로 기각됐다. 그래서 빌드 산출물을 직접 대조했다.

- `.js` 와 `.map` 짝은 파일 이름이 아니라 **debugId 로** 맞춘다. Turbopack 의 정적 청크는 맵 이름이 js 이름과 달라 이름으로 짝을 지으면 0건이 나온다.
- 짝마다 「청크 머리의 debugId 등록 스니펫 줄 수」와 「맵이 가리키는 첫 코드 줄」을 비교한다.

결과: 청크 머리에 스니펫이 **두 줄** 있었다.

1. Turbopack 이 스스로 넣은 `_debugIds` 등록 줄 (Next 의 `turbopack.debugIds` 기능)
2. sentry CLI 가 `sourcemaps inject` 로 넣은 `_sentryDebugIds` 등록 줄

## 왜 어긋나나

- sentry CLI 는 **자기 표식(`_sentryDebugIds`)만** 이미 주입됐다고 알아본다. Turbopack 의 `_debugIds` 는 모르니 맨 앞에 한 줄을 더 붙인다.
- Turbopack 의 맵은 index map(`sections[]`)이다. CLI 가 줄을 붙여도 각 section 의 `offset.line` 은 옮기지 않는다.
- 그래서 실제 코드는 한 줄 내려갔는데 맵은 그대로 → 모든 프레임이 한 줄씩 어긋난다.

## 처방 — 주입을 하나로

```ts
// next.config.ts
const nextConfig = {
  // debug ID 는 Sentry 빌드 플러그인만 넣는다.
  turbopack: { debugIds: false },
};
```

Turbopack 쪽 주입을 끄면 CLI 가 넣는 한 줄만 남고, 맵 첫 줄 = 스니펫 줄 수로 정렬된다. 로컬 빌드에서 짝 전체가 정렬되는 것을 확인했다.

같은 증상이 sentry 업스트림에도 올라와 있다 (getsentry/toolkit #2294 · #2189). CLI 가 Turbopack 의 표식을 알아보게 되면 이 설정은 다시 볼 대상이다.

## 배운 것

- 원본 위치가 「일정하게 한 줄」 어긋나면 맵 누락이 아니라 **맵을 만든 뒤 앞에 줄이 붙은 것**을 먼저 의심한다.
- 빌드 도구와 모니터링 도구가 같은 일(debugId 주입)을 각자 하면, 둘 중 하나만 남긴다.
