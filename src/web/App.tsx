// import '@material/top-app-bar/dist/mdc.top-app-bar.css'
// import '@material/react-material-icon/dist/material-icon.css'
// import '@material/react-top-app-bar/dist/top-app-bar.css'
// import '@material/button/dist/mdc.button.min.css'
/** @jsx jsx */
import { jsx } from '@emotion/core'
import Button from '@material/react-button'
import Drawer, {
    DrawerAppContent,
    DrawerContent,
    DrawerHeader,
    DrawerSubtitle,
    DrawerTitle,
} from '@material/react-drawer'
import List, { ListItem, ListItemText } from '@material/react-list'
import MaterialIcon from '@material/react-material-icon'
import { Snackbar } from '@material/react-snackbar'
import TopAppBar, { TopAppBarFixedAdjust } from '@material/react-top-app-bar'
import { Body1, Caption } from '@material/react-typography'
import { is } from '@yarnaimo/rain'
import React, { useEffect, useMemo, useState } from 'react'
import { getAuth, init } from './client'
import { AlbumSelectionDialog } from './components/AlbumSelectDialog'
import { RoundedCheckbox } from './components/RoundedCheckbox'
import { SelectableImageGrid } from './components/SelectableImageGrid'
import { block, section } from './css'
import { GlobalStateProvider, useGlobalState } from './state'
import { extractImageUrlsFromLocation } from './utils'

const DrawerContainer: React.FC = () => {
    const [user, setUser] = useGlobalState('user')

    async function login() {
        await getAuth().signIn()
    }

    async function logout() {
        await getAuth().signOut()
    }

    useEffect(() => {
        window.gapi.load('client:auth2', async () => {
            console.log('gapi client loaded')
            init(setUser)
        })
    }, [])

    const [urls, setUrls] = useState([] as string[])
    const [selection, setSelection] = useState([] as boolean[])

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

        setSnackbarState(true)
        user.client.post('mediaItems', { json: { albumId, urls: selectedUrls } })
    }

    const [drawerState, setDrawerState] = useState(false)
    const [dialogState, setDialogState] = useState(false)

    const [snackbarState, setSnackbarState] = useState(false)

    return (
        <div className="drawer-container">
            {snackbarState && (
                <Snackbar
                    open={snackbarState}
                    onClose={() => setSnackbarState(false)}
                    message="アップロードしています..."
                />
            )}

            <Drawer modal open={drawerState} onClose={() => setDrawerState(false)}>
                <DrawerHeader>
                    <DrawerTitle tag="h2">{user ? user.name : ''}</DrawerTitle>
                    <DrawerSubtitle>{user ? user.email : ''}</DrawerSubtitle>
                </DrawerHeader>

                <DrawerContent>
                    <List singleSelection selectedIndex={0}>
                        <ListItem
                            tag="a"
                            href="#"
                            tabIndex={0}
                            onClick={() => {
                                setDrawerState(false)
                                logout()
                            }}
                        >
                            {/* <ListItemGraphic graphic={<MaterialIcon icon="exit_to_app" />} /> */}
                            <ListItemText primaryText="ログアウト" />
                        </ListItem>
                    </List>
                </DrawerContent>
            </Drawer>

            <DrawerAppContent className="drawer-app-content">
                <TopAppBar
                    short
                    title="Photohook"
                    navigationIcon={
                        <MaterialIcon icon="menu" onClick={() => setDrawerState(true)} />
                    }
                    actionItems={[<MaterialIcon key="item" icon="add_photo_alternate" />]}
                />

                <TopAppBarFixedAdjust css={{ maxWidth: 900, margin: 'auto' }}>
                    <AlbumSelectionDialog
                        state={dialogState}
                        setState={setDialogState}
                        upload={upload}
                    />

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
                                    onClick={login}
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
                                onClick={() => {
                                    if (selectedUrls.length === urls.length) {
                                        setSelection(urls.map(() => false))
                                    } else {
                                        setSelection(urls.map(() => true))
                                    }
                                }}
                            />
                            <span>{`${selectedUrls.length} / ${urls.length} 枚`}</span>
                        </Body1>

                        <SelectableImageGrid
                            urls={urls}
                            selection={selection}
                            onChange={setSelection}
                        />
                    </section>

                    <section css={section}>
                        <Body1 css={{ textAlign: 'right' }}>
                            <Button
                                icon={<MaterialIcon icon="cloud_upload" />}
                                disabled={!selectedUrls.length || !user}
                                outlined
                                // unelevated
                                onClick={() => setDialogState(true)}
                            >
                                Google フォトにアップロード
                            </Button>
                        </Body1>
                    </section>
                </TopAppBarFixedAdjust>
            </DrawerAppContent>
        </div>
    )
}

export const App: React.FC = () => (
    <GlobalStateProvider>
        <DrawerContainer />
    </GlobalStateProvider>
)
