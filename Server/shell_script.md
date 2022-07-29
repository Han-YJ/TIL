# 쉘 스크립트
쉘에게 실행할 명령들을 알려주느 스크립트 파일

## 작성
  1. vi [파일 이름] 으로 새 스크립트 파일 추가 (혹은 파일 수정) ([] 는 x)

  2. 파일 열리면 i 눌러서 insert mode 진입
  
  3. 최상단에 #!/bin/bash 작성
  
  4. 실행할 명령 작성

  5. Exit 종료상태 작성 - 일반적으로 0아니면 문제상태라고 본다

  6. esc 눌러서 insert mode 종료 후 :wq 입력해서 저장하고 종료 (:q! 입력시 저장하지 않고 종료)

  ```shell
  #!/bin/bash

  find /usr/local/apache24/생략.../temp -mtime +1 -type f -name "*.xlsx" -delete

  exit 0

  ```









