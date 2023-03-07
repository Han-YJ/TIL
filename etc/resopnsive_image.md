# Responsive Image (Picture)
```js
const pcPath = 'pc 이미지';
const tabletPath = '태블릿 이미지';
const mobilePath = '모바일 이미지';

<picture>
 <source
   media='(max-width: 480px)'
   srcSet={mobilePath + '.png'}
 />
 <source
   media='(max-width: 768px)'
   srcSet={tabletPath + '.png'}
 />
  <img src={pcPath + '.png'} alt='' />
</picture>
```