import { Router } from 'express'
import { uploadImageController } from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

/**
 * path: /upload-image
 * method: POST
 * Body form-data: { image: File }
 */

mediasRouter.post('/upload-image', wrapRequestHandler(uploadImageController))

export default mediasRouter