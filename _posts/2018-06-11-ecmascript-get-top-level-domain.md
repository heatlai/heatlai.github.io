---
layout: post
title:  '[ECMAScript] 取得最上層網域'
subtitle: 'ECMAScript - Get Top Level Domain'
background: '/img/posts/03.jpg'

date: 2018-06-11

tags: [ECMAScript, Cookie]
---

# 取得最上層網域

方便有多個子網域時 set-cookie

```javascript
window.topLevelDomain = (function() {
    let hostname = document.location.hostname.split('.');

    if( hostname.length === 1)
    {
        return hostname[0];
    }

    let tryCookie = 'try_get_top_level_domain=cookie';
    
    for (let i = hostname.length - 1; i >= 0; i--)
    {
        let tryingName = hostname.slice(i).join('.');
        document.cookie = tryCookie + ';domain=.' + tryingName + ';';

        if (document.cookie.indexOf(tryCookie) > -1)
        {
            document.cookie = tryCookie.split('=')[0] + '=;domain=.' + tryingName + ';expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            return tryingName;
        }
    }
})();
    
window.topLevelDomain;
// return "xxx.com" 
```