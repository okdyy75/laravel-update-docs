# v8.10-v8.19


## Eloquentやクエリービルダでupsertが使えるように
- v8.10.0
- src/Illuminate/Database/Query/Builder.php

MySQLの場合on duplicate key updateを使っており、uniqueかprimary keyが必要なので注意

```php
User::upsert([
	['id' => 1, 'email' => 'taylor@example.com'],
	['id' => 2, 'email' => 'dayle@example.com'],
], 'email');
```

https://github.com/laravel/framework/pull/34698

https://readouble.com/laravel/8.x/ja/queries.html#upserts


## バリデーションで倍数のチェックができるように
- v8.10.0
- src/Illuminate/Validation/Concerns/ValidatesAttributes.php

```html
<input type="number" step="0.5" name="foo">
```

```php
public function rules(): array
{
	return [
		'foo' => [
			'multiple_of:0.5',
		]
	];
}
```

https://github.com/laravel/framework/pull/34788

## マイグレーションで外部キー制約のカラム削除が簡単に
- v8.10.0
- src/Illuminate/Database/Schema/Blueprint.php

Before

```php
class AddCategoryIdToPostsTable extends Migration
{
	public function down()
	{
		Schema::table('posts', function (Blueprint $table) {
			$table->dropForeign(['category_id']);
			$table->dropColumn('category_id');
		});
	}
}
```

After

```php
class AddCategoryIdToPostsTable extends Migration
{
	public function down()
	{
		Schema::table('posts', function (Blueprint $table) {
			$table->dropConstrainedForeignId('category_id');
		});
	}
}
```

https://github.com/laravel/framework/pull/34806


## Eloquentのcastsに`encrypted`が使えるように
- v8.12.0
- src/Illuminate/Database/Eloquent/Concerns/HasAttributes.php

以前はアクセサやカスタムキャストを作る必要がありましたが、直接指定できるようになりました

```php
public $casts = [
	'access_token' => 'encrypted',
];
```

https://github.com/laravel/framework/pull/34937

## リレーションのクエリに`withMax()`|`withMin()`|`withSum()`|`withAvg()`メソッドが追加
- v8.12.0
- src/Illuminate/Database/Eloquent/Concerns/QueriesRelationships.php

発行されるSQLはサブクエリなので注意

```php
Post::withCount('comments');
Post::withMax('comments', 'created_at');
Post::withMin('comments', 'created_at');
Post::withSum('comments', 'foo');
Post::withAvg('comments', 'foo');
```

https://github.com/laravel/framework/pull/34965

https://readouble.com/laravel/8.x/ja/eloquent-relationships.html#other-aggregate-functions


## Eloquentやクエリービルダでexplainが使えるように
- v8.12.0
- src/Illuminate/Database/Concerns/ExplainsQueries.php

```php
>>> DB::table('users')->where('name', 'Illia Sakovich')->explain()
=> Illuminate\Support\Collection {#5348
	 all: [
		{#5342
		 +"id": 1,
		 +"select_type": "SIMPLE",
		 +"table": "users",
		 +"partitions": null,
		 +"type": "ALL",
		 +"possible_keys": null,
		 +"key": null,
		 +"key_len": null,
		 +"ref": null,
		 +"rows": 9,
		 +"filtered": 11.11111164093,
		 +"Extra": "Using where",
		},
	 ],
	}
```

https://github.com/laravel/framework/pull/34969

## ルーティングに正規表現メソッドが追加
- v8.12.0
- src/Illuminate/Routing/RouteRegexConstraintTrait.php

`whereNumber`|`whereAlpha`|`whereAlphaNumeric`|`whereUuid`などが使えるようです

Before

```php
Route::get('authors/{author}/{book}')->where(['author' => '[0-9]+', 'book' => '[a-zA-Z]+']);
```

After

```php
Route::get('authors/{author}/{book}')->whereNumber('author')->whereString('book');
```

https://github.com/laravel/framework/pull/34997

https://readouble.com/laravel/8.x/ja/routing.html#parameters-regular-expression-constraints


## EloquentのCollectionに`loadMax()`|`loadMin()`|`loadSum()`|`loadAvg()`メソッド追加。Eloquentに`loadMax()`|`loadMin()`|`loadSum()`|`loadAvg()`|`loadMorphMax()`|`loadMorphMin()`|`loadMorphSum()`|`loadMorphAvg()`メソッド追加
- v8.13.0
- src/Illuminate/Database/Eloquent/Collection.php
- src/Illuminate/Database/Eloquent/Model.php

これも便利ですが、サブクエリとして発行されるので注意

```php
	//Eloquent/Collection

	public function loadAggregate($relations, $column, $function = null) {...}
	public function loadCount($relations) {...} //Just modified.
	public function loadMax($relations, $column)  {...}
	public function loadMin($relations, $column)  {...}
	public function loadSum($relations, $column)  {...}
	public function loadAvg($relations, $column)  {...}
```

```php
	//Eloquent/Model

	public function loadAggregate($relations, $column, $function = null) {...}
	public function loadCount($relations) {...} //Just modified.
	public function loadMax($relations, $column) {...}
	public function loadMin($relations, $column) {...}
	public function loadSum($relations, $column) {...}
	public function loadAvg($relations, $column) {...}

	public function loadMorphAggregate($relation, $relations, $column, $function = null) {...}
	public function loadMorphCount($relation, $relations) {...} //Just modified.
	public function loadMorphMax($relation, $relations, $column) {...}
	public function loadMorphMin($relation, $relations, $column) {...}
	public function loadMorphSum($relation, $relations, $column) {...}
	public function loadMorphAvg($relation, $relations, $column) {...}
```

こんな感じで使えます

```php
	$user = User::find(1);
	$user->loadCount('posts');
	$user->loadMax('posts', 'created_at');
```

https://github.com/laravel/framework/pull/35029

https://readouble.com/laravel/8.x/ja/eloquent-relationships.html#deferred-count-loading  

## Eloquentのcasts`encrypted`で使用する暗号鍵を設定できる`Model::encryptUsing()`が追加
- v8.14.0
- src/Illuminate/Database/Eloquent/Concerns/HasAttributes.php

```php
use Illuminate\Database\Eloquent\Model;
use Illuminate\Encryption\Encrypter;

$databaseEncryptionKey = config('database.encryption_key');

$encrypter = new Encrypter($databaseEncryptionKey);

Model::encryptUsing($encrypter);
```

https://github.com/laravel/framework/pull/35080

## HttpのResponseを返す際に指定のクッキーを無くす`withoutCookie()`メソッドが追加
- v8.15.0
- src/Illuminate/Http/ResponseTrait.php

単純に有効期限切れにする感じです

```php
	/**
	 * Expire a cookie when sending the response.
	 *
	 * @param  \Symfony\Component\HttpFoundation\Cookie|mixed  $cookie
	 * @param  string|null $path
	 * @param  string|null $domain
	 * @return $this
	 */
	public function withoutCookie($cookie, $path = null, $domain = null)
	{
		if (is_string($cookie) && function_exists('cookie')) {
			$cookie = cookie($cookie, null, -2628000, $path, $domain);
		}

		$this->headers->setCookie($cookie);

		return $this;
	}
```

https://github.com/laravel/framework/commit/e9483c441d5f0c8598d438d6024db8b1a7aa55fe

## アップロードファイルのテスト時にexistsと合わせてcontentもチェックできるように
- v8.15.0
- src/Illuminate/Filesystem/FilesystemAdapter.php

Before

```php
Storage::disk('reports')->assertExists('foo.csv');
$this->assertSame('my;csv;content', Storage::disk('reports')->read('foo.csv'));
```

After

```php
Storage::disk('reports')->assertExists('foo.csv', 'my;csv;content');
```

## Collectionで複数ソートができるように
- v8.16.0
- src/Illuminate/Collections/Collection.php

```php
$collection = collect([
	['name' => 'Taylor Otwell', 'age' => 34],
	['name' => 'Abigail Otwell', 'age' => 30],
	['name' => 'Taylor Otwell', 'age' => 36],
	['name' => 'Abigail Otwell', 'age' => 32],
]);

$sorted = $collection->sortBy([
	['name', 'asc'],
	['age', 'desc'],
]);

$sorted->values()->all();

/*
	[
		['name' => 'Abigail Otwell', 'age' => 32],
		['name' => 'Abigail Otwell', 'age' => 30],
		['name' => 'Taylor Otwell', 'age' => 36],
		['name' => 'Taylor Otwell', 'age' => 34],
	]
*/
```

https://github.com/laravel/framework/pull/35277

https://readouble.com/laravel/8.x/ja/collections.html#method-sortby

## artisanを介してDBに接続できる`php artisan db`が追加
- v8.16.0
- src/Illuminate/Database/Console/DbCommand.php

mysql-clientなどインストールされている必要があるので注意！

https://github.com/laravel/framework/pull/35304



## factoryで、存在する親モデルのインスタンスを紐付けするサポートが追加
- v8.18.0
- src/Illuminate/Database/Eloquent/Factories/Factory.php

factoryを作成する際にforでは親のfactoryを渡す方法だけでしたが

```php
use App\Models\Post;
use App\Models\User;

$posts = Post::factory()
			->count(3)
			->for(User::factory()->state([
				'name' => 'Jessica Archer',
			]))
			->create();
```

親のモデルインスタンスを渡して紐付けできるように

```php
$user = User::factory()->create();

$posts = Post::factory()
			->count(3)
			->for($user)
			->create();
```

https://github.com/laravel/framework/pull/35494

https://readouble.com/laravel/8.x/ja/database-testing.html#belongs-to-relationships

## メール本文の内容をテストするためのメソッドがいくつか追加
- v8.18.0
- src/Illuminate/Mail/Mailable.php

```php
use App\Mail\InvoicePaid;
use App\Models\User;

public function test_mailable_content()
{
	$user = User::factory()->create();

	$mailable = new InvoicePaid($user);

	$mailable->assertSeeInHtml($user->email);
	$mailable->assertSeeInHtml('Invoice Paid');

	$mailable->assertSeeInText($user->email);
	$mailable->assertSeeInText('Invoice Paid');
}
```


https://github.com/laravel/framework/commit/afb858ad9c944bd3f9ad56c3e4485527d77a7327

https://readouble.com/laravel/8.x/ja/mail.html#testing-mailables


## スケジュール一覧を表示する`php artisan schedule:list`が追加
- v8.19.0
- src/Illuminate/Console/Scheduling/ScheduleListCommand.php

https://github.com/laravel/framework/pull/35574

## ジョブデータを暗号化できるように
- v8.19.0
- src/Illuminate/Contracts/Queue/ShouldBeEncrypted.php

jobsテーブルのpayloadを見ると大体の内容がわかってしまうが、ShouldBeEncryptedを実装してあげれば暗号可能に

```php
use Illuminate\Contracts\Queue\ShouldBeEncrypted;

class VerifyUser implements ShouldQueue, ShouldBeEncrypted
{
	private $user;
	private $socialSecurityNumber;

	public function __construct($user, $socialSecurityNumber)
	{
		$this->user = $user;
		$this->socialSecurityNumber = $socialSecurityNumber;
	}
}
```

https://github.com/laravel/framework/pull/35527

https://divinglaravel.com/job-encryption-in-laravel
