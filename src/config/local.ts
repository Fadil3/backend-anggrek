export default {
  port: 9999,
  dbUrl: process.env.DATABASE_URL,
  protocol: process.env.PROTOCOL_DEV,
  baseUrl: process.env.BASE_URL_DEV,
  jwtSecret: process.env.JWT_SECRET,
  logging: false,
}
