import { createGlobalState } from 'react-hooks-global-state'
import { User } from './client'

const initialState = { user: false } as {
    user: User | null | false
}

export const { GlobalStateProvider, useGlobalState } = createGlobalState(initialState)
