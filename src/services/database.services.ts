import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'

config()
// Khai báo biến uri kết nối đến MongoDB
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@x.eqfqb.mongodb.net/?retryWrites=true&w=majority&appName=x`

// Service xử lý logic liên quan đến database
class DatabaseService {
  // Khai báo biến client để kết nối đến MongoDB
  private client: MongoClient
  // Khai báo biến db để thao tác với database
  private db: Db
  // Khởi tạo client và db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  // Kết nối đến MongoDB
  async connect() {
    try {
      // Kết nối đến MongoDB với client đã tạo ở trên và lưu vào biến client của class DatabaseService này
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Error', error)
      // Nếu có lỗi thì throw error
      throw error
    }
  }
  // Dùng để lấy collection users từ database để thao tác với collection này
  get users(): Collection<User> {
    // Trả về collection users
    return this.db.collection(process.env.DB_COLLECTION_USERS as string)
  }
  // Dùng để lấy collection refresh_tokens từ database để thao tác với collection này
  get refreshTokens(): Collection<RefreshToken> {
    // Trả về collection refresh_tokens
    return this.db.collection(process.env.DB_COLLECTION_REFRESH_TOKENS as string)
  }
}

// Tạo biến databaseService để sử dụng trong các file khác
const databaseService = new DatabaseService()

export default databaseService
