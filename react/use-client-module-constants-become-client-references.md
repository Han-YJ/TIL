# `'use client'` 파일에서 꺼낸 문자열 상수가 서버에서는 함수가 된다

서버 컴포넌트인 레이아웃에 `data-*` 속성 하나를 붙였을 뿐인데 브라우저에서는 그 속성이 보이지 않았다. 에러 화면도 없고 타입 체크와 단위 테스트도 모두 통과했다. 원인은 상수를 **어느 파일에서 import 했는가** 하나였다.

## 증상

스크롤 컨테이너를 찾으려고 속성 이름을 상수로 만들었다. 이 상수를 쓰는 훅이 있는 파일에 같이 넣었는데, 그 파일은 훅 때문에 `'use client'` 다.

{% raw %}
```tsx
// shared/hooks/useScrollReturn.ts
'use client';

export const SCROLL_ATTR = 'data-scroll-root';

export function useScrollReturn() {
  /* document.querySelector(`[${SCROLL_ATTR}]`) ... */
}
```

```tsx
// app/layout.tsx — 서버 컴포넌트
import { SCROLL_ATTR } from '@/shared/hooks/useScrollReturn';

export default function Layout({ children }) {
  return <div className="overflow-y-auto" {...{ [SCROLL_ATTR]: '' }}>{children}</div>;
}
```
{% endraw %}

화면은 멀쩡하게 그려진다. 그런데 `document.querySelector('[data-scroll-root]')` 는 계속 `null` 이었고, 그 위에서 돌던 기능도 조용히 동작하지 않았다.

dev 서버 로그를 끝까지 내려 보니 이런 경고가 있었다.

```
Invalid attribute name: `function() { throw new Error("Attempted to call SCROLL_ATTR() from the server but SCROLL_ATTR is on the client. ...") }`
```

**속성 이름 자리에 함수 소스가 통째로 들어가 있었다.**

## 왜 이렇게 되나

`'use client'` 는 "이 파일은 클라이언트 번들에 들어간다"는 경계 표시다. 서버 쪽 번들러는 그 파일을 실행하지 않는다. 대신 **파일의 export 전부를 client reference 로 바꿔치기한다.** 컴포넌트만이 아니라 문자열이든 숫자든 객체든 모든 export 가 대상이다.

client reference 는 서버에서 컴포넌트로 렌더하거나 클라이언트 컴포넌트의 prop 으로 넘길 때만 의미가 있다. 서버에서 그 값을 직접 쓰면 이렇게 된다.

- 호출하면 → 위 메시지로 throw
- 문자열처럼 쓰면 → 함수 객체가 `toString()` 돼 함수 소스가 나옴

그래서 계산 키 `{ [SCROLL_ATTR]: '' }` 의 키가 함수 소스 문자열이 됐다. react-dom 은 유효하지 않은 속성 이름이라며 경고만 남기고 버렸다.

조용히 지나가는 이유는 세 가지다.

- **타입은 통과한다** — TypeScript 는 `'use client'` 경계를 모른다. `SCROLL_ATTR` 은 끝까지 `string` 이다.
- **단위 테스트는 통과한다** — jsdom 테스트는 서버 번들을 거치지 않는다. 테스트가 속성을 직접 달아 주면 훅은 정상 동작한다.
- **런타임 에러가 아니다** — 경고 한 줄만 남고 렌더는 계속된다.

## 알아차리는 법

- 서버 로그나 콘솔에 `Attempted to call X() from the server but X is on the client` 가 **에러가 아니라 속성 이름이나 문자열 안에** 섞여 나온다.
- 서버 컴포넌트에서 import 한 값이 `typeof === 'function'` 이다. 의심스러우면 서버 컴포넌트에서 `console.log(typeof SCROLL_ATTR)` 한 줄을 찍어 본다.

## 대응

서버와 클라이언트가 같이 쓰는 상수는 **`'use client'` 가 없는 파일**에 둔다.

```ts
// shared/lib/scrollRoot.ts — 지시어 없음
export const SCROLL_ATTR = 'data-scroll-root';
```

```ts
// shared/hooks/useScrollReturn.ts
'use client';
import { SCROLL_ATTR } from '@/shared/lib/scrollRoot';
```

레이아웃도 `shared/lib/scrollRoot` 에서 가져오면 서버에서도 그냥 문자열이다.

## 일반화

- `'use client'` 파일은 서버 입장에서 **"값이 들어 있지 않은 상자"** 다. 거기서 꺼낸 것은 렌더하거나 넘기는 것만 할 수 있고 읽을 수는 없다.
- 컴포넌트나 훅 파일 옆에 상수·유틸을 같이 export 하는 습관은 클라이언트끼리만 쓸 때는 문제가 없다. 그 상수를 서버 컴포넌트가 import 하는 순간 깨진다.
- 공용 값(상수·순수 함수·스키마)은 지시어 없는 모듈로 분리해 두는 편이 안전하다. 경계를 넘는 것은 렌더할 컴포넌트뿐이도록.
