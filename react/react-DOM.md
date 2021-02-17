## React-dom
- 만들어진 제일 상위의 component를 html과 연결
- index.html의 root를 JS와 연결

## index.js
```
import ReactDOM from 'react-dom'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

//<React.StrictMode>과 </React.StrictMode> 는 생략가능 'use strict' 같은 것
```
ReactDOM이 index.html와 index.js를 연결 =>root와 App이라는 component를 연결

## jsx
- JS 코드위에서 html를 간단하게 쓸 수 있게 도움  
- jsx가 없었을때?
```
function App() {
  return React.createElement('h1', {}, 'Hello:)!!');
}
```
- 형제 node를 쓸 수 없음(wrapped in an enclosing tag) => React.Fragment를 사용해 감싸준다
```
function App() {
  const name = 'React';
  return <h1>Hello! {name}!</h1>
  <h1>Hello</h1>
}
//error

function App() {
  const name = 'React';
  return 
  <React.Fragment>
    <h1>Hello! {name}!</h1>
    <h1>Hello</h1>
  </React.Fragment>
}
//특별한 경우가 아니면 div말고 React.Fragment로 감싸준다
//<> = <React.Fragment>
}
```
### HTML과 JSX의 차이점?
```
//HTML
class="title"
onclick=""
//JSX
className="title"
onClick=""
```
- JSX는 JS 코드. logic 작성 가능
```
function App() {
  const name = 'React';
  return <h1>Hello! {name}!</h1>;
}
//Hello! React!
```

### 참고
- [Introducing JSX](https://reactjs.org/docs/introducing-jsx.html)