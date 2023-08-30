export default {
  port: 3000,
  dbUrl: process.env.DATABASE_URL,
  protocol: process.env.PROTOCOL_PROD,
  baseUrl: process.env.BASE_URL_PROD,
  mailTrapApi: process.env.MAILTRAP_API,
  mailTrapToken: process.env.MAILTRAP_TOKEN,
  jwtSecret: process.env.JWT_SECRET,
  logging: false,
}
