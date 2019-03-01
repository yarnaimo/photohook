import { auth, initializeApp } from 'firebase/app'
import 'firebase/auth'
import 'firebase/functions'

const config = {
    apiKey: 'AIzaSyCNBx99CdVO7mGk5PZx7D9qQ395degSj4o',
    authDomain: 'photohook-app.firebaseapp.com',
    databaseURL: 'https://photohook-app.firebaseio.com',
    projectId: 'photohook-app',
    storageBucket: 'photohook-app.appspot.com',
    messagingSenderId: '1071330928604',
}
initializeApp(config)

export const authProvider = new auth.GoogleAuthProvider()
authProvider.addScope('https://www.googleapis.com/auth/photoslibrary')
