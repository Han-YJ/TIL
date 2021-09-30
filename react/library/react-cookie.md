# React-cookie
```js
  const [cookies, setCookie, removeCookie] = useCookies(['cookieName']);
  const id = 'idValue';

  //set
  setCookie('remember_id', id, {
        path: '/',
        maxAge: 2147483647,
        sameSite: 'LAX',
      });
    //sameSite LAX는 필요한 경우 사용

  //get
  const rememberId = cookies.remember_id

  //remove
  removeCookie('remember_id', { path: '/' });
```
