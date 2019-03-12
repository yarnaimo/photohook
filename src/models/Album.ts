import { t } from '@yarnaimo/rain'

export const Album = t.type({
    id: t.string,
    title: t.string,
    productUrl: t.union([t.string, t.undefined]),
    coverPhotoBaseUrl: t.union([t.string, t.undefined]),
})

export const AlbumList = t.type({
    albums: t.union([t.array(Album), t.undefined]),
    nextPageToken: t.union([t.string, t.undefined]),
})

export const AlbumCreationResponse = t.type({
    id: t.string,
    title: t.string,
})
