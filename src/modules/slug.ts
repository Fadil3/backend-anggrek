import prisma from '../db'
const { v4: uuidv4 } = require('uuid')

const createSlug = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '-')
}

// const query = async () => {}

export const createUniqueSlugPost = async (title) => {
  let slug = createSlug(title)

  const existingPost = await prisma.post.findFirst({
    where: {
      slug,
    },
  })

  if (existingPost) {
    // If a post with the same slug already exists, append a unique identifier
    slug = `${slug}-${uuidv4().substr(0, 8)}`
  }

  return slug
}

export const createUniqueSlugArticle = async (title) => {
  let slug = createSlug(title)

  const existingArticle = await prisma.article.findFirst({
    where: {
      slug,
    },
  })

  if (existingArticle) {
    // If a post with the same slug already exists, append a unique identifier
    slug = `${slug}-${uuidv4().substr(0, 8)}`
  }

  return slug
}

export const createUniqueSlugAnggrek = async (name) => {
  let slug = createSlug(name)

  const existingAnggrek = await prisma.anggrek.findFirst({
    where: {
      slug,
    },
  })

  if (existingAnggrek) {
    // If a post with the same slug already exists, append a unique identifier
    slug = `${slug}-${uuidv4().substr(0, 8)}`
  }

  return slug
}
