# 접근 이름과 라이브 리전, 테스트가 놓치는 두 지점

접근성 코드를 짜고 테스트까지 붙였는데 **테스트가 지키려던 것을 안 지키고 있던** 경우 두 가지.

## 1. 접근 이름을 `getByLabelText`로 단언하면 오탐이 난다

글자수 카운터를 라벨과 같은 줄에 두려다, 카운터를 `<label>` 안에 넣으면 접근 이름이 `내용 (6/10)`이 되어 **타이핑마다 이름이 바뀌는** 문제를 만났다. 그래서 카운터를 `<label>` 밖에 두고, 그 불변을 지키는 테스트를 붙였다.

```tsx
expect(screen.getByLabelText('내용')).toBeInTheDocument();
```

이 단언은 **채널이 틀렸다.** `getByLabelText`는 label의 textContent를 매칭하고 `aria-hidden`을 무시한다. 필수 표시가 이렇게 생긴 컴포넌트에서:

```tsx
<label htmlFor={id}>
  <span>내용</span>
  <span aria-hidden="true">*</span>
</label>
```

`required`를 켜는 순간 label textContent가 `내용*`이 되어 **조회가 실패**한다. 정작 계산된 접근 이름은 `내용` 그대로다(`*`는 `aria-hidden`이므로 이름 계산에서 빠진다).

실제로 세 케이스를 재현해보면 이렇다.

| 케이스 | `getByLabelText('내용')` | 계산된 접근 이름 |
|---|---|---|
| 기본 | 찾음 | `내용` |
| + `required` | **실패** | `내용` |
| 카운터를 `<label>` 안으로 (회귀) | 실패 | `내용(6/10)` |

2행이 false positive다. 그리고 이게 위험한 이유는 — 누군가 `required`를 붙였을 때 테스트가 깨지고, 십중팔구 부분 매칭(`/내용/`)으로 느슨하게 고쳐진다. 그러면 **3행의 진짜 회귀를 더 이상 못 잡는다.**

정확한 채널을 쓰면 두 문제가 같이 사라진다:

```tsx
expect(screen.getByRole('textbox')).toHaveAccessibleName('내용');
```

`required`에서도 `내용`을 유지하고, 회귀에서는 `내용(6/10)`으로 잡힌다.

**교훈**: "이름"을 검증할 때 텍스트 조회 쿼리로 대신하지 않는다. 접근 이름은 [계산 알고리즘](https://www.w3.org/TR/accname-1.2/)의 결과이고, textContent와 다르다.

## 2. 라이브 리전에 같은 문자열을 다시 넣으면 낭독되지 않는다

드래그로 순서를 바꿀 때마다 결과를 알리는 리전을 뒀다.

```tsx
const [message, setMessage] = useState('');
...
setMessage(`${label} 자리를 ${index + 1}번째로 옮겼어요.`);
...
<p aria-live="polite" className="sr-only">{message}</p>
```

같은 라벨을 가진 항목이 둘 있으면 문구가 **완전히 동일**해진다. 그러면 React가 동일 값 `setState`를 bail out해서 리렌더도, DOM 변경도 일어나지 않는다. 라이브 리전은 **내용이 바뀔 때** 읽으므로 결과적으로 무음이다.

리전 자체는 처음부터 마운트돼 있어야 한다(조건부로 나타나면 아예 안 읽힌다)는 건 지켰는데, 그 다음 함정에 걸린 셈.

대응은 값을 강제로 유일하게 만드는 것:

```tsx
const [message, setMessage] = useState({ seq: 0, text: '' });
const announce = (text: string) => setMessage((p) => ({ seq: p.seq + 1, text }));
...
<p aria-live="polite" className="sr-only">{message.text}</p>
```

`seq`는 렌더에 안 쓰이지만 객체가 매번 새로 만들어져 bail out을 피한다. 메시지에 위치 같은 변하는 정보를 넣어 자연히 유일하게 만드는 방법도 된다.

## 공통점

**axe는 이 둘을 못 잡는다.** axe가 보는 건 마크업의 정적 위반이고, "있어야 할 채널이 없는 것"이나 "있는 채널이 발화하지 않는 것"은 대상이 아니다. axe 통과를 "접근성 완료"로 읽으면 안 된다.
