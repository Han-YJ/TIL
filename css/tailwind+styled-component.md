# tailwind + styled-component 사용하기 with Twin Macro

## installation
1. 패키지 설치
```bash
yarn add -D tailwindcss twin.macro autoprefixer babel-plugin-macros postcss-cli
yarn add styled-components
```
2. 설정
```bash
npx tailwind init src/tailwind.config.js
```
```json
//src/tailwind.config.js 은 기존과 동일

//package.json
  "babelMacros": {
    "twin": {
      "styled": "styled-components",
      "config": "./tailwind.config.js",
      "format": "auto"
    }
  }
```

3. 사용
ex) State에 따라 Header blur 처리
```jsx
import styled from 'styled-components';
import tw from 'twin.macro';

const Container = styled.div(({ isTop }) => [
  tw`w-full flex fixed top-0 left-0 justify-between items-center h-[6rem] transition-all duration-200 ease-in z-50`,
  isTop ? tw`backdrop-blur-none` : tw`backdrop-blur-sm`,
]);

const Header = () => {
  const [isTop, setIsTop] = useState(true);

  <Container isTop={isTop}>
    <>~~~</>
  </Container>
}
```