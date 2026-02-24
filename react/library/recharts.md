# Recharts

## 목록

1. [ResponsiveContainer 레이아웃 오류 방지](#1-responsivecontainer-레이아웃-오류-방지)
2. [xAxis format](#2-xaxis-format)
3. [yAxis](#3-yaxis)
4. [Tooltip](#4-tooltip)

---

## 1. ResponsiveContainer 레이아웃 오류 방지

- flex 레이아웃에서 차트 안 그려지거나 오류 나면 아래 옵션 넣기
- 부모에 고정 높이 주기 (예: `h-[550px] lg:h-[700px]`)

```tsx
<ResponsiveContainer
  width="100%"
  height="100%"
  minWidth={0}
  minHeight={0}
  initialDimension={{ width: 1, height: 1 }}
>
  <LineChart ... />
</ResponsiveContainer>
```

- `minWidth={0}`, `minHeight={0}` : flex 기본 min 크기 때문에 overflow 방지
- `initialDimension={{ width: 1, height: 1 }}` : SSR/초기 렌더 시 0x0 방지

---

## 2. xAxis format

- tickFormatter 사용 (+ date-fns)
- 'yyyy-MM-dd' -> 'M-d'

```js
<XAxis
 dataKey='date'
 tickFormatter={(value) => format(new Date(value), 'M-d')}
>
```

---

## 3. yAxis

- 숫자 단위 생략

```js
const yAxisTickFormatter = (value) => {
    const yValue = value * 1;
    if (yValue > 10000000) {
      return (yValue / 10000).toLocaleString('en-US');
    } else {
      return yValue.toLocaleString('en-US');
    }
  };
```

---

## 4. Tooltip

- formatter
  - value : 45,709~
  - name : 매출액

- labelFormatter
  - label : 15:00 ~ 15:59
![recharts-tooltip](recharts.png);

```js
const customTooltipLabel = (label) => {
    if (category === 'time') {
      return `${label}:00 ~ ${label}:59`;
    } else {
      return label;
    }
  };

<Tooltip
  formatter={(value) => value.toLocaleString('en-US')}
  labelFormatter={customTooltipLabel}
/>
```

- name, value 둘다 바꾸는 경우
- (name, value) => [name, value]

```js
const tooltipFormat = (value, name) => {
    const newValue = `${(value * 1).toLocaleString('en-US')}원`;
    if (category === 'time') {
      let timeRange = `${name}:00 ~ ${name}:59`;
      return [newValue, timeRange];
    } else if (category === 'day') {
      let timeRange = format(new Date(name), 'M월 d일');
      return [newValue, timeRange];
    } else if (category === 'week') {
      return [newValue, getWeekDay(name * 1)];
    } else {
      let timeRange = format(new Date(name), 'M월');
      return [newValue, timeRange];
    }
  };
```
