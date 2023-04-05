# React-snap
- react prerender library
- next.js등의 ssr 을 하지 못하는 상황에서의 대안이지만 완벽하지는 못하다

## html 파일 생성
### 1. react-snap 설치
```bash
yarn add react-snap -D
```


## ISSUE
### 1. refresh 시 까만화면 or 이상한 layout 표시
- apache 설정 변경
```conf
#기존
RewriteRule ^ index.html [QSA,L]

#변경 - react-snap 빌드 시 만들어지는 200.html로 변경
RewriteRule ^ 200.html [QSA,L]
```