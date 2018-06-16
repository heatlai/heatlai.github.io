---
layout: post
title:  '[PHP] SQL Query 保留原始型別'
subtitle: 'PHP - SQL Query Keep Native Type'
background: '/img/posts/04.jpg'

date: 2018-03-05

tags: [PHP]
---

PDO 跟 mysqli 都預設 fetch 回來的 value 皆為 String  
要拿回 number ( int 或 float ) 需要加上 option 才能拿到 number

### 準備
```
<?php

$dbType = 'mysql';
$dbName = 'test';
$port = 3306;
$username = 'root';
$passwd = '@@mysql';

$host = '127.0.0.1';
$pdoHost = 'host=127.0.0.1';

?>
```

### mysqli
```
$mysqli = new mysqli($host, $username, $passwd, $dbName);
$mysqli->options(MYSQLI_OPT_INT_AND_FLOAT_NATIVE, 1);
```


### PDO
```
$dsn = "{$dbType}:dbname={$dbName};charset=utf8mb4;{$pdoHost};port={$port}";
$pdo = new PDO($dsn, $username, $passwd);
$pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);  // 必要，預設 : true
$pdo->setAttribute(PDO::ATTR_STRINGIFY_FETCHES, false); // 非必要，預設 : false
```