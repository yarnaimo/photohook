/** @jsx jsx */
import { jsx } from '@emotion/core'
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
import React, { useEffect, useState } from 'react'
import { Main } from './AppMain'
import { getAuth, init } from './client'
import { GlobalStateProvider, useGlobalState } from './state'

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

    const [drawerState, setDrawerState] = useState(false)

    return (
        <div className="drawer-container">
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
                    <Main login={login} />
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
