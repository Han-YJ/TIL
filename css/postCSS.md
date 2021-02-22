# Post CSS
- CSS 전처리기
- plugin이 다양함. 확장성 ✔
- create-react-app을 하면 기본적으로 사용가능
- 모듈화가 되어있기 때문에 BEM 같은 복잡한 이름을 쓰지 않아도 간편하게 관리가능

## 모듈화 
```
//css 파일
button.css -> button.module.css 

//button1.jsx
import styles from './button1.module.css';
...
<div className={styles.button}>

```
다른 component에서 동일한 이름을 썼는지 안썼는지 확인하지 않아도 된다

### 참고
- [PostCSS](https://postcss.org/)
- [PostCSS Plugins](https://www.postcss.parts/)
- [Plugins Github 페이지](https://github.com/postcss/postcss/blob/master/docs/plugins.md)