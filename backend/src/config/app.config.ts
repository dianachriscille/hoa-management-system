import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtPrivateKey: process.env.JWT_PRIVATE_KEY || '',
  jwtPublicKey: process.env.JWT_PUBLIC_KEY || '',
  jwtAccessExpiresIn: '15m',
  jwtRefreshExpiresIn: '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Gmail SMTP (replaces AWS SES)
  gmailUser: process.env.GMAIL_USER || '',
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD || '',
  gmailFrom: process.env.GMAIL_FROM || '',

  // Cloudinary (replaces AWS S3)
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',

  // Database (Railway PostgreSQL)
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: parseInt(process.env.DB_PORT || '5432', 10),
  dbUsername: process.env.DB_USERNAME || 'postgres',
  dbPassword: process.env.DB_PASSWORD || '',
  dbName: process.env.DB_NAME || 'hoa_system',

  // Redis (Upstash)
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // PayMongo (replaces Maya Business API)
  paymongoPublicKey: process.env.PAYMONGO_PUBLIC_KEY || '',
  paymongoSecretKey: process.env.PAYMONGO_SECRET_KEY || '',
  paymongoWebhookSecret: process.env.PAYMONGO_WEBHOOK_SECRET || '',

  // Google Drive OAuth (unchanged - free)
  googleDriveClientId: process.env.GOOGLE_DRIVE_CLIENT_ID || '',
  googleDriveClientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET || '',
  googleDriveTokens: process.env.GOOGLE_DRIVE_TOKENS || '{}',

  // Firebase FCM (unchanged - free)
  fcmServerKey: process.env.FCM_SERVER_KEY || '',

  // QR HMAC secret
  qrHmacSecret: process.env.QR_HMAC_SECRET || '',
}));
