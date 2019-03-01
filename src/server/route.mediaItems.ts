import { asError, bufferFromUrlOrDataUrl, is, isnot, t } from '@yarnaimo/rain'
import { json, send } from 'micro'
import { post, router } from 'microrouter'
import pLimit from 'p-limit'
import { Album } from '../models/Album'
import { photosClient } from './photos-client'
import { setDateTagIfNotExists } from './utils.exif'
import { authHeaders } from './utils.http'

export const mediaItems = router(
    post('/mediaItems', async (req, res) => {
        const headers = authHeaders(req)

        if (is.error(headers)) {
            return send(res, 401, '認証に失敗しました')
        }

        const Request = t.type({
            albumId: Album.props.id,
            urls: t.array(t.string),
            dateTag: t.string,
        })

        const v = await json(req).then(res => Request.decode(res))

        if (v.isLeft()) {
            return send(res, 400, 'リクエストの形式が無効です')
        }

        const limit = pLimit(8)

        const newMediaItemFn = (url: string) => async () => {
            const dataToUpload = await bufferFromUrlOrDataUrl(url)

            if (is.error(dataToUpload)) {
                return
            }

            const bufferToUpload = setDateTagIfNotExists(dataToUpload.buffer, v.value.dateTag)

            const uploaded = await photosClient
                .post('uploads', {
                    body: bufferToUpload,
                    headers: {
                        ...headers,
                        'content-type': 'application/octet-stream',
                        'X-Goog-Upload-Protocol': 'raw',
                    },
                })
                .catch(asError)

            if (is.error(uploaded)) {
                return
            }

            return {
                description: url,
                simpleMediaItem: {
                    uploadToken: uploaded.body,
                },
            }
        }

        const newMediaItems = (await Promise.all(
            v.value.urls.map(url => limit(newMediaItemFn(url)))
        )).filter(isnot.nullish)

        for (const i of [...Array(Math.ceil(newMediaItems.length / 50)).keys()]) {
            const { albums } = await photosClient
                .post('mediaItems:batchCreate', {
                    headers,
                    json: true,
                    body: {
                        albumId: v.value.albumId,
                        newMediaItems,
                    },
                })
                .then(res => res.body)
        }

        send(res, 200, 'albums')
    })
)
