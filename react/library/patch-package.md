# Patch-package
package 코드를 수정하고 유지할 수 있게 해준다
- package 파일을 간단하게 수정해야할 때 아주 유용하다
👍
  
## Usage
### 1. Install
```bash
yarn add patch-package postinstall-postinstall
```
  
### 2. package.json 수정
```json
"scripts": {
+  "postinstall": "patch-package"
 }
```
  
### 3. package file 수정
원하는 package 파일을 수정
  
### 4. 패치 파일 생성
```bash
yarn patch-package package-name

```
