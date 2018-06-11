---
layout: post
title:  'Nginx - Too many open files 錯誤訊息'

background: '/img/posts/04.jpg'

date: 2018-06-11

categories: development
category: Linux
tags: [CentOS, Nginx]
---

Nginx 出現 500 Error  

可能有下述兩種狀況:  

socket() failed (24: Too many open files) while connecting to upstream
512 worker_connections are not enough while connecting to upstream

2011/05/01 23:00:49 [alert] 7387#0: *6259768 socket() failed (24: Too many open files)
while connecting to upstream, client: 123.123.123.123, server: www.example.com,
request: "GET [[/]] HTTP/1.1", upstream: "fastcgi://127.0.0.1:9000", host: "www.example.com"
 

# 在 CentOS 7 處理方式

```
# 切 root 權限
sudo -i

# 看目前系統設定的限制 (ulimit -a # 可查看全部參數)
ulimit -n 
1024

# 由 limits.conf 設定 nofile (nofile - max number of open files) 的大小
vim /etc/security/limits.conf 

# 增加/修改 下述兩行 ( 2^20 = 1048576 )
* soft nofile 1048576
* hard nofile 1048576

或用 - 代替 soft+hard

* - nofile 1048576

# 登出後, 在登入, 執行就會出現此值
ulimit -n 
1048576
```

若 ulimit -n 沒出現 1048576 的話, 可使用強制設定
```
ulimit -n 1048576

# 再檢查設定
ulimit -n
1048576
```

或 切換 nginx 檢查

```
su - nginx

ulimit -n
1048576
```

## PAM 模組設定 (非必要)
```
# 設定登入自動套用limits.conf
vim /etc/pam.d/login

session    required   pam_limits.so
```


## 系統設定  

```
vim /etc/sysctl.conf

# 2^21 = 2097152
fs.file-max = 2097152

# 套用設定
sysctl -p
```

## 計算開啟檔案數量
```
lsof | wc -l 
```  


