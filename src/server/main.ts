import { router } from 'microrouter'
import { albums } from './route.albums'
import { mediaItems } from './route.mediaItems'

export default router(albums, mediaItems)
