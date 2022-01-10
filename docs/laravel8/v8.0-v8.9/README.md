# v8.0-v8.9

## paginationにlinksプロパティーが追加
- v8.0.3
- src/Illuminate/Pagination/LengthAwarePaginator.php

こんなふうにpaginateをjsonで返した場合にlinksプロパティーが追加されました。linksプロパティーの詳細は「laravel pagination カスタマイズ」で検索！

```php
Route::get('/users', function () {
    return User::paginate();
});
```

```php
{
    "total": 50,
    "per_page": 15,
    "current_page": 1,
    "last_page": 4,
    "first_page_url": "http://laravel.app?page=1",
    "last_page_url": "http://laravel.app?page=4",
    "next_page_url": "http://laravel.app?page=2",
    "prev_page_url": null,
    "path": "http://laravel.app",
    "from": 1,
    "to": 15,
    "data":[
        {
            // レコード…
        },
        {
            // レコード…
        }
    ],
    // ↓追加された
    "links": [
      {
        "url": null,
        "label": "&laquo; Previous",
        "active": false
      },
      {
        "url": "http://laravel.app?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": null,
        "label": "Next &raquo;",
        "active": false
      }
    ],
}
```

https://github.com/laravel/framework/commit/13751a187834fabe515c14fb3ac1dc008fd23f37


## Testクラス内でjson型のカラムと比較できる`castAsJson()`メソッドが追加
- v8.3.0
- src/Illuminate/Foundation/Testing/Concerns/InteractsWithDatabase.php

```php
$this->assertDatabaseHas('users', [
    'name' => 'Peter Parker',
    'email' => 'spidey@yahoo.com',
    'skills' => $this->castAsJson(json_encode(['web slinging', 'spidey-sense', 'sticky feet'])),
]);
```

https://github.com/laravel/framework/pull/34302

## キュー処理のジョブバッチで使用するbatchメソッドにクロージャ（無名関数）を渡せるように
- v8.3.0
- src/Illuminate/Bus/Batch.php

```php
Bus::batch([
    new ProcessPodcast,
    function () {
        // ...
    },
    new ReleasePodcast
])->dispatch();
```

https://github.com/laravel/framework/pull/34333


## ジョブをクリアできる`php artisan queue:clear`コマンドが追加
- v8.4.0
- src/Illuminate/Queue/Console/ClearCommand.php

ジョブ（jobsテーブル）はクリアできるけど、ジョブバッチ（job_batchesテーブル）、失敗したジョブ（failed_jobsテーブル）には残るので注意

```bash
php artisan queue:clear
```

https://github.com/laravel/framework/pull/34330


## クエリービルダに`crossJoinSub()`メソッド追加
- v8.5.0
- src/Illuminate/Database/Query/Builder.php

joinSub、leftJoinSub、rightJoinSubに加えてcrossJoinSubが追加

https://github.com/laravel/framework/pull/34400

https://readouble.com/laravel/8.x/ja/queries#subquery-joins


## LazyCollectionにタイムアウトを設定できるように
- v8.6.0
- src/Illuminate/Collections/LazyCollection.php

LazyCollectionにタイムアウトを設定できるようになりました。  

```php
$lazyCollection
    ->takeUntilTimeout(now()->add(2, 'minutes'))
    ->each(fn ($item) => doSomethingThatMayTakeSomeTime($item));
 
// ^^ This will only process items for up to 2 minutes ^^
```

## Httpクライアントでのレスポンスエラー発生時に`onError()`でコールバック処理ができるように
- v8.7.0
- src/Illuminate/Http/Client/Response.php

`throw()`との違いは例外を投げるかどうかです。

Before

```php
$response = $client->withHeaders($headers)->post($url, $payload);

if ($response->failed()) {
    Log::error('Twitter API failed posting Tweet', [
        'url' => $url,
        'payload' => $payload,
        'headers' => $headers,
        'response' => $response->body(),
    ]);

    $response->throw();
}

return $response->json();
```

After

```php
return $client->withHeaders($headers)
    ->post($url, $payload)
    ->onError(fn ($response) =>
        Log::error('Twitter API failed posting Tweet', [
            'url' => $url,
            'payload' => $payload,
            'headers' => $headers,
            'response' => $response->body(),
        ])
    )->throw()->json();
```


https://github.com/laravel/framework/pull/34558

## Collectionに`pipeInto()`メソッドが追加されました
- v8.8.0
- src/Illuminate/Collections/Traits/EnumeratesValues.php

APIリソースを返す時に使えそうです

#### pipeInto
```php
class ResourceCollection
{
    /**
     * コレクションインスタンス
     */
    public $collection;

    /**
     * 新しいResourceCollectionインスタンスの生成
     *
     * @param  Collection  $collection
     * @return void
     */
    public function __construct(Collection $collection)
    {
        $this->collection = $collection;
    }
}

$collection = collect([1, 2, 3]);

$resource = $collection->pipeInto(ResourceCollection::class);

$resource->collection->all();

// [1, 2, 3]
```

https://github.com/laravel/framework/pull/34600

https://readouble.com/laravel/8.x/ja/collections.html#method-pipeinto

## HttpクライアントでuserAgentをセットする`withUserAgent()`メソッドが追加
- v8.8.0
- src/Illuminate/Collections/Traits/EnumeratesValues.php

Before

```php
Http::withHeaders(['User-Agent' => $userAgent])->get($url);
```

After

```php
Http::withUserAgent($userAgent)->get($url);
```

https://github.com/laravel/framework/pull/34611


## スケジュールをローカルで実行できる`php artisan schedule:work`が追加

今まではスケジュールを動かすのに`schedule:run`コマンドをcronに登録しておく必要がありましたが、ローカルからフォアグラウンドで動かしておける`schedule:work`が追加されました。

これは結構便利ですね

https://github.com/laravel/framework/pull/34618

https://readouble.com/laravel/8.x/ja/scheduling.html#running-the-scheduler-locally


## paginatorのアイテムを変換できる`through()`メソッドが追加
- v8.9.0
- src/Illuminate/Pagination/AbstractPaginator.php

今までは`$paginator->getCollection()->transform()`なんてしていましたが、その必要も無くなりました

```php
return Inertia::render('Contacts/Index', [
    'contacts' => Contact::paginate()->through(function ($contact) {
        return [
            'id' => $contact->id,
            'name' => $contact->name,
            'phone' => $contact->phone,
            'city' => $contact->city,
            'organization' => optional($contact->organization)->only('name')
        ];
    }),
]);
```

https://github.com/laravel/framework/pull/34657
