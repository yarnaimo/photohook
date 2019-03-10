import { is, t } from '@yarnaimo/rain'
import { PathReporter } from 'io-ts/lib/PathReporter'
import { send } from 'micro'
import { AlbumCreationResponse } from '../../models/Album'
import { photos } from '../photos'
import { typed } from '../TypedHandler'

export const postAlbum = typed(
    'post',
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

export default postAlbum
