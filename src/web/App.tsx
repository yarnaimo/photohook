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
import TopAppBar, { TopAppBarFixedAdjust } from '@material/react-top-app-bar'
import { Body1, Caption } from '@material/react-typography'
import { auth } from 'firebase/app'
import React, { useEffect, useState } from 'react'
import { ulid } from 'ulid'
import { RoundedCheckbox } from './components/RoundedCheckbox'
import { SelectableImageGrid } from './components/SelectableImageGrid'
import { block, section } from './css'
import { authProvider } from './firebase'
import { extractImageUrlsFromLocation } from './utils'

async function download(urls: string[]) {
    console.log(urls)

    for (const url of urls) {
        const blob = await fetch(url, { mode: 'no-cors' }).then(res => res.blob())
        const objectURL = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = objectURL
        a.download = ulid()
        a.dispatchEvent(new MouseEvent('click'))
    }

    // let delay = 0

    // urls.forEach(url => {
    //     const a = document.createElement('a')
    //     a.href = url
    //     a.download = ulid()
    //     setTimeout(() => a.dispatchEvent(new MouseEvent('click')), 100 * ++delay)
    // })
}

export const App: React.FC = () => {
    const [token, setToken] = useState<string>()
    const [user, setUser] = useState<firebase.User>()

    async function login() {
        const result = await auth().signInWithPopup(authProvider)

        if (!result.credential) {
            return
        }

        if (result.user) {
            setUser(result.user)
        }
        const _token = (result.credential as any).accessToken as string
        setToken(_token)
    }

    async function logout() {
        await auth().signOut()
        setUser(undefined)
        setToken(undefined)
    }

    const [{ urls, selection }, setImageList] = useState({
        urls: [] as string[],
        selection: [] as number[],
    })
    const setSelection = (newSelection: number[]) => setImageList({ urls, selection: newSelection })
    const selectedUrls = () => urls.filter((_, i) => selection.includes(i))

    useEffect(() => {
        const urls = extractImageUrlsFromLocation(location)
        setImageList({ urls, selection: urls.map((_, i) => i) })
    }, [])

    const [drawerState, setDrawerState] = useState(false)

    return (
        <div className="drawer-container">
            <Drawer modal open={drawerState} onClose={() => setDrawerState(false)}>
                <DrawerHeader>
                    <DrawerTitle tag="h2">{user ? user.displayName : ''}</DrawerTitle>
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
                    {!token && (
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
                                checked={selection.length === urls.length}
                                onClick={() => {
                                    if (selection.length === urls.length) {
                                        setSelection([])
                                    } else {
                                        setSelection(urls.map((_, i) => i))
                                    }
                                }}
                            />
                            <span>{`${selection.length} / ${urls.length} 枚`}</span>
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
                                disabled={!selection.length || !token}
                                outlined
                                // unelevated
                                onClick={() => download(selectedUrls())}
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
