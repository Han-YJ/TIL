# React-native-webview

{% raw %}
```js
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : 15,
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

    <View style={styles.container}>
      <WebView
        style={styles.webview}
        source={{ uri: 'http://sales.domain.com' }}
      />
    </View>
//safe area를 위한 marginTop + webview
```
{% endraw %}


## Issue
### backButton 처리 (종료팝업 추가)
- backbutton 누르면 exit app 되는 현상 
  
App.js
```js
const handleClose = () => {
    Alert.alert('앱 종료', '종료하시겠습니까?', [
      {
        text: '아니오',
        onPress: () => null,
      },
      {
        text: '예',
        onPress: () => BackHandler.exitApp(),
      },
    ]);
  };
```
  
  WebView.js
{% raw %}
```js
  const [webview, setWebview] = useState();
  const [goBackable, setGoBackable] = useState(false);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        console.log('goBackable', goBackable);
        if (goBackable) webview.goBack();
        else handleClose();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [goBackable]);

  useEffect(() => {
    if (webview && webview.clearCache) webview.clearCache();
  }, [webview]);

  const injectedCode = `(function() { 
    function wrap(fn) { 
      return function wrapper() { 
        var res = fn.apply(this, arguments); 
        window.ReactNativeWebView.postMessage(window.location.href); 
        return res; 
      } 
    } 
    
    history.pushState = wrap(history.pushState); 
    history.replaceState = wrap(history.replaceState); 
    window.addEventListener('popstate', 
    function() { 
      window.ReactNativeWebView.postMessage(window.location.href); 
    });
  
  })(); 
  true; `;

  <WebView
        ref={(ref) => setWebview(ref)}
        style={styles.container}
        source={{ uri: BASE_URL }}
        pullToRefreshEnabled={true}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures={true}
        overScrollMode={'never'}
        injectedJavaScript={injectedCode}
        onMessage={(event) => {
          const url = event.nativeEvent.data;
          const baseUrl = `${BASE_URL}/`;
          const homeUrl = `${BASE_URL}/Home`;
          //홈 url일 경우 백버튼누르면 종료할건지 확인
          setGoBackable(url !== baseUrl && url !== homeUrl);
        }} 
      />

```
{% endraw %}

### backButton 처리 (여러번 누르면 종료메세지 & 종료 추가)
```js
  const [exitApp, setExitApp] = useState(0);
  const timeout = useRef(null);
  const exitMessage = '한번 더 누르시면 앱을 종료합니다.';

const onExit = () => {
  BackHandler.exitApp();
  setExitApp(0);
}


  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        //console.log('goBackable', goBackable);
        if (goBackable) {
          //뒤로가기 페이지 있을 경우
          if (exitApp == undefined || exitApp === 0) {
            
            webview.goBack();
            setExitApp(1);

            timeout.current = setTimeout(() => {
              setExitApp(0);
            }, 800);

          } else if (exitApp === 1) {

            clearTimeout(timeout.current);
            ToastAndroid.show(exitMessage, ToastAndroid.SHORT);
            setExitApp(2);

            timeout.current = setTimeout(() => {
              setExitApp(0);
            }, 1000);
            
          } else {//exitApp === 2
            clearTimeout(timeout.current);
            onExit();
          }
        } else {
          //첫 페이지일 경우
          if (exitApp == undefined || exitApp === 0) {
            ToastAndroid.show(exitMessage, ToastAndroid.SHORT);
            setExitApp(1);
            timeout.current = setTimeout(() => {
              setExitApp(0);
            }, 2000);
          } else {
            clearTimeout(timeout.current);
            onExit();
          }
        }
        return true;
      }
    );
    return () => backHandler.remove();
  }, [goBackable, exitApp]);
```


  
  ### 몇몇 페이지만 흰화면으로 나오는 현상 (렌더x)
  - 웹에서는 정상적으로 동장하는 페이지가 웹뷰에서는 흰화면이었고, 아주 잠깐 페이지가 보였다가 바뀌는 것으로 봐선 페이지 열리고 난 후의 어떤 메소드에서 오류가 난 것으로 추측
  - array.length, array.flat 때문이었다😢 typescript 얼른 배워야지,,,
  - array.flat은 concat으로 바꿈. 최적화도 더 잘되어 있다


  ### a링크 외부 브라우저로 열기
  ```js
  // 웹뷰 로딩이 시작되거나 끝나면 호출하는 함수 navState로 url 감지
  const onNavigationStateChange = (event) => {
    console.log(event);
    if (!event.url.includes('yourdomain.com')) {
      Linking.openURL(event.url);
      return false;
    }
    return true;
  };

  // 처음 호출한 URL에서 다시 Redirect하는 경우에, 사용하면 navState url 감지
  const onShouldStartLoadWithRequest = (event) => {
    if (!event.url.includes('yourdomain.com')) {
      Linking.openURL(event.url);
      return false;
    }
    return true;
  };

  return (
    <WebView
      ref={(ref) => setWebview(ref)}
      //...
      onNavigationStateChange={onNavigationStateChange}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
    />
  )
   
  ```
  - 참고 : [웹뷰 내 a 태그 클릭시 새로운 탭 띄우기 티스토리](https://kyounghwan01.github.io/blog/React/react-native/react-native-webview/#rn%E1%84%8B%E1%85%A6%E1%84%89%E1%85%A5-webview%E1%84%85%E1%85%A9-%E1%84%83%E1%85%A6%E1%84%8B%E1%85%B5%E1%84%90%E1%85%A5-%E1%84%89%E1%85%A9%E1%86%BC%E1%84%89%E1%85%B5%E1%86%AB)


  ### webview loading 시 activityindicator 띄우기
  - renderLoading 이용
  - onLoadStart, onLoadEnd를 사용해 state true false를 받아서 View로 표시 할 수도 있다. 하지만 onLoadEnd의 시점이 첫 화면이 보인 이후이기 때문에 첫화면 전까지만 보이길 원해서 renderLoading을 이용

  ```js
    const ActivityIndicatorElement = () => {
    //making a view to show to while loading the webpage
    return (
      <ActivityIndicator
        color='#009688'
        size='large'
        style={styles.activityIndicatorStyle}
      />
    );
  };

  //...

  return (
    <WebView
          ref={(ref) => setWebview(ref)}
          //...
          //app loading
          startInLoadingState={true}
          renderLoading={ActivityIndicatorElement}
        />
  )
  ```
  - 참고: [React-native-webview renderLoading](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md#renderloading)
