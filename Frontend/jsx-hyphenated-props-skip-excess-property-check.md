# JSX의 하이픈 속성은 초과 속성 검사를 건너뛴다 — `role`은 잡히고 `aria-describedby`는 안 잡힌다

오류 안내를 컨트롤에 프로그램적으로 이어주려고 `aria-describedby`를 컴포넌트에 내려보냈다. 타입은 통과했고 렌더도 정상이었다. 그런데 **DOM에는 그 속성이 없었다.** 그 컴포넌트가 애초에 받지 않는 prop이었는데 타입체커가 끝까지 아무 말도 안 했다.

## 재현

```tsx
type FooProps = { label: string };
declare function Foo(p: FooProps): JSX.Element;

<Foo label="x" aria-describedby="hint" />;  // ✅ 에러 없음
<Foo label="x" data-testid="t" />;          // ✅ 에러 없음
<Foo label="x" ariaDescribedby="hint" />;   // ❌ TS2322
<Foo label="x" role="button" />;            // ❌ TS2322
```

`FooProps`는 넷 중 어느 것도 선언하지 않았다. 그런데 위 둘만 통과한다. (TypeScript 5.9.3 실측)

## 왜 갈리나

초과 속성 검사(excess property check)는 객체 리터럴을 대상으로 돈다. JSX 속성도 그 검사를 받지만, **속성 이름에 하이픈이 들어 있으면 제외된다.**

`data-*`를 쓰게 하려고 들어온 규칙이다. 그런데 판정 축이 "이 속성이 무엇인가"가 아니라 **"이름에 하이픈이 있는가"** 뿐이라, `aria-*` 전체가 같은 문으로 따라 들어온다.

그래서 셋째 줄과 넷째 줄의 대비가 생긴다. `ariaDescribedby`는 이름을 camelCase로 바꿨을 뿐인데 잡히고, `role`은 접근성 속성인데도 하이픈이 없어서 잡힌다. **접근성이냐 아니냐가 아니라 글자 모양이 기준이다.**

## 실패가 조용하다

세 가지가 동시에 성립한다.

- 타입 통과 — 위에서 본 그대로
- 렌더 정상 — 컴포넌트는 모르는 prop을 그냥 무시한다
- **DOM 미부착** — 그 속성은 어디에도 안 남는다

증상이 "안 뜬다"가 아니라 "**반쪽만 뜬다**"로 나타나는 게 고약하다. 컴포넌트가 `aria-invalid`는 받고 `aria-describedby`는 안 받는 경우, 스크린리더 사용자는 **"잘못됨"만 듣고 왜 잘못됐는지는 못 듣는다.** 시각적으로는 빨간 문구가 멀쩡히 보이니 눈으로 훑어서는 절대 안 걸린다.

## 확인법 — 타입이 아니라 DOM을 본다

넘긴 하이픈 속성이 렌더 결과에 실제로 붙었는지가 유일한 근거다.

```
// 닿은 경우
<input aria-invalid="true" aria-describedby="f-hint" …>
// 버려진 경우 — 내가 넘긴 적 없는 것처럼 깨끗하다
<input aria-invalid="true" …>
```

코드 쪽에서 미리 가리려면 그 컴포넌트의 시그니처를 본다. **명시 구조분해로 받고 rest를 안 펼치면 그 자리에서 끝**이다.

```tsx
// 흘려보냄
function Foo({ label, ...rest }: FooProps) { return <input {...rest} … />; }
// 버림
function Foo({ label }: FooProps) { return <input … />; }
```

## 해법

prop 타입에 **하이픈 이름을 그대로 선언**하면 그때부터는 타입이 지켜준다.

```tsx
type FooProps = {
  label: string;
  'aria-describedby'?: string;
};
```

선언한 뒤에는 오타가 잡히고(`aria-describeby` → 에러), 실제 DOM 노드까지 전달하는 책임만 남는다. rest 스프레드로 여는 방법도 있지만, 디자인 시스템 컴포넌트라면 **받을 것을 명시하는 쪽**이 낫다 — 무엇을 지원하는지가 타입에 남는다.

## 넓혀 보면

같은 계약이 다른 자리에도 있다. Radix `asChild`가 자식에게 props를 병합해 넘길 때, 자식이 안 받으면 조용히 사라진다. 원인은 다르지만 **결론이 같다 — 주는 쪽은 주는 것까지만 보장하고, 받는 쪽이 열려 있는지는 아무도 검사하지 않는다.**

접근성 배선은 이 구멍에 특히 잘 빠진다. `aria-*`가 전부 하이픈 이름이라 **타입체커의 보호를 구조적으로 못 받는다.** 그래서 "타입이 통과했으니 연결됐다"가 성립하지 않고, 매번 렌더 결과를 봐야 한다.

디자인 시스템 컴포넌트가 prop을 닫힌 집합으로 좁히는 선택도 같은 값을 치른다. 엄격해지는 대신, **접근성 prop을 넘기는 모든 사용처가 조용히 깨질 수 있는 자리**가 된다.
