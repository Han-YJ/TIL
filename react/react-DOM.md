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