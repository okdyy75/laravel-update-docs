import { defineUserConfig } from 'vuepress'
import type { DefaultThemeOptions } from 'vuepress'

export default defineUserConfig<DefaultThemeOptions>({
    lang: 'ja-JP',
    title: 'Laravelアップデート情報',
    description: 'このサイトはLaravelのCHANGELOG.mdを参考に、追加機能・変更情報をまとめたサイトです',

    themeConfig: {
        logo: 'images/laravel-logo.png',
        sidebar: [
            {
                text: 'laravel8',
                link: '/laravel8',
                children: [
                    '/laravel8/v8.0-v8.9/README.md',
                    '/laravel8/v8.10-v8.19/README.md',
                    '/laravel8/v8.20-v8.29/README.md',
                    '/laravel8/v8.30-v8.39/README.md',
                    '/laravel8/v8.40-v8.49/README.md',
                ],
            }
        ],
    },
    markdown: {
        linkify: true
    }
})
