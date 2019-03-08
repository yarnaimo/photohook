import { asError, got, t } from '@yarnaimo/rain'
import { DateTime } from 'luxon'
import { extension } from 'mime-types'
import { AlbumCreationResponse, AlbumList } from '../models/Album'
import { MediaItemCreationRequest, MediaItemCreationResponse } from '../models/MediaItem'
import { filenamifyUrl } from './utils'
import { AuthHeaders } from './utils.http'

const baseUrl = 'https://photoslibrary.googleapis.com/v1'
const photosClient = got.extend({
    baseUrl,
})

async function getAlbums({ authorization }: AuthHeaders) {
    return photosClient
        .get('albums', {
            headers: { authorization },
            query: { pageSize: 50 },
            json: true,
        })
        .then(res => AlbumList.decode(res.body))
        .catch(asError)
}

async function createAlbum({ authorization }: AuthHeaders, title: string) {
    return photosClient
        .post('albums', {
            headers: { authorization },
            json: true,
            body: {
                album: { title },
            },
        })
        .then(res => AlbumCreationResponse.decode(res.body))
        .catch(asError)
}

async function uploadItem(
    { authorization }: AuthHeaders,
    buffer: Buffer,
    url: string,
    mimetype?: string
) {
    const date = DateTime.local().toFormat('yyyyMMdd')
    const namifiedUrl = filenamifyUrl(url)
    const suffix = mimetype ? `.${extension(mimetype)}` : ''

    return photosClient
        .post('uploads', {
            body: buffer,
            headers: {
                authorization,
                'content-type': 'application/octet-stream',
                'X-Goog-Upload-Protocol': 'raw',
                'X-Goog-Upload-File-Name': `${date}-${namifiedUrl}${suffix}`,
            },
        })
        .catch(asError)
}

async function createMediaItems(
    { authorization }: AuthHeaders,
    newMediaItems: t.TypeOf<typeof MediaItemCreationRequest>,
    albumId: string | undefined
) {
    return photosClient
        .post(baseUrl + '/mediaItems:batchCreate', {
            headers: { authorization },
            json: true,
            body: {
                albumId,
                newMediaItems,
            },
        })
        .then(res => MediaItemCreationResponse.decode(res.body))
        .catch(asError)
}

export const photos = { getAlbums, createAlbum, uploadItem, createMediaItems }
