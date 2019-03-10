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
import { RoundedCheckbox } from './components/RoundedCheckbox'
import { SelectableImageGrid } from './components/SelectableImageGrid'
import { block, section } from './css'
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
            .json()) as t.TypeOf<typeof postMediaItems.resType>

        setSnackbarMessages([...snackbarMessages, `${res.creationCount} 枚アップロードしました`])
    }

    const [dialogState, setDialogState] = useState(false)

    const [snackbarMessages, setSnackbarMessages] = useState([] as string[])

    const codeRef = React.createRef<HTMLElement>()
    const code = ''
    function copy() {
        console.log(codeRef.current)

        if (!codeRef.current) {
            return
        }

        const range = document.createRange()
        range.selectNodeContents(codeRef.current)

        const selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)

        document.execCommand('copy')

        selection.removeAllRanges()
    }

    if (!urls.length) {
        return (
            <React.Fragment>
                <section css={section}>
                    <p>
                        Photohook は Web ページに含まれる画像をブックマークレット経由で{' '}
                        <b>Google フォトに一括アップロード</b>するツールです。
                    </p>
                </section>
                <section css={section}>
                    <h3>⭐️ ブックマークレットの登録方法</h3>
                    <ol>
                        <li>
                            下のボタンで<b>コードをコピー</b>する
                            <code ref={codeRef} css={{ overflow: 'auto' }}>
                                javascript:{code}
                            </code>
                            <Button css={block} dense unelevated onClick={copy}>
                                コピー
                            </Button>
                        </li>
                        <li>
                            このページを<b>ブックマークに登録</b>する
                        </li>
                        <li>
                            登録したブックマークの編集画面を開き、その{' '}
                            <b>URL を 1. でコピーしたコードに置き換えて保存</b>する
                        </li>
                    </ol>
                </section>
                <section css={section}>
                    <h3>ℹ️ 使い方</h3>
                    <ol>
                        <li>保存したい画像がある Web ページを開く</li>
                        <li>
                            登録したブックマークレットを起動する
                            <ul>
                                <li>
                                    Chrome など
                                    <br />
                                    登録した<b>ブックマークレットの名前</b>{' '}
                                    <small>(変更していない場合は "photohook")</small>{' '}
                                    <b>の一部をアドレスバーに入力</b>
                                    し、表示された候補の中から選択する
                                </li>
                                <li>
                                    Safari など
                                    <br />
                                    <b>ブックマークの一覧</b>から選択する
                                </li>
                            </ul>
                        </li>
                        <li>
                            Photohook のページに移動するので<b>画像を選択してアップロード</b>する
                            <br />
                            <small>(初回は Google アカウントへのログインが必要です)</small>
                        </li>
                    </ol>
                </section>
            </React.Fragment>
        )
    }

    return (
        <React.Fragment>
            {snackbarMessages.map(text => (
                <Snackbar
                    key={text}
                    // open={uploadingSnackbar}
                    onClose={() => setSnackbarMessages(snackbarMessages.filter(m => m !== text))}
                    message={text}
                />
            ))}

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
