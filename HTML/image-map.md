# <map> tag
image-map을 사용해 이미지 위에 링크걸기

## 기본 구조
```html
<map name="primary">
  <area shape="circle" coords="75,75,75" href="left.html">
  <area shape="circle" coords="275,75,75" href="right.html">
</map>
<img usemap="#primary" src="https://placehold.it/350x150" alt="350 x 150 pic">
```
- map
  - name : 맵을 참조할 때 사용하는 이름. 반드시 존재해야 함
  - id : name과 같은 value를 가져야 함

- area
  - shape : default, rect, circle, poly 중 하나 사용
  - coords : map의 좌표. 그림판이나 [참고](###-참고)의 image map generator에서 얻기
  - alt
  - title : mouseover시 나타나는 tooltip
  - href : 이동할 url

## responsive image에서 map 사용하기
jquery-rwdImageMaps 이용
✔ coords에 반드시 img원본에서의 좌표를 넣어야 함


[responsive image map 예제](responsive-img-map.md)

### 참고
- [MDN-map](https://developer.mozilla.org/ko/docs/Web/HTML/Element/map)
- coords 좌표 [Image Map Generator](https://www.image-map.net/)
- responsive coods recalculator [jQuery-rwdImageMaps](https://github.com/stowball/jQuery-rwdImageMaps)