# Error solution

## offsetTop

> Uncaught TypeError: Cannot read property 'offsetTop' of null
> [예제](https://css-tricks.com/sticky-smooth-active-nav/)에서 section을 제대로 못가져와서 생긴 에러

```javascript
let mainNavLinks = document.querySelectorAll("nav ul li a");
let mainSections = document.querySelectorAll("main section");

window.addEventListener("scroll", (event) => {
  let fromTop = window.scrollY;

  mainNavLinks.forEach((link) => {
    console.log(link); //<a href="링크주소"></a>
    let section = document.querySelector(link.hash);
    console.log(section); //<section>어쩌구 저쩌구 내용</section>
    //link로 이동한 본문내용 출력
    if (
      section.offsetTop <= fromTop &&
      section.offsetTop + section.offsetHeight > fromTop
    ) {
      link.classList.add("current");
    } else {
      link.classList.remove("current");
    }
  });
});
```

## AOS.css

> Resource interpreted as Stylesheet but transferred with MIME type text/javascript

```html
<link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />

//rel="stylesheet" 삭제하는 방법을 찾았지만 삭제하면 css적용 x
//type="text/css"를 추가하는 방법도 소용 x
```

다음 stable version으로 받아서 해결!

- [aos](https://github.com/michalsnik/aos/tree/v2)

### 참고

- [Resource interpreted as Stylesheet but transferred with MIME type text/javascript](https://stackoverflow.com/questions/41734976/resource-interpreted-as-stylesheet-but-transferred-with-mime-type-text-javascrip)
