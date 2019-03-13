import { bufferFromUrlOrDataUrl, is, isnot, t } from '@yarnaimo/rain'
import pLimit from 'p-limit'
import { Album } from '../../src/models/Album'
import { setDateTagIfNotExists } from './utils/exif'
import { toChunks } from './utils/main'
import { photos } from './utils/photos'
import { typed } from './utils/TypedHandler'

export const postMediaItems = typed(
    'post',
    t.type({
        albumId: t.union([Album.props.id, t.undefined]),
        urls: t.array(t.string),
        dateTag: t.union([t.string, t.undefined]),
    }),
    t.type({
        creationCount: t.number,
    }),
    async (req, res, headers, v) => {
        const createNewMediaItem = async (url: string) => {
            const dataToUpload = await bufferFromUrlOrDataUrl(url)

            if (is.error(dataToUpload)) {
                console.error(dataToUpload)
                return
            }

            let bufferToUpload: Buffer | null = setDateTagIfNotExists(
                dataToUpload.buffer,
                v.dateTag
            )
            delete dataToUpload.buffer

            const uploadedItem = await photos.uploadItem(
                headers,
                bufferToUpload,
                url,
                dataToUpload.mimetype
            )
            bufferToUpload = null

            if (is.error(uploadedItem)) {
                console.error(uploadedItem)
                return
            }

            return {
                description: url,
                simpleMediaItem: {
                    uploadToken: uploadedItem.body,
                },
            }
        }

        const limit = pLimit(8)
        const tasks = v.urls
            .map(url => url.trim())
            .map(url => {
                const m1 = url.match(/^https:\/\/pbs.twimg.com\/media\/[\w-]+\.[a-z]+/m)
                if (m1) {
                    return m1[0] + ':orig'
                }

                const m2 = url.match(/^https:\/\/pbs.twimg.com\/media\/[\w-]+\?format=\w+/m)
                if (m2) {
                    return m2[0] + '&name=orig'
                }

                return url
            })
            .map(url => limit(() => createNewMediaItem(url)))

        const newMediaItems = (await Promise.all(tasks)).filter(isnot.nullish)

        let creationCount = 0

        for (const chunk of toChunks(newMediaItems, 50)) {
            const creationResponse = await photos.createMediaItems(headers, chunk, v.albumId)

            if (is.error(creationResponse) || creationResponse.isLeft()) {
                continue
            }

            creationCount =
                creationCount +
                creationResponse.value.newMediaItemResults.filter(result => result.mediaItem).length
        }

        return { creationCount }
    }
)

export const CMediaItemsResponse = t.type({
    creationCount: t.number,
})

export default postMediaItems
