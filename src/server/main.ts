import { IncomingMessage, ServerResponse } from 'http'
import { cors } from './utils.http'

export default cors(async (req: IncomingMessage, res: ServerResponse) => {
    const handler = await import(`.${req.url!}`)
    handler.default(req, res)
})
