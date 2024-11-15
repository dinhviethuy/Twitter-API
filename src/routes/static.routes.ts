import { Router } from 'express'
import { serveImageController } from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const staticRouter = Router()

/**
 * path: /images/:name
 * method: GET
 */
staticRouter.get('/images/:name', wrapRequestHandler(serveImageController))

export default staticRouter
