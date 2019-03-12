/** @jsx jsx */
import { jsx } from '@emotion/core'
import Button from '@material/react-button'
import Checkbox from '@material/react-checkbox'
import MaterialIcon from '@material/react-material-icon'
import { Snackbar } from '@material/react-snackbar'
import TextField, { Input } from '@material/react-text-field'
import { Body1, Caption } from '@material/react-typography'
import { is, t } from '@yarnaimo/rain'
import { DateTime } from 'luxon'
import React, { useEffect, useMemo, useState } from 'react'
import { postMediaItems } from '../server/api/post-mediaItems'
import { AlbumSelectionDialog } from './components/AlbumSelectDialog'
import { LI, OL, UL } from './components/List'
import { RoundedCheckbox } from './components/RoundedCheckbox'
import { SelectableImageGrid } from './components/SelectableImageGrid'
import { block, section } from './css'
import ky from './ky'
import { useGlobalState } from './state'
import { extractImageUrlsFromLocation } from './utils'

export const Main: React.FC<{ login: () => Promise<void> }> = props => {
    const [user, setUser] = useGlobalState('user')

    const [urls, setUrls] = useState([] as string[])
    const [selection, setSelection] = useState([] as boolean[])

    const [shouldAddDateTag, setShouldAddDateTag] = useState()
    const [dateTagStr, setDateTagStr] = useState(DateTime.local().toISODate())
    const dateTag = useMemo(
        () =>
            shouldAddDateTag && dateTagStr
                ? DateTime.fromISO(dateTagStr).toFormat('yyyy:MM:dd 00:00:00')
                : undefined,
        [dateTagStr, shouldAddDateTag]
    )

    useEffect(() => {
        setSelection(urls.map((_, i) => (is.boolean(selection[i]) ? selection[i] : true)))
    }, [urls])

    useEffect(() => {
        const urls = extractImageUrlsFromLocation(location)
        setUrls(urls)
    }, [])

    const selectedUrls = useMemo(() => urls.filter((_, i) => selection[i]), [urls, selection])

    async function upload(albumId?: string) {
        if (!user) {
            return
        }

        setSnackbarMessages([...snackbarMessages, 'アップロードしています...'])
        const res = (await user.client
            .post('post-mediaItems', { json: { albumId, urls: selectedUrls, dateTag } })
            .json()
            .catch(() => {
                setSnackbarMessages([...snackbarMessages, `アップロードに失敗しました`])
            })) as t.TypeOf<typeof postMediaItems.resType>

        setSnackbarMessages([...snackbarMessages, `✔ ${res.creationCount} 枚アップロードしました`])
    }

    const [dialogState, setDialogState] = useState(false)

    const [snackbarMessages, setSnackbarMessages] = useState([] as string[])

    const codeRef = React.createRef<HTMLElement>()
    const [code, setCode] = useState('')
    useEffect(() => {
        const codeUrl =
            'https://gist.githubusercontent.com/yarnaimo/151e59ef7452cfdc8706b5ffb018cb06/raw/photohook-bookmarklet.js'
        ky.get(codeUrl, { mode: 'cors' })
            .text()
            .then(str => setCode(str.replace(/\s*\n\s*/g, ' ')))
    }, [])

    function copy() {
        if (!codeRef.current) {
            return
        }

        setSnackbarMessages([...snackbarMessages, '✔ コピーしました'])

        const range = document.createRange()
        range.selectNodeContents(codeRef.current)

        const selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)

        document.execCommand('copy')

        selection.removeAllRanges()
    }

    const snackbar = snackbarMessages.map(text => (
        <Snackbar
            key={text}
            // open={uploadingSnackbar}
            onClose={() => setSnackbarMessages(snackbarMessages.filter(m => m !== text))}
            message={text}
        />
    ))

    if (!urls.length) {
        return (
            <React.Fragment>
                {snackbar}
                <section css={section}>
                    <p>
                        Photohook は Web ページに含まれる画像をブックマークレット経由で{' '}
                        <b>Google フォトに一括アップロード</b>するツールです。
                    </p>
                </section>

                <section css={section}>
                    <h3>⭐️ ブックマークレットの登録方法</h3>
                    <OL>
                        <LI>
                            下のボタンで<b>コードをコピー</b>する
                            <pre>
                                <code ref={codeRef} css={{ overflow: 'auto' }}>
                                    {code}
                                </code>
                            </pre>
                            <Button css={block} dense unelevated onClick={copy}>
                                コピー
                            </Button>
                        </LI>
                        <LI>
                            このページを<b>ブックマークに登録</b>する
                        </LI>
                        <LI>
                            登録したブックマークの編集画面を開き、その{' '}
                            <b>URL を 1. でコピーしたコードに置き換えて保存</b>する
                            <br />
                            <small>(名前は必要に応じて変更してください)</small>
                        </LI>
                    </OL>
                </section>

                <section css={section}>
                    <h3>ℹ️ 使い方</h3>
                    <OL>
                        <LI>保存したい画像がある Web ページを開く</LI>
                        <LI>
                            ブックマークレットを起動する
                            <UL>
                                <LI>
                                    Safari など
                                    <br />
                                    <b>ブックマークの一覧から Photohook を選択</b>する
                                </LI>
                                <LI>
                                    Chrome など
                                    <br />
                                    登録した
                                    <b>ブックマークレットの名前の一部をアドレスバーに入力</b>
                                    し、表示された候補の中から選択する
                                </LI>
                            </UL>
                        </LI>
                        <LI>
                            Photohook が新しいタブで開かれるので<b>画像を選択してアップロード</b>
                            する
                            <br />
                            <small>(初回は Google アカウントへのログインが必要です)</small>
                        </LI>
                    </OL>
                </section>

                <section css={section}>
                    <h3>プライバシーポリシー</h3>
                    <p>
                        Photohook ではアクセス状況を把握するため <b>Google Analytics</b>{' '}
                        を使用しています。データは匿名で収集されており、個人を特定するものではありません。詳しくは
                        <a target="_blank" href="https://www.google.com/analytics/terms/jp.html">
                            こちら
                        </a>
                        をご覧ください。
                    </p>
                </section>

                <section css={section}>
                    <h3>詳細情報</h3>
                    <p>Photohook は Now 2.0 (ZEIT) で稼働しています。</p>
                    <UL>
                        <LI>
                            <a href="https://github.com/yarnaimo/photohook">
                                GitHub - yarnaimo/photohook
                            </a>
                        </LI>
                        <LI>
                            <a href="https://gist.github.com/yarnaimo/151e59ef7452cfdc8706b5ffb018cb06">
                                Gist - ブックマークレット
                            </a>
                        </LI>
                    </UL>
                </section>
            </React.Fragment>
        )
    }

    return (
        <React.Fragment>
            {snackbar}

            <AlbumSelectionDialog state={dialogState} setState={setDialogState} upload={upload} />

            {user === null && (
                <section css={section}>
                    <Body1>
                        <Button
                            icon={<MaterialIcon icon="exit_to_app" />}
                            css={[
                                {
                                    background: 'var(--md-blue-500)!important',
                                },
                            ]}
                            // outlined
                            unelevated
                            onClick={props.login}
                        >
                            Google アカウントにログイン
                        </Button>
                        <Caption css={[block, { marginTop: 4 }]}>
                            Google フォトへのアップロードにはログインが必要です
                        </Caption>
                    </Body1>
                </section>
            )}

            <section css={section}>
                <Body1 css={{ display: 'flex', alignItems: 'center' }}>
                    <RoundedCheckbox
                        checked={selectedUrls.length === urls.length}
                        onClick={() =>
                            setSelection(urls.map(() => selectedUrls.length !== urls.length))
                        }
                    />
                    <span>{`${selectedUrls.length} / ${urls.length} 枚`}</span>
                </Body1>

                <SelectableImageGrid urls={urls} selection={selection} onChange={setSelection} />
            </section>

            <section css={section}>
                <div
                    css={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                    }}
                >
                    <Checkbox
                        css={{ textAlign: 'right' }}
                        nativeControlId="should-add-datetag"
                        checked={shouldAddDateTag}
                        onChange={e => setShouldAddDateTag(e.target.checked)}
                    />
                    <label htmlFor="should-add-datetag">撮影日のデータがない場合は追加する</label>
                </div>

                <div
                    css={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                    }}
                >
                    <TextField
                        css={{ textAlign: 'right' }}
                        label={undefined}
                        leadingIcon={<MaterialIcon icon="event" />}
                    >
                        <Input
                            css={{ paddingTop: 16, paddingBottom: 16 }}
                            disabled={!shouldAddDateTag}
                            tabIndex={0}
                            type="date"
                            value={dateTagStr}
                            onChange={e =>
                                setDateTagStr(
                                    e.currentTarget.validity.valid ? e.currentTarget.value : ''
                                )
                            }
                        />
                    </TextField>
                </div>
            </section>

            <section css={section}>
                <Body1 css={{ textAlign: 'right' }}>
                    <Button
                        icon={<MaterialIcon icon="cloud_upload" />}
                        disabled={!selectedUrls.length || !user || (shouldAddDateTag && !dateTag)}
                        outlined
                        // unelevated
                        onClick={() => setDialogState(true)}
                    >
                        Google フォトにアップロード
                    </Button>
                </Body1>
            </section>
        </React.Fragment>
    )
}
