# Data Attributes
- data-attribute 이런식으로 작성 (data-)
```
<div data-index="1" data-display-name="dream"></div>
<div data-index="2" data-display-name="coding"></div>
<span data-index="1" data-display-name="dream">sdfsdf</span>
```
  
- css 적용
```
<style>
  div[data-display-name='dream'] {
    background-color: beige;
  }
</style>
```

- JS 적용
```
<script>
  const dream = document.querySeleetor('div[data-display-name="dream"]');
  console.log(dream.dataset); //DomStringMap object. data- 뒤의 것들만 key:value로, camelCase화
  console.log(dream.dataset.displayName); //dream
</script>
```
  
- 보안에 취약하기 때문에 민감한 정보는 x 

## scrolling navigation on/off with dataset, offsetTop
- html
```html
<aside>
  <ul class="aside_menu">
    <li data-link="#article1">home</li>
    <li data-link="#article2">b</li>
    <li data-link="#article3">c</li>
    <li data-link="#article4">d</li>
  </ul>
</aside>

<section>
  <article id="article1"></article>
  <article id="article2"></article>
  <article id="article3"></article>
  <article id="article4"></article>
</section>
```
  
- JS
```js
//Handle scrolling when tapping on the side bar menu
const sideMenu = document.querySelector(".aside_menu");
sideMenu.addEventListener("click", (event) => {
  const target = event.target;
  const link = target.dataset.link;
  if (link == null) {
    return;
  }
  scrollIntoView(link);
});

/* Handle active sidebar when scrolling */
let mainNavLinks = document.querySelectorAll("aside ul li");
let mainArticles = document.querySelectorAll("section article");

let lastId;
let cur = [];

document.addEventListener("DOMContentLoaded", function () {
  window.addEventListener("scroll", (event) => {
    let fromTop = window.scrollY;

    mainNavLinks.forEach((link) => {
      const data_link = link.getAttribute("data-link");
      let article = document.querySelector(data_link);
      if (
        article.offsetTop <= fromTop &&
        article.offsetTop + article.offsetHeight > fromTop
      ) {
        link.classList.add("on");
      } else {
        link.classList.remove("on");
      }
    });
  });
});
```
