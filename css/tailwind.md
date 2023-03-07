# Tailwind css
Rapidly build modern websites without ever leaving your HTML.

## Installation (with CRA)
1. install Tailwind, PostCSS and Autoprefixer
```bash
npm i -D tailwindcss autoprefixer postcss-cli
```

2. postcss.config.js 파일 만들기
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

3. Init tailwind

```js
npx tailwind init

//tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

```

4. tailwind.css 
```css
/* src/styles/tailwind.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```js
/* index.js */
//import './index.css';
import './styles/app.css';
```

5. package
```js
  "scripts": {
    "build:css": "postcss src/styles/tailwind.css -o src/styles/app.css",
    "watch:css": "postcss src/styles/tailwind.css -o src/styles/app.css --watch",
    "react-scripts:start": "sleep 5 && react-scripts start",
    "start": "run-p watch:css react-scripts:start",
    "build": "run-s build:css react-scripts:build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
```

6. 사용해보기
- 기본
```jsx
<div className='bg-black/5 rounded-[5rem] flex-1 w-3/5 min-h-[34rem]'></div>
```

- 확장 설정 => 1rem = 10px , Custom color
```js
//tailwind.config.js
const baseFontSize = 10;
module.exports = {
  theme: {
    extend: {
      /* Font size 기본 10px로 */
      spacing: () => ({
        ...Array.from({ length: 96 }, (_, index) => index * 0.5)
          .filter((i) => i)
          .reduce(
            (acc, i) => ({ ...acc, [i]: `${i / (baseFontSize / 4)}rem` }),
            {}
          ),
      }),
      fontSize: {
        xs: [
          `${(16 * 0.75) / baseFontSize}rem` /* 12px */,
          {
            lineHeight: `${(16 * 1) / baseFontSize}rem` /* 16px */,
          },
        ],
        sm: [
          `${(16 * 0.875) / baseFontSize}rem` /* 14px */,
          {
            lineHeight: `${(16 * 1.25) / baseFontSize}rem` /* 20px */,
          },
        ],
        base: [
          `${(16 * 1) / baseFontSize}rem` /* 16px */,
          {
            lineHeight: `${(16 * 1.5) / baseFontSize}rem` /* 24px */,
          },
        ],
        lg: [
          `${(16 * 1.125) / baseFontSize}rem` /* 18px */,
          {
            lineHeight: `${(16 * 1.75) / baseFontSize}rem` /* 28px */,
          },
        ],
        xl: [
          `${(16 * 1.25) / baseFontSize}rem` /* 20px */,
          {
            lineHeight: `${(16 * 1.75) / baseFontSize}rem` /* 28px */,
          },
        ],
        '2xl': [
          `${(16 * 1.5) / baseFontSize}rem` /* 24px */,
          {
            ineHeight: `${(16 * 2) / baseFontSize}rem` /* 32px */,
          },
        ],
        '3xl': [
          `${(16 * 1.875) / baseFontSize}rem` /* 30px */,
          {
            lineHeight: `${(16 * 2.25) / baseFontSize}rem` /* 36px */,
          },
        ],
        '4xl': [
          `${(16 * 2.25) / baseFontSize}rem` /* 36px */,
          {
            lineHeight: `${(16 * 2.5) / baseFontSize}rem` /* 40px */,
          },
        ],
        '5xl': [
          `${(16 * 3) / baseFontSize}rem` /* 48px */,
          {
            lineHeight: (16 * 1) / baseFontSize,
          },
        ],
        '6xl': [
          `${(16 * 3.75) / baseFontSize}rem` /* 60px */,
          {
            lineHeight: (16 * 1) / baseFontSize,
          },
        ],
        '7xl': [
          `${(16 * 4.5) / baseFontSize}rem` /* 72px */,
          {
            lineHeight: (16 * 1) / baseFontSize,
          },
        ],
        '8xl': [
          `${(16 * 6) / baseFontSize}rem` /* 96px */,
          {
            lineHeight: (16 * 1) / baseFontSize,
          },
        ],
        '9xl': [
          `${(16 * 8) / baseFontSize}rem` /* 128px */,
          {
            lineHeight: (16 * 1) / baseFontSize,
          },
        ],
      },

      /* custom color */
      colors: {
        'custom-navy': '#142a50',
        'custom-blue': '#7899ff',
        'custom-lightGrey': '#00001E',
        'custom-black': '#222222',
      },
    },
  },
  plugins: [],
};

```
---

### [🔎Tailwind와 styled-component 함께쓰기](tailwind+styled-component.md)

---

### 참고
- [Tailwindcss 공홈](https://tailwindcss.com/)


