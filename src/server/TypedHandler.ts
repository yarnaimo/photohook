import { is, t } from '@yarnaimo/rain'
import { IncomingMessage, ServerResponse } from 'http'
import { Settings } from 'luxon'
import { json, RequestHandler, send } from 'micro'
import { authHeaders, AuthHeaders, cors } from './utils.http'

Settings.defaultZoneName = 'Asia/Tokyo'

export interface TypedHandler<T1 extends t.Type<any>, T2 extends t.Type<any>>
    extends RequestHandler {
    reqType: T1
    resType: T2
}

export function typed<T1 extends t.Type<any>, T2 extends t.Type<any>>(
    method: string,
    reqType: T1 | null,
    resType: T2 | null,
    handler: (
        req: IncomingMessage,
        res: ServerResponse,
        headers: AuthHeaders,
        validatedRequest: typeof reqType extends null ? undefined : t.TypeOf<T1>
    ) => Promise<t.TypeOf<T2> | void>
) {
    const requestHandler = cors(async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method === 'OPTIONS') {
            return send(res, 204)
        }

        if (method.toUpperCase() !== req.method!) {
            return send(res, 405)
        }

        const headers = authHeaders(req)

        if (is.error(headers)) {
            return send(res, 401, '認証に失敗しました')
        }

        let received: string | undefined

        if (reqType) {
            const v = await json(req).then(o => reqType.decode(o))

            if (v.isLeft()) {
                return send(res, 400, 'リクエストの形式が無効です')
            }

            received = v.value
        }

        const resBody = await handler(req, res, headers, received as any)
        send(res, 200, resBody)
    })

    const typedHandler = Object.assign(requestHandler, { reqType, resType }) as TypedHandler<T1, T2>

    return typedHandler
}
