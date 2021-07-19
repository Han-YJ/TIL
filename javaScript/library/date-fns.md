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
요일 등을 한글로 변환


## eachDay
날짜 사이의 날짜들 구하기


## error
- rangeError : invalid date format, invalid interval
- new Date 사용하는 경우 발생
- parseISO 한 뒤에 format적용


### 참고
- [공식 date-fns docs](https://date-fns.org/docs/Getting-Started)
- https://www.sitepoint.com/date-fns-javascript-date-library/