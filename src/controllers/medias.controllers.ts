import { Request, Response, NextFunction } from 'express'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGE } from '~/constants/messages'
import { StaticReqParams } from '~/models/requests/User.requests'
import mediasService from '~/services/medias.services'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadImage(req)
  res.json({
    message: USERS_MESSAGE.UPLOAD_SUCCESS,
    result: url
  })
  return
}

export const serveImageController = async (req: Request<StaticReqParams>, res: Response, next: NextFunction) => {
  const { name } = req.params
  res.sendFile(path.resolve(UPLOAD_DIR, name), (err) => {
    if (err) {
      res.status(HTTP_STATUS.NOT_FOUND).send(USERS_MESSAGE.IMAGE_NOT_FOUND)
    }
  })
}
