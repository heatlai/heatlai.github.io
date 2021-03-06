---
layout: post
title:  '[MySQL] Stored Procedure 筆記 & 範例'
subtitle: 'MySQL - Stored Procedure Note & Example'
background: '/img/posts/05.jpg'
description: ""
date: 2019-05-10
category: Develop
tags: [MySQL, Database, RDBMS]
---

# Stored Procedure
Stored Procedure 是在資料庫中建立的一組工作程序，
個人理解就是把不想在 App Server 上跑的部分，寫 function 在 DB 裡跑。
有些需求會反覆用到DB，例如做統計報表，或是不想把邏輯放在App，例如用戶登入，
都可以寫一個Stored Procedure一次完成要執行的工作。

## 範例：用戶登入
### 用OUT拿回傳值
`需要一次exec， 一次query拿回傳值`

- MySQL Stored Procedure

```sql
DROP PROCEDURE IF EXISTS `user_login`;
DELIMITER //
CREATE PROCEDURE `user_login`(IN in_username varchar(20),IN in_password varchar(20),OUT out_user_id INT)
main:BEGIN
    SELECT max(`user_id`) INTO out_user_id
    FROM `users` 
    WHERE `username` = in_username and `password` = in_password;
END
//
DELIMITER ;
```

- PHP 取結果

```php
<?php

// 用戶登入的帳密
$username = 'userA';
$password = 'userA_password';

// DB 連線
$dbms = 'mysql';
$db_host = '127.0.0.1'; 
$db_name = 'mydb';
$db_user = 'root';
$db_pass = 'mypass';
$dsn = "$dbms:host=$db_host;dbname=$db_name";
$pdo = new PDO($dsn, $db_user, $db_pass);

// 執行 sql
$q = $pdo->exec("CALL user_login('$username','$password',@user_id)");
$res = $pdo->query('SELECT @user_id AS user_id')->fetchAll(PDO::FETCH_ASSOC);
print_r($res);

?>
```

### 直接回傳值
`一次query就拿回傳值，這個比較方便`

- MySQL Stored Procedure

```sql
DROP PROCEDURE IF EXISTS `user_login`;
DELIMITER //
CREATE PROCEDURE `user_login`(IN in_username varchar(20),IN in_password varchar(20))
main:BEGIN
    SELECT max(`user_id`) AS user_id
    FROM `users` 
    WHERE `username` = in_username and `password` = in_password;
END
//
DELIMITER ;
```

- PHP 取結果

```php
<?php

// 用戶登入的帳密
$username = 'userA';
$password = 'userA_password';

// DB 連線
$dbms = 'mysql';
$db_host = '127.0.0.1'; 
$db_name = 'mydb';
$db_user = 'root';
$db_pass = 'mypass';
$dsn = "$dbms:host=$db_host;dbname=$db_name";
$pdo = new PDO($dsn, $db_user, $db_pass);

// 執行 sql
$res = $pdo->query("CALL user_login('$username','$password')")
    ->fetchAll(PDO::FETCH_ASSOC);
print_r($res);

?>
```

## 範例：統計報表
`計算結果後寫入另一張表`

- MySQL Stored Procedure

```sql
DROP PROCEDURE IF EXISTS `count_city_shops`;
DELIMITER //
CREATE PROCEDURE `count_city_shops`()
main:BEGIN
    DECLARE p_total_city INT;
    DECLARE p_city_id INT;
    DECLARE p_shop_count INT;
    DECLARE p_today CHAR(10);
    
    DECLARE cursorCityShops CURSOR FOR
           SELECT c.city_id,
                  sum(CASE WHEN s.shop_id IS NOT NULL THEN 1 ELSE 0 END) AS shop_count
           FROM citys c
           LEFT JOIN shops s ON c.city_id = s.city_id
           GROUP BY c.city_id;
       
    SELECT COUNT(*) INTO p_total_city FROM citys;
    SELECT DATE_FORMAT(NOW(),'%Y-%m-%d') INTO p_today;
   
    SET @cityIndex = 0;
    OPEN cursorCityShops;
    WHILE p_total_city > @cityIndex DO
        FETCH cursorCityShops INTO p_city_id,p_shop_count;
        
        INSERT INTO count_shop_table(city_id, shop_count, created_date)
            VALUES (p_city_id, p_shop_count, p_today);
        
        SET @cityIndex = @cityIndex + 1;
    END WHILE;
    CLOSE cursorCityShops;
END
//
DELIMITER ;
```

- PHP 執行

```php
<?php

// DB 連線
$dbms = 'mysql';
$db_host = '127.0.0.1'; 
$db_name = 'mydb';
$db_user = 'root';
$db_pass = 'mypass';
$dsn = "$dbms:host=$db_host;dbname=$db_name";
$pdo = new PDO($dsn, $db_user, $db_pass);

// 執行 sql
$res = $pdo->exec("CALL count_city_shops()");
print_r($res);

?>
```

## 範例：遞迴查詢

```sql
DROP TABLE IF EXISTS `source_table`;

CREATE TABLE `source_table` (
  `Type_id` int(11) NOT NULL,
  `Type_id_p` int(11) DEFAULT NULL,
  `Type_name` varchar(45) DEFAULT NULL,
  `C_order` int(11) DEFAULT NULL,
  PRIMARY KEY (`Type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `source_table` VALUES (0,NULL,'Root',NULL),(1,0,'Food',NULL),(2,1,'Fast food',NULL),(3,2,'American',NULL),(4,2,'Japan',NULL),(5,3,'McDonald',NULL),(6,4,'Ichran',NULL);

DELIMITER //

DROP PROCEDURE IF EXISTS `getParent`//

CREATE PROCEDURE `getParent`(
  IN `typeId` int,
  OUT `result` varchar(255)
)
BEGIN
  DECLARE `parentTypeId` int;
  DECLARE `currentTypeName` varchar(255);
  SELECT `Type_id_p`, `Type_name` INTO `parentTypeId`, `currentTypeName`
  FROM source_table
  WHERE `Type_id` = `typeId`;

  IF `parentTypeId` IS NOT NULL THEN
    CALL `getParent`(`parentTypeId`, `result`);
    SET `result` := CONCAT( IFNULL(`result`, ''), ' > ', `currentTypeName`);
  ELSE
    SET `result` := CONCAT( IFNULL(`result`, ''), `currentTypeName`);

  END IF;

END//

DELIMITER ;

call getParent( 5, @result);

select @result;
```
