# Command

## pwd
- 현재 작업중인 디렉토리 정보 출력

---

## ls
- 디렉토리 목록 

---
## cd (change directory) 
- 경로이동

```cmd
디렉토리가 /root/a/b/c/d/ 로 되어 있을 때
- 절대경로 : 최상위 디렉토리인 /붙여서 이동하고싶은 디렉토리까지 차례로 씀
- 상대경로 : 자신이 있는 위치를 기준으로 이동. 현재 자신이 있는 위치는 .(마침표)로 표기

# cd /a/b  -> b 폴더로 이동
# cd ..    -> b의 상위 폴더인 a로 이동
# ls       -> a에 있는 목록 출력
# cd b     -> 다시 b로 이동
# cd /     -> 최상위 폴더인 root로 이동
```
---
## find
파일 찾기
```
find [옵션] [경로] [표현식]

//현재 위치에서 202303 으로 시작하는 파일 모두 찾기
find . -name "202303*" 
```
### - 옵션
- P : 심볼릭 링크를 따라가지 않고, 심볼릭 링크 자체 정보 사용.
- L : 심볼릭 링크에 연결된 파일 정보 사용.
- H : 심볼릭 링크를 따라가지 않으나, Command Line Argument를 처리할 땐 예외.
- D : 디버그 메시지 출력.

### - 경로
- 상대경로, 절대경로 모두 사용 가능.  
- . 은 현재위치 이고 경로를 생략하면 대부분 .으로 간주. / 는 모든 경로

### 표현식
- name : 이름. 정규 표현식을 활용가능
- type : 파일 타입
- user : 해당 유저에게 속한 파일 검색
- empty : 빈 디렉토리 혹은 크기가 0인 파일 검색
- delete : 검색된 파일 혹은 디렉토리 삭제
- exec : 검색된 파일에 대해 지정된 명령 실행
- path : 지정된 문자열 패턴에 해당하는 경로에서 검색.
- print : 검색 결과 출력. 검색 항목은 newline으로 구분(기본 값)
- print0 : 검색 결과 출력. 검색 항목은 null로 구분
- size : 파일 크기를 사용하여 파일 검색
- mindepth : 검색을 시작할 하위 디렉토리 최소 깊이 지정
- maxdepth : 검색할 하위 디렉토리의 최대 깊이 지정
- atime : n일 이내에 액세스된 파일
- ctime : n일 이내에 생성된 파일
- mtime : n일 이내에 수정된 파일
- cnewer file : 해당 파일보다 최근에 수정된 파일


### 참고
[리눅스 find 사용법](https://coding-factory.tistory.com/804)

---
## rm (remove)
- 파일이나 디렉토리를 삭제
- -r : 디렉토리 삭제시 (하위 디렉토리까지 모두 삭제)
- -f : 사용자에게 삭제 여부를 묻지 않고 바로 삭제
```
$ ls
dir1/ file1  file2

$ rm -f file1
$ ls
dir1/ file2

```

### - 파일명이 깨져서 rename이나 delete가 안되는 경우
- 파일번호 출력해서 파일 번호로 삭제❗
```
- 파일번호 찾기
# ls -li 
0000000 -rw-r--r-- 1 ~~~~  size month day time filename  <-이런식으로 출력

- 파일번호로 삭제
# find . -inum 0000000 -exec rm -f {} \;
```

### - 사이즈 크고 30일 이상 된 파일 찾기/삭제
```cmd
1. 찾기
# find 폴더 -size 사이즈 -mtime 일수 -print  

# find attach_upload_temp -size +1000k -mtime +10 -print

-size 1000k => 사이즈가 10MB 이상인 파일
-mtime +10  => 변경된지 10일 이상된 파일

2. 삭제 -exec rm -rf {} \;
# find attach_upload_temp -size +1000k -mtime +10 -exec rm -rf {} \;

```
  
- mtime : 파일의 마지막 변경시간
- ctime : inode changed time. inode 변경이 발생하는 행동을 했을때 ctime 이 변경되며 이런 행동으로는 "file permissions" 변경(chmod), "file 소유자" 변경(chown), 하드 링크 생성(ln)과 삭제(rm)등이 있음


### 참고
- https://www.lesstif.com/lpt/atime-mtime-ctime-105644095.html
---

## tar
```
- 압축
tar -cvf [파일명] [폴더명]
//폴더명 없으면 현재위치

- 압축해제
tar -xvf [파일명.tar]
tar -zxvf [파일명.tar.gz] -C [해제폴더이름]
```

### - gz 압축하기 / 해제
202302 로 시작하는 txt 파일 하나로 묶고 압축 하기 / 압축 해제하기
```
tar cvzf 202302.tar.gz 202302*.txt

tar -zxvf 202302.tar.gz
```

### - find 와 tar 함께쓰기
```
find . -name "202302*" -exec tar -rvf 202302.tar {} \;

//-rvf 말고 -cvf 쓰면 single file 만 묶인다
```

### windows 에서 .tar .tar.gz 파일 압축 풀기
cmd 에서 tar명령어 가능
```
tar -zxvf 202302.tar.gz -C test

//2023.02.tar.gz 파일을 test라는 폴더에 풀기
```

### 참고
- [tar / tar.gz / zip 압축 및 압축 해제](https://eehoeskrap.tistory.com/555)
- [How to gzip multiple files into one gz file?](https://superuser.com/questions/334827/how-to-gzip-multiple-files-into-one-gz-file)
- [How to combine the 'tar' command with 'find'](https://superuser.com/questions/513304/how-to-combine-the-tar-command-with-find)


---
## issue
### 이식성 문제
파일 삭제하는 명령어 : -delete, 


