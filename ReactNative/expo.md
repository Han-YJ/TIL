# Expo
- RN 개발을 좀 더 쉽게 할 수 있게 도와주는 유틸리티 기능이 있는 플랫폼 (React의 CRA와 비슷)
  
👍 Setup이 되어있기 때문에 개발이 간편하다
👍 배포또한 expo가 해주기때문에 간편하다

👎 Expo가 제공하는 API만 사용가능하기 때문에 좀 더 다양한 기능이 필요하다면 React Native CLI 로 개발해야한다
👎 간단한 app이라 하더라도 기본 크기가 크다


## Get started
### 1. Installation
```bash
# Install the command line tools
$ npm install --global expo-cli
# yarn 도 가능

#Create a new project
$ expo init my-project
```

### 2. Starting the development server
```bash
$ expo start
```
  
![expo-cli](../imgs/expo_start.png)

연결된 기기나 가상기기가 있다면 Run on~ 메뉴를 눌러 확인할 수 있고, expo앱을 받아서 스캔 or 열린 프로젝트를 선택해서 테스트해 볼 수 있다

### 3. Building Standalone Apps
- app.json
```json
 {
   "expo": {
    "name": "Your App Name",
    "icon": "./path/to/your/app-icon.png",
    "version": "1.0.0",
    "slug": "your-app-slug",
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourappname",
      "buildNumber": "1.0.0"
    },
    "android": {
      "package": "com.yourcompany.yourappname",
      "versionCode": 1
    }
   }
 }

```
- start the build
```
expo build:android

expo build:ios
```
  expo build:android에서 app을 선택하면(app-bundle 🙅‍♂️) 빌드 후 나오는 링크를 통해 .apk를 받을 수 있다


<br>

### 참고
- [Expo](https://docs.expo.dev/)