import { is, t } from '@yarnaimo/rain'
import { HttpsFunction, region } from 'firebase-functions'
import { IncomingMessage, ServerResponse } from 'http'
import { Settings } from 'luxon'
import { send, sendError } from 'micro'
import { authHeaders, AuthHeaders, cors } from './http'

Settings.defaultZoneName = 'Asia/Tokyo'

export interface TypedHandler<T1 extends t.Type<any>, T2 extends t.Type<any>>
    extends HttpsFunction {
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
    const requestHandler = region('asia-northeast1').https.onRequest(
        cors(async (req, res) => {
            try {
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
                    const v = reqType.decode((req as any).body)

                    if (v.isLeft()) {
                        return send(res, 400, 'リクエストの形式が無効です')
                    }

                    received = v.value
                }

                const resBody = await handler(req, res, headers, received as any)
                send(res, 200, resBody)
            } catch (error) {
                sendError(req, res, error)
            }
        })
    )

    const typedHandler = Object.assign(requestHandler, { reqType, resType }) as TypedHandler<T1, T2>

    return typedHandler
}
