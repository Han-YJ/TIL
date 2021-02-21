## React event
- event를 한단계 더 감싸는 synthetic event
- data를 갖고 있는 곳이 data를 처리하는 곳
- state를 직접 조정하는 것은 좋지 않다
- state가 바뀌면 setState()

### state를 직접 수정하는게 좋지 않은 이유?
1. setState는 비동기 함수
  => 비동기적으로 동작하기 때문에 여러면 업데이트 하는 경우 이전 업데이트 내용이 다음 업데이트 내용으로 덮어 쓰여질 수 있다
2. PureComponent에서 정상적으로 동작 ❌
  => this.state를 인자로 전해줄 경우 같은 object이기 때문에 render함수가 호출되지 않아 data가 달라져도 업데이트가 정상적으로 이루어지지 않는다

### 참고
- [브라우저 Event-MDN](https://developer.mozilla.org/en-US/docs/Web/API/Event)
- [리액트 Handling Events](https://reactjs.org/docs/handling-events.html)