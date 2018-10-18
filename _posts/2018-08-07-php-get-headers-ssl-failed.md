---
layout: post
title:  '[PHP] get_headers SSL failed'
subtitle: 'PHP - get_headers SSL failed'
background: '/img/posts/04.jpg'

date: 2018-08-07

tags: [PHP]
---
```php
stream_context_set_default([
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false,
    ],
]);
```
然後你的 get_headers() 就可以用了，但只是暫時忽略 https 驗證

### SSL 驗證不過，可能是缺少 CA路徑檔

在 php.ini 補上 config
```
openssl.cafile=/etc/ssl/cert.pem
```
如果 cert.pem 不存在，可以到 [CA Extract](https://curl.haxx.se/docs/caextract.html "CA Extract") 下載