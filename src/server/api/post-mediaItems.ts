import { bufferFromUrlOrDataUrl, is, isnot, t } from '@yarnaimo/rain'
import pLimit from 'p-limit'
import { Album } from '../../models/Album'
import { toChunks } from '../../utils'
import { photos } from '../photos'
import { typed } from '../TypedHandler'
import { setDateTagIfNotExists } from '../utils.exif'

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
                return
            }

            const bufferToUpload = setDateTagIfNotExists(dataToUpload.buffer, v.dateTag)

            const uploadedItem = await photos.uploadItem(
                headers,
                bufferToUpload,
                url,
                dataToUpload.mimetype
            )

            if (is.error(uploadedItem)) {
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
        const tasks = v.urls.map(url => limit(() => createNewMediaItem(url)))

        const newMediaItems = (await Promise.all(tasks)).filter(isnot.nullish)

        let creationCount = 0

        for (const chunk of toChunks(newMediaItems, 50)) {
            const creationResponse = await photos.createMediaItems(headers, chunk, v.albumId)

            if (is.error(creationResponse) || creationResponse.isLeft()) {
                continue
            }

            creationResponse.value.newMediaItemResults.forEach(result => {
                if (!result.mediaItem) {
                    return
                }

                creationCount++
            })
        }

        return { creationCount }
    }
)

export const CMediaItemsResponse = t.type({
    creationCount: t.number,
})

export default postMediaItems
