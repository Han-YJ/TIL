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


### 참고
- [React 공식](https://reactjs.org/docs/getting-started.html)

- [Create React App](https://create-react-app.dev/docs/getting-started)

