---
layout: post
title:  '[PHP] 檢查多維陣列內數值是否存在'
subtitle: 'PHP - Deep In Array'
background: '/img/posts/04.jpg'

date: 2018-05-03

tags: [PHP]
---

# 檢查多維陣列內數值是否存在

```
function deepInArray( $value, $targetArray )
{
    foreach ( $targetArray as $arrayValue )
    {
        if ( ! is_array( $arrayValue ) )
        {
            if ( $value == $arrayValue )
            {
                return true;
            }
        }
        else
        {
            if ( deepInArray( $value, $arrayValue ) )
            {
                return true;
            }
        }
    }

    return false;
}
```