import fs from 'fs'
import { Request } from 'express'
import formidable, { File } from 'formidable'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true // Tạo thư mục cha nếu không tồn tại
    })
  }
}

export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR, // Thư mục lưu file
    maxFiles: 4, // Số file tối đa
    keepExtensions: true, // Giữ nguyên đuôi file
    maxFileSize: 300 * 1024 * 1024, // Dung lượng tối đa,
    maxTotalFileSize: 300 * 1024 * 1024 * 4, // Tổng dung lượng tối đa
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File không hợp lệ') as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (Boolean(Object.keys(files).length === 0) === true) {
        return reject(new Error('File is required'))
      }
      resolve(files.image as File[])
    })
  })
}

export const getNameFormFullName = (fullName: string) => {
  const nameArr = fullName.split('.')
  nameArr.pop()
  return nameArr.join('')
}
