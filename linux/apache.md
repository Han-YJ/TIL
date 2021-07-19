# apache 설정
## mssql
Call to undefined function mssql_connect() 
- php.ini 파일 


## react refesh 404 error
- httpd.conf 파일 수정, 추가
### 1. rewrite module 활성화
```
//httpd.conf 파일 내의 모듈중 아래 rewrite 찾아서 주석 제거
LoadModule rewrite_module modules/mod_rewrite.so
```

### 2. directory 설정 수정, 추가
```
<Directory "/usr/local/apache24/htdocs">
AllowOverride All
    
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
</Directory>
```