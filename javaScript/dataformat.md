# Data format

## toLocalString('en-US')
천의 자리마다 컴마 찍고 싶을 때 사용
```js
//key가 sal로 시작하면 천의자리마다 찍기
{key.startsWith('sal')
  ? value.toLocaleString('en-US')
  : value}
```