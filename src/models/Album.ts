import { t } from '@yarnaimo/rain'

export const Album = t.type({
    id: t.string,
    title: t.string,
    productUrl: t.string,
    coverPhotoBaseUrl: t.string,
})

export const AlbumList = t.type({
    albums: t.array(Album),
    nextPageToken: t.union([t.string, t.undefined]),
})

export const AlbumCreationResponse = t.type({
    id: t.string,
    title: t.string,
})
