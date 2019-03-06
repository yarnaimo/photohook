import { is, t } from '@yarnaimo/rain'
import { PathReporter } from 'io-ts/lib/PathReporter'
import { send } from 'micro'
import { get, post } from 'microrouter'
import { AlbumCreationResponse, AlbumList } from '../models/Album'
import { photos } from './photos'
import { typed } from './TypedHandler'

export const postAlbum = typed(
    post,
    '/albums',
    t.type({
        title: t.string,
    }),
    AlbumCreationResponse,
    async (req, res, headers, received) => {
        const v = await photos.createAlbum(headers, received.title)

        if (is.error(v)) {
            return send(res, 500, 'アルバムの作成に失敗しました')
        }
        if (v.isLeft()) {
            return send(res, 500, PathReporter.report(v))
        }

        return v.value
    }
)

export const getAlbums = typed(
    get,
    '/albums',
    null,
    AlbumList.props.albums,
    async (req, res, headers) => {
        const v = await photos.getAlbums(headers)

        if (is.error(v)) {
            return send(res, 500, 'アルバムの取得に失敗しました')
        }
        if (v.isLeft()) {
            return send(res, 500, PathReporter.report(v))
        }
        return v.value.albums
    }
)

export const albums = [getAlbums, postAlbum]
