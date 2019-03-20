import { IncomingMessage, ServerResponse } from 'http'
import * as fns from '.'

export default async (req: IncomingMessage, res: ServerResponse) => {
    const handler = (fns as any)[req.url!.slice(1)]
    handler(req, res)
}
