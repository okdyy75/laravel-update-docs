# v8.40-v8.49

## Modelのイベントを発火させずにupdateするメソッドが追加
- v8.41.0
- src/Illuminate/Database/Eloquent/Model.php

`update([])`と同じように使えます

```php
Model::updateQuietly([])
```

ちなみにsaveメソッドにはすでにあります

```php
$user = User::findOrFail(1);

$user->name = 'Victoria Faith';

$user->saveQuietly();
```

https://github.com/laravel/framework/pull/37169

https://readouble.com/laravel/8.x/ja/eloquent.html#saving-a-single-model-without-events


## カーソルページネーションが追加
- v8.41.0
- src/Illuminate/Contracts/Pagination/CursorPaginator.php

無限スクロールや、ビッグデータを扱う際のページング時に使うと良いらしいです。

詳しくはドキュメントをチェック！

```php
$users = DB::table('users')->orderBy('id')->cursorPaginate(15);
```

https://github.com/laravel/framework/pull/37216

https://readouble.com/laravel/8.x/ja/pagination.html#cursor-pagination
