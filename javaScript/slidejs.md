## jquery.slide.js
### pagination
- custom pagination ⭕
- backgroun-image로 입히기

### navigation
- custom navigation 지원❌
- custom navigation로 바꾸려면 navigation true, navigation hide(), trigger() 사용
  
```javascript
$(".custom-navigation").click(function(e){
        e.preventDefault();
        // use data-item value when triggering default pagination link
        $('a[data-slidesjs-item="' + $(this).attr("data-item") + '"]').trigger('click');
    });
    $('.custom-next').click(function(e) {
        e.preventDefault();
        // emulate next click
        $('.slidesjs-next').click();
    });
    $('.custom-prev').click(function(e) {
        e.preventDefault();
        // emulate previous click
        $('.slidesjs-previous').click();
    });
  });
```
