# 프롬프트로 "눈대중 금지"를 아무리 써도 눈대중은 안 막힌다

디자인 시안대로 화면을 구현하는 워크플로를 에이전트로 돌리고 있었다. 반복해서 새는 결함이 두 종류 있었다.

- 디자인 시스템에 있는 컴포넌트를 안 쓰고 비슷하게 직접 만든다
- DS를 쓰긴 했는데 시안과 다른 variant·size를 넘긴다

구현에서도 안 잡히고 검증에서도 안 잡혔다. 프롬프트에는 이미 금지가 여러 겹 쌓여 있었다. "눈대중으로 size를 고르지 않는다", "값을 요약·해석하지 않는다", "이 확인은 생략할 수 없다".

## 왜 금지가 안 통했나

데이터 흐름을 따라가 보니 세 단계 전부 모델의 눈에 의존하고 있었다.

1. **플래너**가 디자인 툴 API로 컴포넌트 인스턴스 속성을 읽어 **표로 옮겨 적는다**
2. **구현자**가 그 표를 목표로 삼아 코드를 쓴다
3. **검증자**가 속성을 다시 읽어 코드와 대조한다

1번에서 이미 정보가 샌다. `Size=sm`을 "작은 뱃지"로 옮겨 적는 순간 원본이 사라진다. 3번은 사람이 표 두 개를 눈으로 맞추는 일이고, 같은 컴포넌트가 화면에 열 번 나오면 열 번 정확해야 한다.

**금지는 "정확히 보라"는 요구지, 정확히 볼 수단이 아니다.** 수단을 안 주고 금지만 쌓으면 프롬프트만 길어진다.

## 판정 근거를 데이터로 옮겼다

스크립트 두 개로 갈랐다.

**① 시안 쪽** — 디자인 툴 REST API로 프레임 안의 컴포넌트 인스턴스를 전수 덤프한다. 속성은 API가 준 형태 그대로 저장하고 요약하지 않는다.

```js
// /v1/files/:key/nodes 응답을 걸어 INSTANCE 노드만 수집
{ nodeId: "12:345", setName: "Button",
  props: { Size: "md", Hierarchy: "Primary", Color: "Brand" } }
```

**② 코드 쪽** — TypeScript compiler API로 TSX를 파싱해 DS 패키지에서 import한 컴포넌트의 호출부와 literal prop을 뽑는다.

```js
const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
// import 로 DS 로컬명 → export명 매핑을 만들고
// JsxOpeningElement 를 훑어 { component, props, file, line } 수집
```

**③ 매핑 파일** — 시안 컴포넌트명 → 코드 export + 속성 변환 규칙. 여기가 핵심이다. DS를 시안 그대로 옮긴 게 아니라서 축이 안 맞는 자리가 있다.

```js
Button: {
  export: 'Button',
  // 시안은 Color × Hierarchy 두 축, 코드는 variant 한 축으로 합쳐져 있다
  props: (p) => ({ variant: `${lower(p.Color)}-${lower(p.Hierarchy)}`, size: lower(p.Size) }),
  defaults: { variant: 'brand-primary', size: 'md' },  // cva defaultVariants
}
```

판정은 네 가지다. MISSING(시안엔 DS인데 코드에 호출 없음) · MISMATCH(값 다름) · RAW(네이티브 엘리먼트) · UNMAPPED(매핑 없음). 전부 blocking으로 게이트에 물렸다.

## 첫 실행에서 이미 머지된 화면의 결함이 나왔다

- 섹션 탭: 시안 `Button gray · md` ↔ 코드 `underline · sm`
- 아바타: 시안 `sm` ↔ 코드 `xxxs`
- 네이티브 `<button>`/`<input>` 13곳

사람이 여러 번 봤고 에이전트도 여러 번 검증한 화면이다.

## 만들면서 헛돈 세 가지

실제 프레임으로 돌려보지 않았으면 못 찾았을 것들.

| 함정 | 증상 | 대응 |
|---|---|---|
| cva `defaultVariants` | 코드가 prop을 생략한 게 전부 MISMATCH로 뜬다 | 매핑에 컴포넌트별 기본값을 같이 적고, 생략 = 기본값으로 비교 |
| 라이브러리 세트명 접두사 | 시안이 `Buttons/Button`처럼 카테고리 경로를 붙여 매핑이 안 잡힌다 | 마지막 세그먼트로 조회 |
| 속성 ≠ prop | `Breakpoint`·`State` 같은 반응형/상태 축, 슬롯 표시용 boolean이 prop으로 오인된다 | 기본 변환에서 제외 |

## 일반화

모델에게 시각 판정을 시킬 때, 못 하는 걸 금지로 막으려 하면 프롬프트만 길어진다. **양쪽을 기계 판독 가능한 형태로 뽑아 비교할 수 있는지**를 먼저 본다.

- 디자인 툴은 REST로 컴포넌트 속성을 원본 그대로 준다
- 코드는 AST로 호출부와 prop을 뽑을 수 있다
- 그 사이 번역표만 사람이 관리하면 된다

번역표는 어차피 프롬프트 어딘가에 산문으로 있었던 것이다. 파일로 꺼내면 실행 가능해지고, 안 맞는 자리가 드러나 그 자체가 DS와 시안이 갈라진 목록이 된다.

같은 원리가 설정 파일 층에서는 "본문의 하지 마라" 대신 "도구를 안 주면 못 한다"로 나타난다: [모델 세대 교체는 에이전트 설정 점검 트리거로 쓰기 좋다](./model-generation-switch-as-audit-trigger.md)
