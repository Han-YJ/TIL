# React Hook
기존의 함수형 component에서 state와 lifecycle을 잘 이용할 수 있게 만든 것

## APIs
## useState()
- state를 이용하기 위해 사용
- 변수와 변수를 업데이트 하는 것 두가지를 정의하고 useState를 이용
```
const [count, setCount] = useState(0);
// count와 count를 업데이트 시켜주는 setCount를 정의하고 useState 초기값을 0으로 사용
```
- class에서 멤버변수는 class가 만들어질 때 한번만 만들어지고 render함수만 반복적으로 호출되는 반면
함수는 component가 변경되면 code block 전체가 반복돼서 호출된다. 지역변수들도 계속 반복
  => 계속 새로운 object가 만들어진다
  => component에 연결된 변수들은 useState를 사용하면 이전값이 저장되어 다시 사용 o

## useRef()
- createRef와 달리 한 번 만들어서 메모리에 저장해놓고 재사용

## useCallback()
- 함수 재사용
```
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
```

## useEffect()
- Similar to componentDidMount and componentDidUpdate
- component가 mount or update 가 될 때마다 호출
- 빈 배열일때나 특정 값이 변경 될 때만 호출되게 만들수도 있다(두번째 인자)
### component가 unmount될 때 호출하기?
```js
useEffect(() => {
  console.log('state가 변경될 때 마다 호출!');
  return () => {
    console.log('언마운트 시 호출!')
  }
})
```

### useEffect dependency warning
- useEffect를 작성하다보면 자주 보이는 warning
- useEffect 안에서 사용되는 값들이 두번째 인자 []안에 없으면 말해준다
- 해결? 
  - 1. useEffect내 state를 넣어준다
  ```JS
  const [count, setCount] = useState(0);
    seEffect(() => {
    setCount(count + 1);
    }, [count]);

  //OR

  const [count, setCount] = useState(0);
  useEffect(() => {
  setCount(state => state + 1);
  }, []);
  ```
  2. useEffect 내부에 함수를 정의한 경우
  ```js
  //params변수를 쓰기때문에 params를 배열에 넣어주지 않으면 경고가 나온다.
  const getInitNoti = async () => {
  const res = await apis.notification.getNotice(params);
  setNotiData(res.data.user_notices);
  };

  useEffect(() => {
    getInitNoti();
  }, [getInitNoti, params]);
  

  //useCallback을 이요하는 방법
  const getInitNoti = useCallback(async () => {
  const res = await apis.notification.getNotice(params);
  setNotiData(res.data.user_notices);
    }));
  }, [params]);

  useEffect(() => {
    getInitNoti();
  }, [getInitNoti]);

  //useCallback을 사용하면 params가 바뀔때만 getInitNoti가 실행되어, 불필요한 함수 생성 및 실행을 막을 수 있다.
  //(useCallback이 없다면 리렌더링 될 때마다, 계속 getInitNoti함수를 만들고 실행)
  ```


### 참고
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [Hooks API Reference](https://ko.reactjs.org/docs/hooks-reference.html)