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