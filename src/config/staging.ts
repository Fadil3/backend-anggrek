export default {
  port: 9999,
  dbUrl: process.env.DATABASE_URL,
  baseUrl: process.env.BASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  mailTrapApi: process.env.MAILTRAP_API,
  mailTrapToken: process.env.MAILTRAP_TOKEN,
  logging: false,
}
