# swiper slide

## Installation
- cdn
```
<link rel="stylesheet" href="https://unpkg.com/swiper/swiper-bundle.css" />
<link rel="stylesheet" href="https://unpkg.com/swiper/swiper-bundle.min.css" />

<script src="https://unpkg.com/swiper/swiper-bundle.js"></script>
<script src="https://unpkg.com/swiper/swiper-bundle.min.js"></script>
```
- yarn
$ yarn add swiper
  
## Add Swiper HTML Layout
```
<!-- Slider main container -->
<div class="swiper-container">
  <!-- Additional required wrapper -->
  <div class="swiper-wrapper">
    <!-- Slides -->
    <div class="swiper-slide">Slide 1</div>
    <div class="swiper-slide">Slide 2</div>
    <div class="swiper-slide">Slide 3</div>
    ...
  </div>
  <!-- If we need pagination -->
  <div class="swiper-pagination"></div>

  <!-- If we need navigation buttons -->
  <div class="swiper-button-prev"></div>
  <div class="swiper-button-next"></div>

  <!-- If we need scrollbar -->
  <div class="swiper-scrollbar"></div>
</div>
```

### screenshot
![screenshot](../imgs/swiperjs.png)
- [예제코드보기](swiperjs-example.md)


### 참고
- [swiperjs 공식](https://swiperjs.com/)
- [swiper slide 사용법](https://velog.io/@function_dh/JavaScript-Swiper-%EC%82%AC%EC%9A%A9%EB%B2%95-%EC%8A%AC%EB%9D%BC%EC%9D%B4%EB%93%9C-%EA%B5%AC%ED%98%84)
