# Routing
사용자가 url link를 요청했을 때, 어떤 페이지로 연결할 건지 결정하는 메커니즘

## React Router
- SPA이기 때문에 되지 않았던 북마크, Page Navigation(뒤로가기, 앞으로 가기 등) 등의 문제를 해결 할 수 있다

## Router
### 1. component를 만들고 

### 2. app 에서 설정

```jsx
function App() {
  return <BrowserRouter>
      <Switch>  
        <Route path="/home">
          <Home/>
        </Route>
        <Route path="/profile">
          <Profile />
        </Route>
      </Switch>
    </BrowserRouter>
}
```

### 3. paht를 여러가지로 설정하려면 배열로 
```jsx
<Route path={['/', '/home']}>
```

### 4. Link를 사용하면 간단하게 경로 사용 가능
```jsx
function App() {
  return <BrowserRouter>
  <nav>
    <Link to="/">Home</Link>
    <Link to="/profile">Home</Link>
  </nav>
      <Switch>  
        <Route path={['/', '/home']} exact>
          <Home/>
        </Route>
        <Route path="/profile">
          <Profile />
        </Route>
      </Switch>
    </BrowserRouter>
}
//exact는 정확히 matching하는 경로를 찾는다
```

### 5. button 클릭 시 페이지 이동
```jsx
<Route path={['/', '/home']} exact component={Home} />
<Route path="/profile" component={Profile} />
```
이런 식으로 component를 전달 할 수 있지만 새로운 component를 만들기 때문에 성능이나 ux 측면에서 좋지 않다. 이렇게 component를 전달하는 것은 추천 x => 자식 component로 전달하고 useHitory 사용하는 것이 좋다

```jsx
const Home = (props) => {
  const history = useHistory();
  return(
  <>
    <h1>Home</h1>
    <button onClick={()=>{
      history.push('/profile')
    }}>Go to Profile</button>
  </>      
  );
}
```

## 참조
- [React-router-web](https://reactrouter.com/web/guides/quick-start)