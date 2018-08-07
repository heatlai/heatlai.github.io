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
### 然後你的 get_headers() 就復活了
