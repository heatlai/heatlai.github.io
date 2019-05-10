---
layout: post
title:  '自己動手做Dockerfile CentOS 6 + PHP 5.2 + PHP extension imagick + apache + 改時區/系統語言'
subtitle: 'DIY Dockerfile CentOS 6 + PHP 5.2 + PHP extension imagick + apache + change Timezone and System Language'
background: '/img/posts/04.jpg'
description: ""
date: 2019-05-02
category: Develop
tags: [Docker, PHP, CentOS]
---

工作上遇到了老版本PHP的環境，成本考量又不能升版，
為了讓dev環境和production環境一致，就動手做了一個符合production環境的dockerfile，
以下記錄編寫 Dockerfile 的過程。 

# Dockerfile
```dockerfile
# 從 centos 官方image 起手
FROM centos:centos6.7
LABEL maintainer="hitgunlai@gmail.com"

# 這次要自行編譯安裝的PHP版本號 下面會用到
ENV PHP_VERSION 5.2.17

# Initial setup
# 安裝常用工具
# 備註：
#   因為不知名原因在用 yum install 或 yum update 時會報錯
#   大概是說rpm db毀損，在前面補 "rpm --rebuilddb" 就解了
#   後續有關yum的操作也都在前面補 "rpm --rebuilddb" 才安全通過
RUN rpm --rebuilddb \
    && yum update -y \
    && yum groupinstall -y 'Development Tools' \
    && yum install -y epel-release

# OS dependency installation
# 安裝server上有的東西 後來發現好像蠻多沒用到的 不過都已經寫了 就算了
# 如果在乎 image size 的話 可以抽掉不必要的安裝
RUN rpm --rebuilddb && yum update -y && yum install -y \
    wget \
    curl curl-devel \
    git \
    bzip2 \
    tar \
    sendmail \
    vim \
    zip \
    libtidy libtidy-devel \
    autoconf \
    gd gd-devel \
    patch \
    db4* \
    t1lib* t1lib-devel \
    openssl openssl-devel \
    bzip2 bzip2-devel \
    libcurl libcurl-devel \
    libxml2 libxml2-devel \
    libpng libpng-devel \
    libXpm libXpm-devel \
    libjpeg libjpeg-devel \
    iconv libiconv

# Apache installation
# 安裝完為 apache 2.2
RUN rpm --rebuilddb && yum install -y httpd httpd-devel

# PHP 5.2 dependency installation
# 部分依賴在前面的 OS dependency installation 已經安裝過了
# 這裡也是可以抽掉不必要的安裝
RUN rpm --rebuilddb && yum install -y \
  mysql-devel \
  openldap-devel \
  freetype-devel \
  gmp-devel \
  libmhash-devel \
  readline-devel \
  net-snmp-devel \
  libxslt-devel \
  libtool-ltdl-devel \
  libc-client-devel \
  ncurses-devel \
  postgresql-devel \
  aspell-devel \
  pcre-devel

# PHP 5.2 installation
# 不要用 yum install php 或 php-* 因為 CentOS 6 原生的安裝包資料庫已經是 PHP 5.3 了
# 用 yum install 會覆蓋掉自行安裝的 PHP 5.2，不然就是要指定repo去安裝 5.2
# 從 http://museum.php.net 下載老版本PHP 自行編譯安裝
# 參數部分要去查文件囉
# 這邊可以抽掉不想要的module參數
# 假設DB是用mysql的話 其實可以不用 --with-pdo-pgsql 因為這是 PostgreSQL 的 module
WORKDIR /usr/local/src
RUN wget http://museum.php.net/php5/php-${PHP_VERSION}.tar.bz2
RUN tar -xf ./php-${PHP_VERSION}.tar.bz2 -C ./
WORKDIR /usr/local/src/php-${PHP_VERSION}

# 重要: 64-bit 系統 .so 會安裝在 /usr/lib64   
# 不設定 --prefix + --with-libdir 的話 編譯時 載入module.so會失敗
# --with-config-file-path : 設定 php.ini 路徑
# --with-config-file-scan-dir 設定 自動載入 *.ini 資料夾路徑  
RUN ./configure \
      --prefix=/usr \
      --with-libdir=lib64 \
      --with-config-file-path=/etc \
      --with-config-file-scan-dir=/etc/php/conf.d \
      --bindir=/usr/bin \
      --sbindir=/usr/sbin \
      --sysconfdir=/etc \
      --enable-gd-native-ttf \
      --enable-mbregex \
      --enable-mbstring \
      --enable-zip \
      --enable-bcmath \
      --enable-soap \
      --enable-sockets \
      --enable-ftp \
      --with-apxs2 \
      --with-openssl \
      --with-zlib \
      --with-bz2 \
      --with-gettext \
      --with-iconv \
      --with-curl \
      --with-mysql-sock \
      --with-gd \
      --with-pdo-mysql \
      --with-pdo-pgsql \
      --with-xsl \
      --with-mysql \
      --with-mysqli \
      --with-freetype-dir \
      --with-jpeg-dir \
      --with-png-dir \
      --with-gmp \
      --with-pcre-regex \
      && make && make install \
      && cp -f ./php.ini-recommended /etc/php.ini \  
      && sed -i 's/^extension_dir/;extension_dir/g' /etc/php.ini \
      && mkdir -p /etc/php/conf.d \
      && rm -rf /usr/local/src/php*  

# ImageMagick
# 安裝 imagick 遇到比較多問題
# 直接用 pecl install imagick 會發生版本錯誤 PHP >= 5.4
# 這裡需要指定版本才支援 PHP 5.2
# enable extension 因為懶得去改php.ini 所以寫在自動掃描ini的folder 
RUN rpm --rebuilddb \
    && yum install -y ImageMagick ImageMagick-devel \
    && yes | pecl install -f imagick-3.1.2 \
    && echo "extension=imagick.so" > /etc/php/conf.d/docker-php-ext-imagick.ini

# clear temp
# 清理一些yum暫存安裝檔 但好像沒啥用
RUN yum clean all \
    && rm -rf /var/cache/yum \
    && rm -rf /var/tmp/*

# 對外開放 80 and 443 port
EXPOSE 80 443

# 調整系統語言為日文 ja_JP.UTF-8 (業主要求)
# 平常應該是不需要改 建議用英文會比較好 LANG="en_US.UTF-8"
ENV LANG=ja_JP.UTF-8
RUN localedef -f UTF-8 -i ja_JP ja_JP.UTF-8

# 調整時區 timezone 為東京
RUN ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
    && echo 'ZONE="Asia/Tokyo"' > /etc/sysconfig/clock
# 調整時區 timezone 為台灣
#RUN ln -sf /usr/share/zoneinfo/Asia/Taipei /etc/localtime \
#    && echo 'ZONE="Asia/Taipei"' > /etc/sysconfig/clock

# web server start
CMD ["-D", "FOREGROUND"]
ENTRYPOINT ["/usr/sbin/httpd"]

# for testing 測試的時候把上面的 CMD 和 ENTRYPOINT 註解掉 改用下面的讓 PID=1 變成 bash
# 等 container 跑起來再手動啟動 httpd 比較容易 debug
#CMD ["/bin/bash"]
#ENTRYPOINT ["/sbin/init"]
```

# docker-compose.yml 
詳細用法要去看[官方文件](https://docs.docker.com/compose/compose-file/) 
```yaml
version: "3"

networks:
  frontend:
  backend:

services:
  web:
    container_name: web
    networks:
      - frontend
      - backend
    build:
      context: ./
      dockerfile: Dockerfile
    ports:
      - "443:443"
      - "80:80"
    volumes:
      # mount project source code
      - ./source_code:/var/www/html/project
      # mount apache vhost.conf
      - ./conf/httpd/conf.d:/etc/httpd/conf.d
```