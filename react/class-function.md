## Component
- component를 만드는 방법 두가지 : class, function

### List and Keys
- component를 만들때 id(key)를 정해주는 것이 중요하다
```
const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map((number) =>
  <li key={number.toString()}>
    {number}
  </li>
);
```
Keys help React identify which items have changed, are added, or are removed. Keys should be given to the elements inside the array to give the elements a stable identity
(Array의 index는 x. 고유한 것을 사용한다)

### 참고
- [List and Keys](https://reactjs.org/docs/lists-and-keys.html)

### Class
- component class를 상속받아서 만들기
- state에 따라 주기적으로 update가 필요한 경우
- state가 변경되면 render()실행(lifecycle methods)

### Fucntion
- 간단하게 function
- 상태없이 정적일 경우
- state & lifecycle methods x
- React 16.8~ React Hook에서는 class가 하는 것들 사용가능
- Functional programming
