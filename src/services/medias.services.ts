import { Request } from 'express'
import { getNameFormFullName, handleUploadImage } from '~/utils/file'
import sharp from 'sharp'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Orther'

config()

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFormFullName(file.newFilename)
        const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpeg`)
        await sharp(file.filepath).jpeg({ quality: 80 }).toFile(newPath)
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/images/${newName}.jpeg`
            : `http://localhost:${process.env.DB_PORT}/static/images/${newName}.jpeg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }
}

const mediasService = new MediasService()
export default mediasService
