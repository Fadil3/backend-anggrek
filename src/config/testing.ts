export default {
  port: 3223,
  dbUrl: process.env.DATABASE_URL_TEST,
  jwtSecret: process.env.JWT_SECRET,
  logging: true,
}
