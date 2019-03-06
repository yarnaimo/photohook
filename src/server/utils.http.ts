import { ServerRequest } from 'microrouter'

export interface AuthHeaders {
    authorization?: string
}

export function authHeaders(req: ServerRequest) {
    if (!req.headers.authorization) {
        return new Error()
    }

    return { authorization: req.headers.authorization as string }
}
