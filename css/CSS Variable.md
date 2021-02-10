# CSS Variable
- 자주 사용하는 수치가 있다면 상수로 정해서 쓰는 것이 좋다 (hardcoded x)
  - --custom 이런식으로 작성
- 아무곳에나 작성할 수 있지만 수정이 용이하도록 :root에 작성
- media query를 이용할 때 굉장히 유용 (root를 복사해서 재정의)

```
:root {
  --background-color: thistle;
  --text-color: whitesmoke;
  --base-space: 8px;
}

.box {
  margin-left: calc(var(--base-space)*2);
}

@media screen and (max-width: 768px) {
  :root {
  --background-color: salmon;
  --text-color: blue;
  --base-space: 4px;
  }
}
```

- var에 정의한것이 없다면 기본값을 줄 수도 있다
```
margin-left: var(--base-space, 8);
```