import ky, { Ky } from './ky'
import { isDev, prefixUrl } from './utils'

export const getAuth = () => window.gapi.auth2.getAuthInstance()

export interface AuthResponse {
    [key: string]: any
    access_token: string
    id_token: string
    scope: string
    expires_in: number
    first_issued_at: number
    expires_at: number
}

export interface BasicProfile {
    [key: string]: any
    getId(): string
    getName(): string
    getGivenName(): string
    getFamilyName(): string
    getImageUrl(): string
    getEmail(): string
}

export interface GoogleUser {
    getAuthResponse(includeAuthorizationData: boolean): AuthResponse | undefined
    getBasicProfile(): BasicProfile | undefined
}

export interface User {
    client: Ky
    accessToken: string
    name: string
    imageUrl: string
    email: string
}

export async function init(setUser: (user: User | null) => void) {
    await window.gapi.client.init({
        apiKey: process.env.GOOGLE_API_KEY,
        clientId: process.env.GOOGLE_CLIENT_ID,
        // discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/some-api'],
        scope:
            'https://www.googleapis.com/auth/photoslibrary.appendonly https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata',
    })

    function setGoogleUser(googleUser: GoogleUser) {
        if (!googleUser) {
            return setUser(null)
        }

        const profile = googleUser.getBasicProfile()
        const authResponse = googleUser.getAuthResponse(true)
        if (!profile || !authResponse) {
            return setUser(null)
        }

        setUser({
            client: ky.extend({
                prefixUrl,
                headers: { authorization: `Bearer ${authResponse.access_token}` },
                mode: isDev ? 'cors' : undefined,
            }),
            accessToken: authResponse.access_token,
            name: profile.getName(),
            imageUrl: profile.getImageUrl(),
            email: profile.getEmail(),
        })
    }

    getAuth().currentUser.listen(setGoogleUser)
    setGoogleUser(getAuth().currentUser.get())
}
