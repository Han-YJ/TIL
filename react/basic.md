## React
- facebook에서 만든 JS library중 하나 (since 2013)
- user interface를 만들 수 있는 library
- 문서화가 잘 되어있다
- React(web) / React Native(mobile) / React + Electron (desktop app)

### Frameworks vs Library
- Frameworks : 철제구조 완성품. 여러 기능이 묶어져서 나온다(ex. Angular)
- Library : 부품 하나하나. 골격이 따로 없기 때문에 원하는 기능을 만들기 좋다(ex. React)

### React basic
- Component들로 이루어진 UI library
  - Component? 한가지 기능을 수행하는 UI 단위
  - 재사용이 가능한 component들을 모아서 원하는 웹 application을 만들 수 있다
  - cohesive : 다른 component와는 독립적으로 해당하는 state, logic이 있다
- Re-render the whole app on every update
  - state가 변하면 render()를 불러와 자동으로 업데이트
  - Virtual DOM Tree를 사용하고, update 내용을 모아서 한번에 update하기 때문에 성능 저하 x

## React packages

### .gitignore
- 버전관리가 필요하지 않은 것들. tracking x

### package.json
- 프로젝트에서 외부적으로 쓰고 있는 라이브러리와 버전

### node_modules
- module을 추가했을 때 자동적으로 추가

### puclic
배포할때 외부적으로 보여지는 것들
- manifest.json : 웹을 만들때는 필요 x. PWA(progressive web application)을 만들때 필요
- robots.txt : 웹 크롤링을 할 때 필요

### src
- index.js : 화면에 보이는 것  

## State, Props

### State
- component 내에서 정의한 state object
- 상위에서 하위로 state를 props를 통해 전달

### Props
- component 밖에서 주어지는 데이터 => component의 재사용률 ↑
- 상황에 따라 데이터를 받아 그 데이터에 맞게 UI를 보여주기 위해 사용

---
### 참고
- [React 공식](https://reactjs.org/docs/getting-started.html)

- [Create React App](https://create-react-app.dev/docs/getting-started)

