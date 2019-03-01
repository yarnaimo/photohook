import { is } from '@yarnaimo/rain'
import { PathReporter } from 'io-ts/lib/PathReporter'
import { send } from 'micro'
import { get, router } from 'microrouter'
import { AlbumList } from '../models/Album'
import { photosClient } from './photos-client'
import { authHeaders } from './utils.http'

export const albums = router(
    get('/albums', async (req, res) => {
        const headers = authHeaders(req)

        if (is.error(headers)) {
            return send(res, 401, '認証に失敗しました')
        }

        const v = await photosClient
            .get('albums', { headers, query: { pageSize: 50 }, json: true })
            .then(res => AlbumList.decode(res.body))

        if (v.isLeft()) {
            return send(res, 500, PathReporter.report(v))
        }

        send(res, 200, v.value.albums)
    })
)
