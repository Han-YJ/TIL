## react deployment with apache server
- package.json
```
"homepage": "http://www.domain.com/test", //test폴더에 넣을때
```
url: http://www.domain.com/test
  
- app.jsx
```
<BrowserRouter basename='/test'>
  <Header />
  <Switch>
    <Route exact path='/'>
      <Home />
    </Route>
    <Route path={('/introduce', '/About')}>
      <Introduce />
    </Route>
  </Switch>
</BrowserRouter>
```

### 참고
- [Apache 서버에 React 앱 배포 및 호스팅](https://ichi.pro/ko/apache-seobeoe-react-aeb-baepo-mich-hoseuting-201288440590458)