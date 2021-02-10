# Position

## static
- 기본값이 static
- position에 관련된 속성 top, left 등을 써도 영향 x

## relative
- 원래 있던 자리를 유지하면서 top, left등의 속성만큼 이동

## absolute
- 원래 있던 자리에서 빠져나와서 이동 => 주변 재배치가 일어난다
- 근접한 부모중 static이 아닌 부모의 기준에서 움직임
- 부모들이 static이라면 body에 맞춰서 이동
- 박스 안에서 움직이게 하고 싶으면 박스를 relative로 지정

## sticky
- 들어있는 부모 box 안에서 position 지정
- top, left 등의 position을 지정
- scrolling이 될 때 고정
  
## fixed
- viewport안에서 position 지정  

### 참고
- [MDN position](https://developer.mozilla.org/en-US/docs/Web/CSS/position)
- [MDN layout and the containing block](https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_Block)