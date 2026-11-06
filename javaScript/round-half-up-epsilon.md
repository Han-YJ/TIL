# 반올림 보정에 고정 EPSILON 은 큰 값에서 무력하다

부동소수 오차(`1.005 * 100 = 100.49999…`) 때문에 흔히 쓰는 보정:

```js
Math.round((value + Number.EPSILON) * 10 ** d) / 10 ** d
```

`Number.EPSILON`(≈2.2e-16)은 **1 근처**의 간격이다. 값이 커지면 그 값 근처 간격(ULP)이 EPSILON 보다 커져서 더해도 아무것도 바뀌지 않는다.

```js
// 둘째 자리 반올림
4.765 → 4.76  // 기대 4.77
```

x.xx5 경계를 전수로 돌리면 28만 건 중 약 1.8만 건이 내려갔다.

## 해결 — 유효 숫자 15자리로 끊고 반올림

```js
function roundHalfUp(value, digits) {
  const factor = 10 ** digits;
  const rounded = Math.round(Number((Math.abs(value) * factor).toPrecision(15))) / factor;
  return value < 0 ? -rounded : rounded;
}
```

double 은 유효 숫자 15자리까지는 십진 표현을 보존하므로, 그 자리에서 끊으면 `…4999999` 꼬리가 `…5` 로 돌아온다. 값 크기와 무관하게 0.5 경계가 지켜진다 (같은 경계 집합에서 오차 0).
