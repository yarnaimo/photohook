import { t } from '@yarnaimo/rain'

export const Album = t.type({
    id: t.string,
    title: t.string,
    productUrl: t.string,
    isWriteable: t.boolean,
    shareInfo: t.any,
    mediaItemsCount: t.string,
    coverPhotoBaseUrl: t.string,
    coverPhotoMediaItemId: t.string,
})

export const AlbumList = t.type({
    albums: t.array(Album),
    nextPageToken: t.string,
})
