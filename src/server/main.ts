import microCors from 'micro-cors'
import { router, withNamespace } from 'microrouter'
import { albums } from './route.albums'
import { mediaItems } from './route.mediaItems'

const cors = microCors({ origin: 'http://localhost:1234' })

const api = withNamespace('/api')
const routes = router(api(...albums, ...mediaItems))
export default cors(routes)
