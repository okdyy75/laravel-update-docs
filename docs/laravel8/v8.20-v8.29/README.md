# v8.20-v8.29

## ジョブバッチをクリアできる`php artisan queue:prune-batches`コマンドが追加
- v8.21.0
- src/Illuminate/Queue/Console/PruneBatchesCommand.php

```bash
>>> php artisan queue:prune-batches
199 entries deleted.
```

```php
$schedule->command('queue:prune-batches --hours=48')->daily();
```

https://github.com/laravel/framework/pull/35694

https://readouble.com/laravel/8.x/ja/queues.html#pruning-batches

## クエリービルダに、レコードが1つだけ存在かつそれを取得する`sole()`メソッドが追加
- v8.23.0
- src/Illuminate/Database/Concerns/BuildsQueries.php

レコードが存在しない、複数レコードが存在する場合は例外を投げます。
Djangoでは`get`、Railsでは`sole`や`find_sole_by`で存在するそうです

```php
$user = User::where('name', 'test1')->sole();
```

https://github.com/laravel/framework/pull/35869

## throw_if / throw_unless がデフォルトでRuntimeExceptionを投げるように
- v8.23.0
- src/Illuminate/Support/helpers.php

https://github.com/laravel/framework/pull/35890


## 並列テストが可能に
- v8.25.0
- src/Illuminate/Testing/ParallelRunner.php

詳しい使い方はドキュメントをチェック！

https://github.com/laravel/framework/pull/36034

https://readouble.com/laravel/8.x/ja/testing.html#running-tests-in-parallel


## Listeners, Mailables, NotificationsでShouldBeEncryptedが使えるように
- v8.25.0
- src/Illuminate/Events/CallQueuedListener.php
- src/Illuminate/Mail/SendQueuedMailable.php
- src/Illuminate/Notifications/SendQueuedNotifications.php

v8.19.0でジョブの内容を暗号化するようにリスナー、メール、通知でも使えるようです

https://github.com/laravel/framework/pull/36036

## ルーティングに`missing()`メソッドが追加
- v8.26.0
- src/Illuminate/Routing/Middleware/SubstituteBindings.php

ルートモデルバインディングを使用した際に、該当のデータがない場合にModelNotFoundExceptionが投げられますが、それを任意で処理できるように


```php
Route::get('/locations/{location:slug}', [LocationsController::class, 'show'])
	->name('locations.view')
	->missing(fn($request) => Redirect::route('locations.index', null, 301));
```

https://github.com/laravel/framework/pull/36035

https://readouble.com/laravel/8.x/ja/routing.html#customizing-missing-model-behavior

## Str::markdown(), Stringable::markdown()が追加
- v8.26.0
- src/Illuminate/Support/Str.php

```php
Str::markdown('# Hello World')
Str::of('# Hello World')->markdown()
```

https://github.com/laravel/framework/pull/36071

https://readouble.com/laravel/8.x/ja/helpers.html#method-str-markdown

## after columnで複数追加できるように
- v8.27.0
- src/Illuminate/Database/Schema/Blueprint.php

```php
Schema::table('users', function (Blueprint $table) {
	$table->after('remember_token', function ($table){
		$table->string('card_brand')->nullable();
		$table->string('card_last_four', 4)->nullable();
	});
});
```

https://github.com/laravel/framework/pull/36145

https://readouble.com/laravel/8.x/ja/migrations.html#column-order

## EloquentのcastにAsArrayObject、AsCollectionが使えるように
- v8.28.0
- src/Illuminate/Database/Eloquent/Casts/AsArrayObject.php
- src/Illuminate/Database/Eloquent/Casts/AsCollection.php

castsにarrayを指定すると、jsonやtext型のフィールドに対して配列形式で保存することが可能ですが、AsArrayObjectやAsCollectionを指定することでObjectやCollectionで扱えるようになりました。詳しくはドキュメントをチェック！

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
	/**
	 * キャストする必要のある属性
	 *
	 * @var array
	 */
	protected $casts = [
		'options' => AsArrayObject::class,
	];
}
```

https://github.com/laravel/framework/pull/36245

https://readouble.com/laravel/8.x/ja/eloquent-mutators.html#array-and-json-casting
