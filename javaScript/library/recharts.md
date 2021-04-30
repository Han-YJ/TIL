# Recharts

## x축 format
tickFormatter 사용 (+ date-fns)
- 'yyyy-MM-dd' -> 'M-d'
```js
<XAxis
 dataKey='date'
 tickFormatter={(value) => format(new Date(value), 'M-d')}
>
```