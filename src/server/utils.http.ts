import { ServerRequest } from 'microrouter'

export function authHeaders(req: ServerRequest) {
    if (!req.headers.Authorization) {
        return new Error()
    }

    return { Authorization: req.headers.Authorization as string }
}
