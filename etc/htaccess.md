# htaccess 설정
.htaccess file 설정

## url 확장자 제거
- .html 
```
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^([^\.]+)$ $1.html [NC,L]
```

- .php
```
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^([^\.]+)$ $1.php [NC,L]
```


## React route 관련 
없는 페이지경로 일 경우 index 찾아가기
```
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [L]
```

## HTTP 를 HTTPS 로 Redirect
```
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### issue
-  .htaccess로 설정하면 성능, 보안 이슈가 생길 수 있다
>일반적으로 주서버파일에 접근할 수 없는 경우가 아니라면 .htaccess 파일을 사용하면 안된다. 예를 들어, 사용자 인증이 항상 .htaccess 파일에 있어야 한다는 것은 잘못 알려진 오해다. 이는 사실이 아니다. 주서버설정에 사용자 인증 설정을 적을 수 있고, 사실 이러길 권한다.
- https://httpd.apache.org/docs/2.4/ko/howto/htaccess.html

- 서버의 root 권한이 있는 경우 Directory에 설정하는 것이 더 권장된다