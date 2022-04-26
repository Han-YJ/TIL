# CKEditor5

## issue
### CRA로 만든 React에서 플러그인 설치하기
- eject 하거나 craco 이용
- craco 이용해서 해결
```js

```

### duplicate
build classic 설치하고 font plugin 설치했을 때 나온 오류
- 해결
build classic 을 지우고 @ckeditor/ckeditor5-editor-classic 따로 설치


### list bullet, number 안나오는 현상
전역으로 설정한 list-style : none 때문에 나오지 않음
- 해결
``` css
.ck.ck-content ul,
.ck.ck-content ul li {
  list-style-type: inherit;
}

.ck.ck-content ol,
.ck.ck-content ol li {
  list-style-type: decimal;
}
```