# Yarn
- Facebook에서 만든 JS package manager

## 설치 및 확인
```js
//설치
$ npm install -g yarn

//확인
$ yarn --version
```

## package upgrade
ex) react-native-webview 업그레이드를 해보자!
```js
//check my version
$ yarn why react-native-webview

//check outdate, current version
$ yarn outdated react-native-webview

//upgrade package
$ yarn upgrade react-native-webviwe --latest
```

***

## ❗ issue
### upgrade 후에 expo start 로 실행했을 때 
Some dependencies are incompatible with the installed expo package version: + package.json 은 바뀌었는데 package-lock.json은 이전버전으로 남아있음

- 해결
  - 해당 project의 node_modules 폴더 삭제 후 yarn install
  - expo doctor --fix-dependencies
