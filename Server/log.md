# 로그 파일 관리
- vhosts or ssl 사용중 일 때(httpd-vhosts.conf or httpd-ssl.conf)
```bash
<VirtualHost *:443>
    DocumentRoot "/usr/local/apache24/htdocs/test"
    ServerName test.test.com
    ErrorLog "|/usr/local/apache24/bin/rotatelogs logs/main/main-error-log_%Y%m%d 86400"
    CustomLog "|/usr/local/apache24/bin/rotatelogs logs/main/main-access-log_%Y%m%d 86400" common

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/test.test.com/cert.pem
    SSLCertificateChainFile /etc/letsencrypt/live/test.test.com/chain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/test.test.com/privkey.pem

    <Directory "/usr/local/apache24/cgi-bin">
        SSLOptions +StdEnvVars
    </Directory>

</VirtualHost>
```

- static 파일은 로그 제외하기
```bash
<VirtualHost *:443>
    DocumentRoot "/usr/local/apache24/htdocs/test"
    ServerName test.test.com
    ErrorLog "|/usr/local/apache24/bin/rotatelogs logs/main/main-error-log_ssl_%Y%m%d 86400"

    SetEnvIfNoCase Request_URI "\.(png|gif|jpg|js|css|ico|woff2)$" is_static
    CustomLog "|/usr/local/apache24/bin/rotatelogs logs/main/main-access-log_ssl_%Y%m%d 86400 +540" common env=!is_static

    ...

</VirtualHost>
```

- rotatelogs : 로그파일 분할관리