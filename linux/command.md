# Command

## pwd
  현재 작업중인 디렉토리 정보 출력

## ls
  디렉토리 목록 

## cd (change directory) 
  경로이동

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

## 파일명이 깨져서 rename이나 delete가 안되는 경우
- 파일번호 출력해서 파일 번호로 삭제❗
```
- 파일번호 찾기
# ls -li 
0000000 -rw-r--r-- 1 ~~~~  size month day time filename  <-이런식으로 출력

- 파일번호로 삭제
# find . -inum 0000000 -exec rm -f {} \;
```

## 사이즈 크고 30일 이상 된 파일 찾기/삭제
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