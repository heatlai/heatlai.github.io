---
layout: post
title:  'RDBMS淺談 上課筆記'
subtitle: 'RDBMS course review'
background: '/img/posts/02.jpg'

date: 2019-04-10

tags: [Database, RDBMS]
---
 
2019-03-23 RDBMS淺談 講者：Triton Ho

# 為何選擇 RDBMS
1. 使用 RDBMS 比 NoSQL 有更快的開發速度
2. 歷史悠久，有 30 年的歷史
    - 大部份軟體錯誤都已經被發現更正
    - 社群支援良好
    - 有基於實務環境的優化
    - 出錯把丟到Stack Overflow就有一堆解法
3. 中小型系統， RDBMS 效能已足夠
4. RDBMS 比 NoSQL 更加安全

## 更快的開發速度
#### 1. multiple records atomicity 是不能迴避的需求，NoSQL做2pc很麻煩的
例如：
  - 把錢從用戶A轉到用戶B(轉帳)
  - 購買虛擬道具(結帳)

參考資料 MongoDB官方：[2 phase commit](https://docs.mongodb.com/v3.4/tutorial/perform-two-phase-commits/)

#### 2. RDBMS 支援多種資料型態，
尤其是 十進位的numeric 在計算金錢數值時特別有用，
用雙精度浮點數(double)可能會有小數的問題，
付錢的時候沒有在付99.99元的嘛，當然是付100元，
在不支援 `十進位的numeric` 的情況，大概只能在app端先處理好再寫入DB，

參考資料 Google: [Float Double 原理](https://www.google.com/search?q=Float+Double+%E5%8E%9F%E7%90%86)

#### 3. 對於小型數據庫， RDBMS 作報表很簡單，
Triton Ho 個人認為 **中小型數據庫 = 數據量 < 100GB**，
內建報表工具 `AVG`, `SUM`, `COUNT` 等，很方便

#### 4. 單純使用 SQL 就可以，不需要再用別的語言去寫程式，
基本上寫程式只要 JOIN 和 sub query 能滿足大部份需求

#### 5. 高資料安全性 保證不流失
大部份商業系統，對資料流失的容忍度都很低，
所有 RDBMS 只要回`ok`就是真的`ok`，除非HDD受損，否則資料永不流失，
部分 NoSQL 預設設定是 資料存到`RAM`就回`ok`，
在還沒寫進`HDD`前如果有`斷電`等意外情況，你的資料就掰掰了，
例如 MongoDB(2.6) 的標準設定 `Acknowledged` 就是這樣，
但可以將`write concern`設為`Journaled`，但效能會大打折扣

## 什麼是 ACID ？ 
#### Atomicity (原子性)
##### 核心思想：當機時不會有數據錯誤，而當機是不可避免的狀況。
- RDBMS 所有運作都是以 Transaction (簡稱 TX )為單位，
- 一個 TX 可以自由包含多個 SQL 指令，
- 同一個 TX 內的所有資料改動必須全部被順序執行，或是同一 TX 內所有資料改動都不被執行，
- 在當機時，所有還沒 commit 的 TX 全部會被自動 Rollback，
- Atomicity 保證系統數據從一個正確狀態 (consistent state) 直接走到下一個正確狀態，
  在 noSQL 世界，需要9個步驟的 2 phase commit 才能完成

就是說每個TX只有`全要`和`全不要`，沒有投降輸一半的，
一般寫入時其實背後自動有一個簡單的TX包起來
```sql
Update users set user_name = 'Heat' where id = 'UserA';
```
實際上是
```sql
START TRANSACTION;
Update users set user_name = 'Heat' where id = 'UserA';
COMMIT;
```

#### Consistency (一致性)
- TX commit 時，所有 constraints 都必須被滿足
- 使用 RDBMS 時，任何錯誤時把 TX Rollback 就好，不用思考怎把改動還原，
  在 noSQL 的 2pc ，有一半以上的程式碼花在當機後怎麼來復原資料

#### Isolation (隔離性)
- 同一筆資料， RDBMS 保證不會同時被兩個 TX 改動
- 要避免 race condition，會需要LOCK (上鎖)，RDBMS 能自動管理 LOCK，
  如果沒有 RDBMS 的 Isolation 會需要額外的 Locking 系統，
 
###### Example: 在沒有 isolation 下的提款程式
```
Step 1: Lock User record in DB
Step 2: GET @balance from DB
Step 3: @newBalance = @balance - @ withdrawalAmount
Step 4: if @newBalance <= 0, return error and exit
Step 5: Set @newBalance to DB
Step 6: Unlock User record in DB
Step 7: 把錢吐出來
```
如果沒有 Isolation 也沒有手動管理的 locking ，用戶可以利用 Race condition 同秒在多個 ATM 提錢去偷錢

###### Example: 簡單的購買機票
```
Step 1: Select price, vacancy from flight where flight_id = @flight_id for update
Step 2: If vacancy = 0, rollback TX and return 賣光了
Step 3: update flight set vacancy = vacancy – 1 where flight_id = @flight_id
Step 4: update user set balance = balance - $price where user_id = $user_id and balance >= $price
Step 5: if @@recordAffected = 0, rollback TX and return 用戶餘額不足
Step 6: create ticket record
Step 7: commit
```
###### Example: 簡單的戲院售票
```
1. 用戶 A 先選擇他想要的座位
update seats set user_id = 'userA' and book_time = '23:14' where position = '31A' and status != 'sold' and book_time - now > '30 minutes'

2. 用戶 A 以信用卡付款後確定座位
update seats set status = 'sold' where position = '31A' and status != 'sold' and user_id = 'userA'
```

#### Durability (持久性)
事務處理結束後，對數據的修改就是永久的，即便系統故障也不會丟失，
RDBMS 利用 `REDO Log` 來完成持久性，
而且如果每一個 TX 都要等待 Disk Random IO 完成才回`ok`，速度會慢到靠杯，
簡單說就是 執行insert data -> 寫進REDO Log -> 排隊慢慢寫進Disk

## 重點筆記
#### SQL 是宣告式 (declarative) 語言

當執行這段sql時
```sql
select yyy from TableA join TableB where TableA.xxx != TableB.xxx
```
**注意！ 不是一定從 TableA 開始查**

那DB是怎麼知道要從哪張 Table 開始查呢，
Database 如何決定這個 query 到底要先拿 A 還是 B，
主要會看 `column statistics` 去決定這次的 `query plan`，
實際上就要看你用的DB的 `query optimizer` 有多強
- MySQL 沒有 index 的 column 是完全沒有 column statistics 的，
  所以 MySQL 不設 index 就會他媽的慢
- Oracle 的 `column statistics` 做的特別好，所以速度快，但也特別貴
- PostgreSQL 是個好選擇，沒包袱的話，PostgreSQL 底層比 MySQL 好很多

#### 不要和 FB, Amazon 做比較
不要一開始就幻想你要承受百萬同時在線人數 你沒那麼多客戶，
魔獸世界夠屌了吧 台灣同時在線人數也不過60多萬，
FB, Amazon 是巨型系統，和一般中小型系統不能相提並論，
Facebook 一開始也是用 PHP + MySQL 就上線了，，
而某些公司是把RDBMS當作NoSQL用，都是特殊情境，不要拿來當範例說嘴，
應先做出產品，等賺到錢之後就有錢再找高手來重寫就好，，
今天貪圖 NoSQL 的快，你也會發現資料很快就不見。

#### RDBMS 會被 noSQL 替代
在超高容量&超高流量的情況下，是對的，
因為 noSQL 就是發明來解決像facebook這種巨型系統的東西，
但多數系統都是中小型，應該要以 `可靠度` 為優先考量

#### 就算你很屌 也要請一個同事監督你
操作 Production DB 時要用 `Read Only` 進去，
要跑sql的話，請找一個同事幫忙監督，避免出錯一鍋熟

#### 盡量遵守 3NF
不用 3NF 很可能會搞不清楚現在有哪些資料，最後也沒人能搞清楚

#### 2 phase commit 範例說明
###### 使用 2pc 的轉帳:
```
Step1:建立tx紀錄
    { id: $id, source: "A", destination: "B", value: 50, state: "initial", lastModified: now() }
Step 2: 把 tx.id 放到 schedule job ，讓 schedule job 在5分鐘後檢查這個 2pc tx
Step 3: 把 tx.status 從 "initial" 改成 "pending"
Step 4: 檢查 userA.pendingTx 為 null 。
    如是，則 set userA.pendingTx = tx.id, userA.balance -= 50
Step 5: 檢查 userB.pendingTx 為 null 。
    如是，則 set userB.pendingTx = tx.id, userB.balance += 50
Step 6: 把 tx.state 改成 "applied"
Step 7: 把 userA.pendingTx 改為 null
Step 8: 把 userB.pendingTx 改為 null
Step 9: 把 tx.status 改為 "done"
```
###### 當機處理
```
如果 application server 當掉，需要由 scheduler 事後清理:
  ● 如果 tx.state = initial :
    – 直接把tx.state改成rollback便好
  ● 如果 tx.state = pending :
    – Step1:檢查userA,如果userA.tx符合，則把 userA.tx 改回 null ，並且 userA.balance += 50
    – Step2:檢查userB,如果userB.tx符合，則把 userB.tx 改回 null ，並且 userB.balance -= 50
    – Step3:把tx.state改成rollback
  ● 如果 tx.state = applied :
    – Step1:檢查userA,如果userA.tx符合，則把userA.tx改回null 
    – Step2:檢查userB,如果userB.tx符合，則把userB.tx改回null 
    – Step3:把tx.state改成done
```
- 正在改動中紀錄( pendingTx != null 的 userA 和 userB )，，
  不能被其他 TX 改動，所以要小心 deadlock，可能需要自己寫 deadlock detector
- 在 noSQL 使用 2pc 會涉及9個 logical disk IO，，
  而 RDBMS 的 TX 只涉及2個 logical disk IO
- NoSQL 只是同時能處理更多更多的 TX ，但是每一 TX 卻要用上更多的時間

#### 簡易 No Downtime ALTER TABLE
可用 CTAS ( CREATE TABLE AS SELECT )，但需注意 Foreign Key 等問題
```sql
CREATE TABLE new_tbl [AS] SELECT * FROM orig_tbl;
```
參考資料 MySQL官方：[create-table-select](https://dev.mysql.com/doc/refman/8.0/en/create-table-select.html)
