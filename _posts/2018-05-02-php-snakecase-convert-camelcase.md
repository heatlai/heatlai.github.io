---
layout: post
title:  'SnakeCase CamelCase 轉換'
subtitle: 'PHP - SnakeCase CamelCase Transform'
background: '/img/posts/04.jpg'

date: 2018-05-03

categories: development
category: Programing
tags: [PHP]
---

# SnakeCase CamelCase 互轉

```
function snakeCaseToCamelCase( $string, $capitalizeFirstCharacter = false ) : string
{

    $str = str_replace('_', '', ucwords($string, '_'));

    if ( ! $capitalizeFirstCharacter )
    {
        $str = lcfirst($str);
    }

    return $str;
}

function camelCaseToSnakeCase( string $string ) : string
{
    return strtolower(preg_replace(['/([a-z\d])([A-Z])/', '/([^_])([A-Z][a-z])/'], '$1_$2', $string));
}
```