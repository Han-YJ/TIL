## error: src refspec master does not match any
error: failed to push some refs to 'https://github.com/etc.git'

repository 이름이 master가 아니라 main이었다....

git push origin main 으로 해결

---

## Authentication failed for GitHub

```
remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/Han-YJ/TIL.git/'
```

GitHub는 2021년 8월부터 비밀번호 인증을 중단했습니다. Personal Access Token (PAT) 또는 SSH 키를 사용해야 합니다.

### 해결 방법 1: Personal Access Token (PAT) 사용

1. **GitHub에서 PAT 생성**
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token (classic)
   - 필요한 권한 선택 (repo 권한 필수)
   - 토큰 생성 후 복사 (한 번만 표시됨!)

2. **Git credential helper에 토큰 저장**
   ```bash
   # macOS의 경우
   git credential-osxkeychain erase
   host=github.com
   protocol=https
   # (Enter 두 번)
   
   # 다음 push/pull 시도 시 사용자명과 토큰 입력
   # Username: GitHub 사용자명
   # Password: 생성한 PAT 토큰
   ```

3. **또는 URL에 토큰 포함** (임시 방법)
   ```bash
   git remote set-url origin https://[USERNAME]:[TOKEN]@github.com/Han-YJ/TIL.git
   ```

### 해결 방법 2: SSH 키 사용 (권장)

1. **SSH 키 생성** (이미 있다면 생략)
   ```bash
   ssh-keygen -t ed25519 -C "lucirhk@gmail.com"
   # Enter 키로 기본 경로 사용
   # passphrase 설정 (선택사항)
   ```

2. **SSH 키를 GitHub에 등록**
   ```bash
   # 공개키 복사
   cat ~/.ssh/id_ed25519.pub
   # 또는
   pbcopy < ~/.ssh/id_ed25519.pub
   ```
   - GitHub → Settings → SSH and GPG keys → New SSH key
   - 복사한 공개키 붙여넣기

3. **원격 저장소 URL을 SSH로 변경**
   ```bash
   git remote set-url origin git@github.com:Han-YJ/TIL.git
   ```

4. **SSH 연결 테스트**
   ```bash
   ssh -T git@github.com
   # "Hi [username]! You've successfully authenticated..." 메시지 확인
   ```

### 해결 방법 3: GitHub CLI 사용

```bash
# GitHub CLI 설치 (Homebrew)
brew install gh

# GitHub 로그인
gh auth login

# Git credential helper로 설정
gh auth setup-git
```

### 현재 설정 확인

```bash
# 원격 저장소 URL 확인
git remote -v

# Credential helper 확인
git config --list | grep credential
```