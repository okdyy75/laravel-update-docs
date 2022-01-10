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


## `assertDispatchedSync()`などのメソッドがBusFake（ジョブのディスパッチをassertする）に追加されました
- v8.42.0
- src/Illuminate/Support/Testing/Fakes/BusFake.php

ジョブをすぐに（同期して）ディスパッチする`dispatchSync`メソッドがlaravel8では追加されたんですが、それのテストを行うためのassertが追加されました

```php
+ assertDispatchedSync($command, $callback = null)
+ assertDispatchedSyncTimes($command, $times = 1)
+ assertNotDispatchedSync($command, $callback = null)
+ dispatchedSync(string $command, $callback = null)
+ hasDispatchedSync($command)
```

https://github.com/laravel/framework/pull/37350

https://readouble.com/laravel/8.x/ja/mocking.html#bus-fake


## リレーションのクエリに`withExists()`メソッドが追加
- v8.42.0
- src/Illuminate/Database/Eloquent/Concerns/QueriesRelationships.php

一度却下されていましたが、コード量を減らして再PR＆マージされました祝

```php
$users = User::withExists('posts')->get();
//...
$isAuthor = $user->posts_exists;
```

```php
$users = User::withExists([
        'posts as is_author',
        'posts as is_tech_author' => function ($query) {
            return $query->where('category', 'tech');
        },
        'comments',
    ])->get();
//...
$user->is_author;
$user->is_tech_author;
$user->comments_exists;
```

https://github.com/laravel/framework/pull/37302

https://readouble.com/laravel/8.x/ja/eloquent-relationships.html#other-aggregate-functions

## ModelおよびEloquentのCollectionに`loadExists()`メソッドが追加
- v8.42.0
- src/Illuminate/Database/Eloquent/Collection.php
- src/Illuminate/Database/Eloquent/Model.php

v8.13.0で追加された`loadMax()`や`loadSum()`と同じように`loadExists()`も使えるようになりました

https://github.com/laravel/framework/pull/37388

https://readouble.com/laravel/8.x/ja/eloquent-relationships.html#other-aggregate-functions

## パスワードのバリデーションにデフォルトが定義できるように
- v8.42.0
- src/Illuminate/Validation/Rules/Password.php

サービスプロバイダの1つの`boot()`メソッド内で定義することで

```php
use Illuminate\Validation\Rules\Password;

/**
 * アプリケーションの全サービスの初期処理
 *
 * @return void
 */
public function boot()
{
    Password::defaults(function () {
        $rule = Password::min(8);

        return $this->app->isProduction()
                    ? $rule->mixedCase()->uncompromised()
                    : $rule;
    });
}
```

簡単にパスワードルールのデフォルトを適用できます

```php
'password' => ['required', Password::defaults()],
```

https://github.com/laravel/framework/pull/37387

https://readouble.com/laravel/8.x/ja/validation.html#defining-default-password-rules

## メンテナンスモード時のレスポンスにrefreshヘッダーの送信を許可する
- v8.42.0
- src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php

`php artisan down --refresh=x`のようにするとメンテナンスモード時のx秒後にブラウザの更新を促せます

https://github.com/laravel/framework/pull/37385

## Eloquentリレーションにone-of-manyが追加
- v8.42.0
- src/Illuminate/Database/Eloquent/Relations/Concerns/CanBeOneOfMany.php

Before

```php
public function latest_login()
{
    $this->hasOne(Login::class)->orderByDesc('id');
}
```

After

```php
public function latest_login()
{
    return $this->hasOne(Login::class)->ofMany('id', 'max'); // id and max are default
}
```

これの何が嬉しいかというと、内部で発行されるSQLがgroup+joinになり、”全ユーザーの最後のログイン履歴を取得”するような場合に発生するN+1問題が解決されます

```sql
SELECT *
FROM `logins`
INNER JOIN (
    SELECT MAX(id) AS id
    FROM logins
    GROUP BY logins.user_id
) AS latest_login 
ON latest_login.id = logins.id
```

https://github.com/laravel/framework/pull/37362

https://readouble.com/laravel/8.x/ja/eloquent-relationships.html#advanced-has-one-of-many-relationships


## Eloquentに厳密な読み込みモード追加
- v8.43.0
- src/Illuminate/Database/Eloquent/Builder.php

このモードの何が嬉しいかというとN+1問題を検知できます。

有効にすることで、以下のような場合に例外を投げます

```php
$users = User::get();

$users[0]->posts
```

```
StrictLoadingViolationException: Trying to lazy load [posts] in model [User] is restricted
```

ただしこれは機能します

```php
$user = User::find(1);

$user->posts
```

`AppServiceProvider`クラスの`boot`メソッドでこれを有効にできます。詳しくはドキュメントをチェック

```php
use Illuminate\Database\Eloquent\Model;

/**
 * アプリケーションの全サービスの初期起動処理
 *
 * @return void
 */
public function boot()
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

https://github.com/laravel/framework/pull/37363

https://readouble.com/laravel/8.x/ja/eloquent-relationships.html#preventing-lazy-loading


## assertDatabaseにモデルサポートを追加
- v8.43.0
- src/Illuminate/Foundation/Testing/Concerns/InteractsWithDatabase.php

assertDatabaseXXXX系のメソッドに、クラスを渡せるようになりました

```php
$this->assertDatabaseCount('users', 5);
$this->assertDatabaseCount(Users::class, 5);
$this->assertDatabaseCount(new User, 5);
```

https://github.com/laravel/framework/pull/37459

https://readouble.com/laravel/8.x/ja/database-testing.html#available-assertions


## 遅延ロード違反を任意で処理できるように
- v8.44.0
- src/Illuminate/Database/Eloquent/Concerns/HasAttributes.php
- src/Illuminate/Database/Eloquent/Model.php

v8.43.0で追加されたN+1問題検知機能の`preventLazyLoading`ですが、検知時の処理をカスタマイズできるようになりました

```php
// AppServiceProvider

public function boot()
{
    Model::handleLazyLoadingViolationUsing(function($model, $key) {
        \Log::warning("Lazy loaded relation [{$key}] on model [" . get_class($model) . "].");
    });
}
```

```php
// A model

protected function handleLazyLoadingViolation($key)
{
    if(app()->isProduction()) {
        \Log::warning("Lazy loaded relation [{$key}] on model [" . get_class($this) . "].");
    } else {
        throw new LazyLoadingViolationException($this, $key);
    }
}
```

https://github.com/laravel/framework/pull/37480

https://readouble.com/laravel/8.x/ja/eloquent-relationships.html#preventing-lazy-loading

## `php artisan storage:link`でのシンボリックリンクの再作成が可能に
- v8.44.0
- src/Illuminate/Foundation/Console/StorageLinkCommand.php

`--force`オプションをつけることでシンボリックリンクをオーバーライドできるようになりました

```
php artisan storage:link --force
```

## 条件付きバリデーションルールが可能に
- v8.45.0
- src/Illuminate/Support/Traits/Conditional.php

createやupdateに同じルールを使用することもできます

```php
class PageRequest extends FormRequest
{
  public function rules()
  {
    return [
      'slug' => [
        Rule::unique(Page::class, 'slug')
          ->when($this->isMethod('put'), function($rule) {
            $rule->ignoreModel($this->route('page'));
          }),
      ],
    ];
  }
}
```


## Bladeエコーステートメントにクラスハンドリングを追加
- v8.45.0
- src/Illuminate/View/Compilers/BladeCompiler.php
- src/Illuminate/View/Compilers/Concerns/CompilesEchos.php

`AppServiceProvider`に登録すると対象のクラス出力時のフォーマットを指定できるようになります


```php
// AppServiceProvider
Blade::handle(Money::class, fn($object) => $object->formatTo('en_GB'));
Blade::handle(Carbon::class, fn($object) => $object->format('d/m/Y')));
```

```php
<dl>
    <dt>Total</dt>
    <dd>{{ $product->total }}</dd> <!-- This is a money object, but will be outputted as an en_GB formatted string -->
    <dt>Created at</dt>
    <dd>{{ $product->created_at }}</dd> <!-- This is a Carbon object, but will be outputted as English date format -->
</dl>
```

## `php artisan db`での接続先にreadまたはwriteの指定が可能に
- v8.45.0
- src/Illuminate/Database/Console/DbCommand.php

`php artisan db mysql --read`

database.phpにread、wirte設定をしていた場合に有効です

```php
'mysql' => [
    'read' => [
        'host' => [
            '192.168.1.1',
            '196.168.1.2',
        ],
    ],
    'write' => [
        'host' => [
            '196.168.1.3',
        ],
    ],
```

https://github.com/laravel/framework/pull/37548

https://readouble.com/laravel/8.x/ja/database.html#read-and-write-connections

## TestResponseにダウンロードのテストを追加
- v8.45.0
- src/Illuminate/Testing/TestResponse.php

`->assertDownload()`でダウンロードのテストができるようになりました

```php
// Action:
Route::get('/', function () {
    return Response::download(Storage::path('download.png'), 'image.png');
});

// Test:
public function testExample()
{
    $this->get('/')->assertDownload('image.png')->assertOk();
}

// Result:
// OK (1 test, 2 assertions)
```

https://github.com/laravel/framework/pull/37532

https://readouble.com/laravel/8.x/ja/http-tests.html#assert-download

## Notification Stubsのカスタマイズが可能に
- v8.46.0

`php artisan make:notification`した時に自前のstubを使えるようになりました

## `php artisan schedule:run`出力にタイムスタンプが追加
- v8.46.0

## AssertableJsonに`whereContains()`が追加
- v8.47.0
- src/Illuminate/Testing/Fluent/Concerns/Matching.php

assertJsonでのテスト時に`whereContains()`が使えます

```php
use Illuminate\Testing\Fluent\AssertableJson;

/**
 * 基本的な機能テストの例
 *
 * @return void
 */
public function test_fluent_json()
{
    $response = $this->getJson('/users/1');

    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->where('id', 1)
                 ->where('name', 'Victoria Faith')
                 ->missing('password')
                 ->etc()
        );
}
```

With array of values:

```php
$assert = AssertableJson::fromArray([
    'foo' => [1,2,3],
    'bar' => 'baz',
]);

// Passes:
$assert->whereContains('foo', 1);
$assert->whereContains('foo', [2,3]);
$assert->whereContains('bar', 'baz');

// Fails:
$assert->whereContains('foo', '1'); // Property [foo] does not contain [1].
$assert->whereContains('foo', 4); // Property [foo] does not contain [4].
$assert->whereContains('foo', [3,4]); // Property [foo] does not contain [4].
$assert->whereContains('bar', ['bar','baz']); // Property [bar] does not contain [bar].
```

With array of nested values:

```php
$assert = AssertableJson::fromArray([
    ['id' => 1],
    ['id' => 2],
    ['id' => 3],
    ['id' => 4],
]);

// Passes:
$assert->whereContains('id', 1);
$assert->whereContains('id', [1,2,3,4]);
$assert->whereContains('id', [4,3,2,1]);

// Fails:
$assert->whereContains('id', '1'); // Property [id] does not contain [1].
$assert->whereContains('id', 5); // Property [id] does not contain [5].
$assert->whereContains('id', [1,2,3,4,5]); // Property [id] does not contain [5].
$assert->whereContains('id', [1,2,3,4,5,6]); // Property [id] does not contain [5, 6].
```

https://github.com/laravel/framework/pull/37631

https://readouble.com/laravel/8.x/ja/http-tests.html#fluent-json-testing

## Strヘルパーに`match`と`matchAll`が追加
- v8.47.0
- src/Illuminate/Support/Str.php

```php
Str::of('xyz')->match('/(xyz)/'); // works
Str::match('/(xyz)/'); // does not work
```

https://readouble.com/laravel/8.x/ja/helpers.html#collection-method

## バリデーションルールの`password`が`current_password`に移行
- v8.47.0
- src/Illuminate/Validation/Concerns/ValidatesAttributes.php

v8系では`password`も使えますが、v9以降は`current_password`に移行されます。目的としては次のメジャーバージョンであるv10系で`password`を`Password::default()`のエイリアスにしたいようです

https://github.com/laravel/framework/pull/37650

https://readouble.com/laravel/8.x/ja/validation.html#rule-current-password

## Paginatorで`tap()`が使えるように
- v8.47.0
- src/Illuminate/Pagination/AbstractCursorPaginator.php
- src/Illuminate/Pagination/AbstractPaginator.php

Before

```php
$posts = App\Models\Post::search('Laravel')->paginate();

$posts->load('author');

return $posts;
```

After

```php
return App\Models\Post::search('Laravel')
    ->paginate()
    ->tap(function ($posts) {
        $posts->load('author');
    });
```

## `php artisan queue:prune-failed`が追加
- v8.48.0
- src/Illuminate/Queue/Console/PruneFailedJobsCommand.php

失敗したジョブ（failed_jobsテーブル）をすべて削除できます

`php artisan queue:prune-failed`

48時間以上前に挿入された失敗したジョブ（failed_jobsテーブル）をすべて削除できます

`php artisan queue:prune-failed --hours=48`

queue:flushコマンドからも失敗したジョブ（failed_jobsテーブル）をすべて削除できます

`php artisan queue:flush`


`queue:prune-failed`と`queue:flush`の違いは最新のレコードを保持するかどうかです

## オンデマンドディスクの構成が可能に
- v8.48.0
- src/Illuminate/Filesystem/FilesystemManager.php

config/filesystems.phpを使わないストレージ構成を使用できるようになりました

```php
Storage::build([
    'driver'     => 'local',
    'root'       => 'my-custom-path',
    'url'        => 'my-custom-url',
    'visibility' => 'public',
]);
```

https://github.com/laravel/framework/pull/37720

https://readouble.com/laravel/8.x/ja/filesystem.html#on-demand-disks


## Collectionに`sliding()`メソッドが追加
- v8.48.0
- src/Illuminate/Collections/Collection.php

リンクリストを作る時なんかに使えるらしいです。

```php
Collection::times(5)->sliding(2); // [[1, 2], [2, 3], [3, 4], [4, 5]]
Collection::times(5)->sliding(3); // [[1, 2, 3], [2, 3, 4], [3, 4, 5]]

Collection::times(5)->sliding(3, step: 2); // [[1, 2, 3], [3, 4, 5]]
```

https://github.com/laravel/framework/pull/37751

## HttpクライアントのRequestでマクロが使用可能
- v8.48.0
- src/Illuminate/Http/Client/Request.php

Httpクライアント使用時のテストで便利なようです

```php
Request::macro('xml', function () {
    return CustomSuperDuperXmlParser::parse($this->body());
});

Http::fake([
    'example.com/*' => function (Request $request) {
        $this->assertSame($request->xml()->someProperty, 'some value')

        return Http::response();
    },
]);
```

https://github.com/laravel/framework/pull/37744

## `FileFactory::image()`でGIF, WEBP, WBMP, BMPをサポート
- v8.48.0
- src/Illuminate/Http/Testing/FileFactory.php

https://github.com/laravel/framework/pull/37743

## Httpレスポンスから`statusText()`を取得
- v8.48.2
- src/Illuminate/Http/ResponseTrait.php

```php
    $response = new Response('foo');
    $response->setStatusCode(404);
    $this->assertSame('Not Found', $response->statusText());
```

https://github.com/laravel/framework/pull/37795


## `Model::factory()->sequence()`クロージャーから`$count`と`$index`の参照が可能に
- v8.48.2
- src/Illuminate/Database/Eloquent/Factories/Sequence.php

ドキュメントより

> シーケンスクロージャ内では，クロージャへ注入されるシーケンスインスタンスの$indexまたは$countプロパティにアクセスできます。$indexプロパティには、これまでに行われたシーケンスの反復回数が格納され、$countプロパティには、シーケンスが起動された合計回数が格納されます。

```php
$users = User::factory()
                ->count(10)
                ->sequence(fn ($sequence) => ['name' => 'Name '.$sequence->index])
                ->create();
```

https://readouble.com/laravel/8.x/ja/database-testing.html#sequences


## 後続のログにコンテキストを追加
- v8.49.0
- src/Illuminate/Log/Logger.php

ドキュメントより

> 後続のすべてのログエントリに含めるコンテキスト情報を指定したい場合もあるでしょう。例えば、アプリケーションに入ってくる各リクエストに関連付けたリクエストIDをログに記録したい場合があります。実現するには、LogファサードのwithContextメソッドを呼び出してください。

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AssignRequestId
{
    /**
     * 受信リクエストの処理
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $requestId = (string) Str::uuid();

        Log::withContext([
            'request-id' => $requestId
        ]);

        return $next($request)->header('Request-Id', $requestId);
    }
}
```

https://github.com/laravel/framework/pull/37847/files

https://readouble.com/laravel/8.x/ja/logging.html#contextual-information
