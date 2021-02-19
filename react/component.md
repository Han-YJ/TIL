## Component
- Class (rcc)  
  - React.Component
  - React.PureComponent
- Function (rsi)
  - function
  - memo(funciton)
  - React Hook

### state가 변할때마다 전체적으로 re-render되지만 성능이 괜찮은 이유?
- Virtual-DOM을 사용하기 때문에 실제로 변화가 있는 요소들만 update가 된다
  => 디버깅 시, HTML Elements에서 DOM요소 전체가 변화가 일어난다면 뭔가 잘못하고 있는 것🤔
- but, render할 때마다 실행되는 무거운 logic이 있다면 성능에 좋지않다
  => 이것을 방지하기 위해 사용되는 것이 pureComponent와 memo

## pureComponent, memo
- comonent나 props에 변화가 없다면 rendering x
- shouldComponentUpdate() 구현 o (Component에는 x)
- Implements it with a **shallow** props and state comparison
  => object 안의 data가 바뀌어도 동일한 object라면 true라고 판단

### shallow comparison 에 update된 data를 알리는 방법?
1. 전달할 때 변화하는 것을 따로 빼서 object로 전달
2. Deconstructing object : 새로운 object를 만들어서 전달

---
 ### 참고
 - [PureComponent](https://reactjs.org/docs/react-api.html#reactpurecomponent)