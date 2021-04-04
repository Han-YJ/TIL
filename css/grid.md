# grid 🌝
display: grid; 로 규정 => 부모 컨테이너. 그 안의 자식은 모두 grid item이 된다

## grid-template-columns
column 각각의 크기 지정(row는 grid-template-rows)
```css
.container {
  display: grid;
  grid-template-columns: 200px 200px 200px;
}
//200px 3열이 생성된다
```
  
- fr단위를 포함한 가변 그리드
    fractal 단위를 사용하여 공간을 균등하게 분할. 행, 열을 가변적으로 조정할 수 있다
```css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; //repeat(3, 1fr)과 같다 
}
//3개의 열을 1:1:1로 분배

.container {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
}
//첫번째를 더 크게 

.container {
  display: grid;
  grid-template-columns: 100px 2fr 1fr;
}
//첫 열은 100px로 고정, 나머지 공간 중에서 2:1로 나뉜다
```

## gap, grid-gap
grid-item 사이의 간격. 
- 둘 다 설정하려면 gap이나 grid-gap (grid- 안붙여도 되지만 안정성을 위한다면 두 가지 다 쓰는게 좋다)
- 따로 설정 하려면 grid-column-gap, grid-row-gap or gap: 20px 10px;
- 길이 단위나 백분율은 가능하지만 fr 단위는 사용x
```css
.contaner {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-gap: 20px;
  gap: 20px;
}
```
  
## minmax() 함수
트랙의 최소 및 최대 크기를 설정
- minmax(100px, auto) : 최소 크기는 100픽셀이지만 최대 크기는 auto 로 contents에 맞게 확장된다
```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(100px, auto);
}
//위처럼 사용할수도 있고 template 생성할때 사용하려면

.container {
  grid-template-columns: reapeat(3, 1fr);
  grid-template-rows: repeat(3, minmax(100px, auto));
}
//3x3 형태로 생성되고 열의 너비는 1:1:1
//높이는 최소 100px, contents가 100px 이상이라면 그 크기만큼 늘어난다
```
  
## auto-fill, auto-fit
column의 개수를 미리 정하지 않고 설정된 너비가 허용하느 한 최대한 셀을 채운다
```css
.container {
  grid-template-columns: repeat(auto-fill, minmax(20%, auto));
}
//1개의 row에 5개의 셀이 들어간다
//만약, 셀의 개수가 5개보다 모자란다면 4개만 채우고 한자리가 비게된다 => auto-fit을 사용하면 남은 공간을 채운다
```
  
## grid-auto-columns, grid-auto-rows

column, row의 개수를 미리 알 수 없어 repeat을 정해 줄 수 없을 때 사용
```css
.container {
  grid-auto-rows: minmax(100px, auto);
}
```


### 참고
- [이번에야말로 CSS Grid를 익혀보자 - 1분코딩](https://studiomeal.com/archives/533)
- [MDN Grid](https://developer.mozilla.org/ko/docs/Learn/CSS/CSS_layout/Grids)