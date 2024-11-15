// Khai báo các biến môi trường trong file .env
declare namespace NodeJS {
  // Khai báo các biến môi trường
  interface ProcessEnv {
    DB_NAME: string
    DB_USERNAME: string
    DB_PASSWORD: string
    DB_COLLECTION_USERS: string
    PASSWORD_SECRET: string
    JWT_SECRET_ACCESS_TOKEN: string
    JWT_SECRET_REFRESH_TOKEN: string
    JWT_SECRET_EMAIL_VERIFY_TOKEN: string
    JWT_SECRET_FORGOT_PASSWORD_TOKEN: string
    ACCESS_TOKEN_EXPIRES_IN: string
    REFRESH_TOKEN_EXPIRES_IN: string
    EMAIL_VERIFY_TOKEN_EXPIRES_IN: string
    FORGOT_PASSWORD_TOKEN_EXPIRES_IN: string
    DB_COLLECTION_REFRESH_TOKENS: string
    DB_PORT: number
    DB_COLLECTION_FOLLOWERS: string
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
    GOOGLE_REDIRECT_URI: string
    CLIENT_REDIRECT_URI: string
    HOST: string
  }
}
