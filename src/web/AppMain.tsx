/** @jsx jsx */
import { jsx } from '@emotion/core'
import Button from '@material/react-button'
import Checkbox from '@material/react-checkbox'
import MaterialIcon from '@material/react-material-icon'
import { Snackbar } from '@material/react-snackbar'
import TextField, { Input } from '@material/react-text-field'
import { TopAppBarFixedAdjust } from '@material/react-top-app-bar'
import { Body1, Caption } from '@material/react-typography'
import { is, t } from '@yarnaimo/rain'
import { DateTime } from 'luxon'
import React, { useEffect, useMemo, useState } from 'react'
import { postMediaItem } from '../server/route.mediaItems'
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
            .post('mediaItems', { json: { albumId, urls: selectedUrls, dateTag } })
            .json()) as t.TypeOf<typeof postMediaItem.resType>

        setSnackbarMessages([...snackbarMessages, `${res.creationCount} 枚アップロードしました`])
    }

    const [dialogState, setDialogState] = useState(false)

    const [snackbarMessages, setSnackbarMessages] = useState([] as string[])

    return (
        <TopAppBarFixedAdjust css={{ maxWidth: 900, margin: 'auto' }}>
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
        </TopAppBarFixedAdjust>
    )
}
