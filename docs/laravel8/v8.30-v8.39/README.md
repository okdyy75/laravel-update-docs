# v8.30-v8.39

## バリデーションで最初にエラーが見つかったら即終了する`stopOnFirstFailure()`メソッドが追加
- v8.30.0
- src/Illuminate/Foundation/Http/FormRequest.php

```php
if ($validator->stopOnFirstFailure()->fails()) {
	// ...
}
```

https://github.com/laravel/framework/commit/39e1f84a48fec024859d4e80948aca9bd7878658

https://readouble.com/laravel/8.x/ja/validation.html#manually-creating-validators

## FluentなjsonのAssertが追加
- v8.32.0
- src/Illuminate/Testing/Fluent/Assert.php

Fluent（メソッドチェーンライク）にjsonのassertができるようになりました。

```php
use Illuminate\Testing\Fluent\Assert;

class PodcastsControllerTest extends TestCase
{
	public function test_can_view_podcast()
	{
		$this->get('/podcasts/41')
			->assertJson(fn (Assert $json) => $json
				->has('podcast', fn (Assert $json) => $json
					->where('id', $podcast->id)
					->where('subject', 'The Laravel Podcast')
					->where('description', 'The Laravel Podcast brings you Laravel & PHP development news.')
					->has('seasons', 4)
					->has('seasons.4.episodes', 21)
					->has('host', fn (Assert $json) => $json
						->where('id', 1)
						->where('name', 'Matt Stauffer')
					)
					->has('subscribers', 7, fn (Assert $json) => $json
						->where('id', 2)
						->where('name', 'Claudio Dekker')
						->where('platform', 'Apple Podcasts')
						->etc()
						->missing('email')
						->missing('password')
					)
				)
			);
	}
}
```

https://github.com/laravel/framework/pull/36454

https://readouble.com/laravel/8.x/ja/http-tests.html#fluent-json-testing

## `Str::remove`, `Stringable::remove()`が追加
- v8.34.0
- src/Illuminate/Support/Str.php

```php
// Fbar
Str::remove('o', 'Foobar');
Str::of('Foobar')->remove('o');

// Fbr
Str::remove(['o', 'a'], 'Foobar');
Str::of('Foobar')->remove(['o', 'a']);
```

https://github.com/laravel/framework/pull/36639

https://readouble.com/laravel/8.x/ja/helpers.html#method-str-remove

## Eloquentに`lazy()`と`lazyById()`メソッドが追加
- v8.34.0
- src/Illuminate/Database/Concerns/BuildsQueries.php

LazyCollectionを使うことでメモリ消費を抑えつつ、Collectionのように扱えるようになった！という感じですね

```php
$lazyCollection = User::lazy();
```

https://github.com/laravel/framework/pull/36699

https://readouble.com/laravel/8.x/ja/eloquent.html#streaming-results-lazily


## MySQLのdatetime型へのuseCurrentOnUpdateをサポート
- v8.36.0
- src/Illuminate/Database/Schema/Grammars/MySqlGrammar.php

https://github.com/laravel/framework/pull/36817

https://readouble.com/laravel/8.x/ja/migrations.html#column-modifiers

## 無名クラスでマイグレーションが可能に
- v8.37.0
- src/Illuminate/Database/Migrations/Migrator.php

クラス名の衝突がなくなります

```php
<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
	//
};
```

https://github.com/laravel/framework/pull/36906

https://readouble.com/laravel/8.x/ja/migrations.html#anonymous-migrations


## Httpクライアントで同時非同期リクエスト処理ができるように
- v8.37.0
- src/Illuminate/Http/Client/PendingRequest.php
- src/Illuminate/Http/Client/Pool.php

効率良くHttpリクエストを処理できるようになりました

```php
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;

$responses = Http::pool(fn (Pool $pool) => [
	$pool->get('http://localhost/first'),
	$pool->get('http://localhost/second'),
	$pool->get('http://localhost/third'),
]);

return $responses[0]->ok() &&
		$responses[1]->ok() &&
		$responses[2]->ok();
```

https://github.com/laravel/framework/pull/36948

https://readouble.com/laravel/8.x/ja/http-client.html#concurrent-requests

## `wordCount()`ヘルパーが追加
- v8.38.0
- src/Illuminate/Support/Str.php
- src/Illuminate/Support/Stringable.php

phpの`str_word_count()`のラッパーです。`str_word_count()`はマルチバイト文字列を使うロケールはサポート外らしく日本語では使えません

```php
public function getWordCountAttribute(): int
{
	return Str::of($this->body)
		->replace('x', 'y') // do something
		->replace('a', 'b') // do something else
		->wordCount();
}
```

https://github.com/laravel/framework/pull/36990/files

## `Stringable::whenNotEmpty()`が追加
- v8.39.0
- src/Illuminate/Support/Stringable.php

```php
Str::of(env('SCOUT_PREFIX', ''))
	->whenNotEmpty(fn (Stringable $prefix) => $prefix->finish('_'));
```

https://github.com/laravel/framework/pull/37080

## バリデーションにPasswordルールが追加
- v8.39.0
- src/Illuminate/Validation/Rules/Password.php

このように使えて

```php
		$request->validate([

			// Makes the password require at least one uppercase and one lowercase letter.
			'password' =>  ['required', 'confirmed', Password::min(8)->mixedCase()],

			 // Makes the password require at least one letter.
			'password' =>  ['required', 'confirmed', Password::min(8)->letters()],

			// Makes the password require at least one number.
			'password' =>  ['required', 'confirmed', Password::min(8)->numbers()],

			// Makes the password require at least one symbol.
			'password' =>  ['required', 'confirmed', Password::min(8)->symbols()],

			// Ensures the password has not been compromised in data leaks.
			'password' =>  ['required', 'confirmed', Password::min(8)->uncompromised()],
		]);
```

全部を組み合わせることも可能

```php
	public function store(Request $request)
	{
		$request->validate([
			'name' => 'required|string|max:255',
			'email' => 'required|string|email|max:255|unique:users',
			'password' => ['required', 'confirmed', Password::min(8)
					->mixedCase()
					->letters()
					->numbers()
					->symbols()
					->uncompromised(),
			],
		]);
```

https://github.com/laravel/framework/pull/36960

https://readouble.com/laravel/8.x/ja/validation.html#validating-passwords
