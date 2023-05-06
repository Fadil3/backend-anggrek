export default {
  port: 9898,
  dbUrl: process.env.DATABASE_URL,
  protocol: process.env.PROTOCOL_PROD,
  baseUrl: process.env.BASE_URL_PROD,
  jwtSecret: process.env.JWT_SECRET,
  logging: false,
}
