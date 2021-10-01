# Issue
React를 사용하면서 만나는 문제 해결✨

## 첫 페이지 렌더링 속도 문제
- 처음 로드하는 속도가 너무 느렸다. lighthouse 점수도 그 때문에 아주 떨어지는 결과가😥 속도개선이 시급하다 생각하며 열심히 serch...

  ### 문제점
  1. main.js 크기가 큰 것
  2. import package들의 크기 (import cost extension)

  ### 해결
  1. loadable component 을 사용하여 로그인 페이지와 Home 을 제외한 페이지들은 나중에 불러오기
  2. gzip 사용하여 압축해서 보내기 
  3. console.log, comments 정리
  
  ### 결과
  1. loadable component 