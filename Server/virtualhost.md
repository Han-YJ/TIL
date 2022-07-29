# Apache 2.4 + VirtualHost 설정하기
1. httpd-vhosts.conf
2. httpd.conf
3. apache restart

## 1. httpd-vhosts.conf 
```conf
// VirtualHost 설정
//# vi /usr/local/apache24/conf/extra/httpd-vhosts.conf
// 입력 - 파일수정
// 아무것도 수정하지 않았다면 가상호스팅 예시 두 개가 있고 그것을 수정해서 사용했다

# test1.example.com, test2.example.com 두개가 dns가 등록되어있다고 가정
# error log 와 custom log 는 따로 관리하고 싶어서 test1과 test2 폴더를 미리 만들어줬다.

<VirtualHost *:80>
    ServerAdmin admin@example.com
    DocumentRoot "/usr/local/apache24/htdocs/test1"
    ServerName test1.example.com
    ServerAlias www.test1.example.com
    ErrorLog "logs/test1/test1-error_log"
    CustomLog "logs/test/test1-access_log" common
</VirtualHost>

<VirtualHost *:80>
    ServerAdmin admin@example.com
    DocumentRoot "/usr/local/apache24/htdocs/test2"
    ServerName test2.example.com
    ServerAlias www.test2.example.com
    ErrorLog "logs/test2/test2-error_log"
    CustomLog "logs/test2/text2-access_log" common
</VirtualHost>

//위처럼 수정 후 :wq (저장 후 종료)
```

## 2. httpd.conf
```conf
//Directory 설정
<Directory "/usr/local/apache24/htdocs/test1">
    AllowOverride None 
    # .htaccess 사용하려면 AllowOverride All 로 바꿔줘야 함
    Options Indexes FollowSymLinks
    Require all granted

   # 특정 ip만 들어올 수 있게 제한
   # Require all denied
   # Require ip 127.0.0.1

    #Rewrite 사용
    RewriteEngine On
    RewriteBase /

    RewriteCond %{HTTPS} off 
    #https가 아니라면
    RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    #https로 

    RewriteCond %{REQUEST_FILENAME} !-f
    #해당하는 파일이 없다면
    RewriteRule ^ index.html [QSA,L]
    #index.html로 

</Directory>

#같은 방법으로 test2도 추가

```

## 3. apache restart
바꾼 config 적용
```
재시작
# systemctl restart httpd
상태확인
# systemctl status httpd
```