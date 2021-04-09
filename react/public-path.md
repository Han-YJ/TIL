## public/images 폴더 경로 접근
process.env.PUBLIC_URL 사용
  
```
<img
  src={process.env.PUBLIC_URL + '/images/logo.png'}
  alt='logo'
/>
```