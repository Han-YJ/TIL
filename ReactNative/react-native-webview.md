# React-native-webview

```js
    <View style={{ flex: 1, marginTop: 20 }}>
      <WebView
        style={styles.container}
        source={{ uri: 'http://sales.domain.com' }}
      />
    </View>
//safe area를 위한 marginTop + webview
```


## Issue
### backButton 처리
- backbutton 누르면 exit app 되는 현상

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
          setGoBackable(url !== BASE_URL);
          console.log('onMessage', url);
        }} 
      />

```

  
  ### 몇몇 페이지만 흰화면으로 나오는 현상
  - 웹에서는 정상적으로 동장하는 페이지가 웹뷰에서는 흰화면이었고, 아주 잠깐 페이지가 보였다가 바뀌는 것으로 봐선 페이지 열리고 난 후의 어떤 메소드에서 오류가 난 것으로 추측
  - array.length, array.flat 때문이었다😢 typescript 얼른 배워야지,,,
  - array.flat은 concat으로 바꿈. 최적화도 더 잘되어 있다
