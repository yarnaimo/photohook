/** @jsx jsx */
import { jsx } from '@emotion/core'
import Dialog, {
    DialogButton,
    DialogContent,
    DialogFooter,
    DialogTitle,
} from '@material/react-dialog'
import List, { ListItem, ListItemGraphic, ListItemText } from '@material/react-list'
import MaterialIcon from '@material/react-material-icon'
import Radio, { NativeRadioControl } from '@material/react-radio'
import TextField, { Input } from '@material/react-text-field'
import { t } from '@yarnaimo/rain'
import React, { useEffect, useMemo, useState } from 'react'
import { getAlbums } from '../../server/api/get-albums'
import { postAlbum } from '../../server/api/post-album'
import { useGlobalState } from '../state'

interface Props {
    state: boolean
    setState: (state: boolean) => void
    upload: (albumId?: string) => void
}

interface Album {
    id: string
    title: string
}

export const AlbumSelectionDialog: React.FC<Props> = props => {
    const [user, setUser] = useGlobalState('user')
    const [albums, setAlbums] = useState([] as Album[])

    const items = useMemo(() => {
        return [
            { icon: 'photo_library', id: undefined, title: 'フォト' },

            ...albums.map((album: Album) => ({
                icon: 'photo_album',
                id: album.id,
                title: album.title,
            })),
        ]
    }, [albums])

    useEffect(() => {
        if (!user) {
            return
        }
        user.client
            .get('get-albums')
            .json()
            .then(res => {
                setAlbums(res as t.TypeOf<typeof getAlbums.resType>)
            })
    }, [user])

    const [selectedId, setSelectedId] = useState<string | undefined>(undefined)

    const [titleInput, setTitleInput] = useState('')
    const [titleInputState, setTitleInputState] = useState(false)
    let titleInputRef: Input<any>

    useEffect(() => {
        if (titleInputState && titleInputRef && titleInputRef.inputElement) {
            titleInputRef.inputElement.focus()
        }
    }, [titleInputState])

    const createAlbum = () => {
        if (!user || !titleInput.trim().length) {
            return
        }
        setTitleInputState(false)
        // setSnackbarState(true)

        user.client
            .post('post-album', { json: { title: titleInput } })
            .json()
            .then(res => {
                const newAlbum = res as t.TypeOf<typeof postAlbum.resType>
                setAlbums([...albums, newAlbum])
            })
    }

    const [snackbarState, setSnackbarState] = useState(false)

    return (
        <React.Fragment>
            {/* <Snackbar
                open={snackbarState}
                onClose={() => setSnackbarState(false)}
                message="アルバムを作成しています..."
            /> */}

            <Dialog open={props.state} onClose={() => props.setState(false)}>
                <DialogTitle>保存先を選択</DialogTitle>
                <DialogContent>
                    <p>
                        Google フォトの仕様上、Photohook 以外で作成されたアルバムには追加できません
                    </p>

                    <List>
                        {...items.map(({ icon, id, title }) => (
                            <ListItem tabIndex={0} key={id || 0} onClick={() => setSelectedId(id)}>
                                <ListItemGraphic graphic={<MaterialIcon icon={icon} />} />
                                {/* <label htmlFor={cleanChoice}> */}
                                <ListItemText primaryText={title} />
                                {/* </label> */}

                                <span className="mdc-list-item__meta">
                                    <Radio>
                                        <NativeRadioControl
                                            name="ringtone"
                                            value={title}
                                            // id={cleanChoice}[]
                                            checked={selectedId === id}
                                            onChange={() => setSelectedId(id)}
                                        />
                                    </Radio>
                                </span>
                            </ListItem>
                        ))}

                        <ListItem
                            css={titleInputState && { display: 'none' }}
                            tabIndex={0}
                            onClick={() => setTitleInputState(true)}
                        >
                            <ListItemGraphic
                                graphic={<MaterialIcon icon={'add_circle_outline'} />}
                            />
                            <ListItemText primaryText={'新しいアルバムを作成'} />
                        </ListItem>

                        <ListItem css={titleInputState || { display: 'none' }}>
                            <TextField
                                label="タイトルを入力"
                                fullWidth
                                trailingIcon={<MaterialIcon icon="done" />}
                                onTrailingIconSelect={createAlbum}
                            >
                                <Input
                                    tabIndex={0}
                                    placeholder="タイトルを入力"
                                    value={titleInput}
                                    ref={((ref: any) => (titleInputRef = ref)) as any}
                                    onChange={e =>
                                        setTitleInput(e.currentTarget.value)
                                    }
                                    onKeyDown={e => {
                                        e.stopPropagation()
                                        if (e.key === 'Enter') {
                                            createAlbum()
                                        }
                                    }}
                                />
                            </TextField>
                        </ListItem>
                    </List>
                </DialogContent>
                <DialogFooter>
                    <DialogButton action="dismiss">キャンセル</DialogButton>
                    <DialogButton
                        action="accept"
                        isDefault
                        onClick={() => props.upload(selectedId)}
                    >
                        アップロード
                    </DialogButton>
                </DialogFooter>
            </Dialog>
        </React.Fragment>
    )
}
