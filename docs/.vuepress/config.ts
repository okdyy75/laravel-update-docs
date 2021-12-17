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
                text: 'Laravelアップデート情報',
                link: '/'
            },
        ]
    },
    markdown: {
        linkify: true
    }
})
