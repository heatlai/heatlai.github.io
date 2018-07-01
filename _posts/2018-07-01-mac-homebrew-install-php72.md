---
layout: post
title:  '[Mac] Homebrew 安裝 PHP 7.2'
subtitle: 'Mac - Homebrew Install PHP 7.2'
background: '/img/posts/04.jpg'

date: 2018-07-01

tags: [Mac]
---
# 安裝 Homebrew
[Homebrew](https://brew.sh/index_zh-tw)

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

# 安裝 PHP 7.2

```
brew install php72

# 重開 CLI 再看 php 版本是不是 7.2
php -v

# 如果不是 7.2 用下面指令換掉預設php
brew link php

```