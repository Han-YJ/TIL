# Date-fns
Date 관련 여러가지 method 제공

- addDays, subDays, addWeeks...
- format(), locale ...

```js
format(new Date(value), 'M-d(eee)', { locale: ko })
```
## format
format(date, 'format형식', opation);
  
## locale
요일 등을 한글로 바꿀 수 있다

### 참고
- [공식 date-fns docs](https://date-fns.org/docs/Getting-Started)
- https://www.sitepoint.com/date-fns-javascript-date-library/