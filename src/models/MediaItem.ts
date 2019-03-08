import { t } from '@yarnaimo/rain'

export const MediaItem = t.type({
    id: t.string,
    productUrl: t.string,
    mediaMetadata: t.any,
})

export const MediaItemCreationRequest = t.array(
    t.type({
        simpleMediaItem: t.type({
            uploadToken: t.string,
        }),
    })
)

export const MediaItemCreationResponse = t.type({
    newMediaItemResults: t.array(
        t.type({
            uploadToken: t.string,
            status: t.type({
                code: t.union([t.number, t.undefined]),
                message: t.string,
            }),
            mediaItem: t.union([MediaItem, t.undefined]),
        })
    ),
})
