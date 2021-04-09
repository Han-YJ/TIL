# Alias
명령어를 단축키로 지정하여 사용하기

## 1. Git Commands로 설정
### 등록
```bash
$ git config --global alias.st 'status'

status를 st로 설정
```

### 삭제
```bash
$ git config --global --unset alias.st
```

### 목록보기
```bash
$ git config --get-regexp alias
```

## 2. gitconfig 파일에 설정
.gitconfig 파일을 vim 또는 open 하여 직접 설정
```
[alias]
    co = checkout
    rb = rebase -i
    st = status
    cm = commit
    pl = pull
    ps = push
    lg = log --graph --abbrev-commit --decorate --format=format:'%C(cyan)%h%C(reset) - %C(green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(yellow)%d%C(reset)' --all
    ad = add
    tg = tag -n
    df = diff
    br = branch
```


```