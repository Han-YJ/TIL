# Scrolling Event
- scroll 되면 navbar에 event

## Window.scrollY 
- scroll heigth
```
var y = window.scrollY
```

##  Determining the dimensions of elements
- including the width of the visible content, scrollbars (if any), padding, and border
- HTMLElement.offsetWidth and HTMLElement.offsetHeight : rendering전 높이/너비
- Element.getBoundingClientRect() : rendering된 높이/너비(모니터에 표시되는 높이/너비)

### 참고
- [MDN: Window.scrollY](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY)

- [MDN: Determining the dimensions of elements](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements)