import { IncomingMessage } from 'http'
import microCors from 'micro-cors'

export interface AuthHeaders {
    authorization?: string
}

export function authHeaders(req: IncomingMessage) {
    if (!req.headers.authorization) {
        return new Error()
    }

    return { authorization: req.headers.authorization as string }
}

export const cors = microCors({ origin: 'http://localhost:1234' })
