## vscode terminal script 실행 오류
```
yarn : 이 시스템에서 스크립트를 실행할 수 없으므로 yarn.ps1 파일을
로드할 수 없습니다. 자세한 내용은 about_Execution_Policies(https://go.microsoft.com/fwlink/?LinkID=135
170)를 참조하십시오.
+ CategoryInfo          : 보안 오류: (:) [], PSSecurityException
+ FullyQualifiedErrorId : UnauthorizedAccess
```
- 기본 powershell을 cmd나 git bash로 변경

## cmd 창에서 ls, clear 명령어 오류
- 리눅스나 mac에서 사용했던 명령어 윈도우에서도 사용하기
```
doskey 사용할 명령어 =  기존 명령어
doskey ls = dir
doskey clear = cls
```

## Netlify deploy 할 때, 빈화면 나오는 것
- package.json에 hompage를 "."로 설정하면 해결

## .env 사용할 때 유효하지 않은 API_KEY 등
- .env 파일은 최상위경로에 위치해야 함