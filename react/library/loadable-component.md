# Loadable component
- Code splitting
```js
const TestPage = loadable(() => import('./pages/test_page/test_page'), {
  fallback: <div>Loading...</div>,
});

<Switch>
  <RouteWrapper
    path='/test'
    layout={Layout}
    component={() => <TestPage dataService={dataService} />}
  />
</Switch>
```

  - fallback : Component 받고있을 때 보여지는 화면 설정