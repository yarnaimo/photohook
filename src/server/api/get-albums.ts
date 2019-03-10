import { is } from '@yarnaimo/rain'
import { PathReporter } from 'io-ts/lib/PathReporter'
import { send } from 'micro'
import { AlbumList } from '../../models/Album'
import { photos } from '../photos'
import { typed } from '../TypedHandler'

export const getAlbums = typed('get', null, AlbumList.props.albums, async (req, res, headers) => {
    const v = await photos.getAlbums(headers)

    if (is.error(v)) {
        return send(res, 500, 'アルバムの取得に失敗しました')
    }
    if (v.isLeft()) {
        return send(res, 500, PathReporter.report(v))
    }
    return v.value.albums
})

export default getAlbums
