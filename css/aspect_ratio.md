# Aspect Ratio
Create flexible elements that keep their aspect ratio
비율대로 크기를 잡아주기 때문에 position: absolution 인 이미지나 비디오 wrapper 에 쓰기 좋다!



## example
- 두가지 방법 aspect-ratio and paddgin-top 
```css
//1:1
.container {
  background-color: red;
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio */
  position: relative; /* If you want text inside of it */
}

.text {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}


/* 16:9 */
.container {
  aspect-ratio : 16 / 9;
  /* or */
  padding-top: 56.25%; /* 16:9 Aspect Ratio (divide 9 by 16 = 0.5625) */
}

/* //4:3 */
.container {
  aspect-ratio : 4 / 3;
  /* or */
  padding-top: 75%; /* 4:3 Aspect Ratio (divide 3 by 4 = 0.75) */
}

```

### 참고
[w3schools - How TO Aspect Ratio](https://www.w3schools.com/howto/howto_css_aspect_ratio.asp)