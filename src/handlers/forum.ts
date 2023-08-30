import prisma from '../db'
import { isAdmin } from '../modules/auth'
import { createUniqueSlugPost } from '../modules/slug'
import { MailtrapClient } from 'mailtrap'
import config from '../config'

export const getPosts = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1
  const search = req.query.search || ''
  const categorySearch = req.query.category || ''
  const count =
    search || categorySearch
      ? await prisma.post.count({
          where: {
            categories: {
              some: {
                category: {
                  id: {
                    contains: categorySearch,
                  },
                },
              },
            },
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        })
      : await prisma.post.count()
  const sortAttribute = req.query.sort || ''
  const per_page = parseInt(req.query.per_page) || 5

  let orderByClause = {}

  if (sortAttribute === 'view') {
    // Assume view is a count field in your Post model
    orderByClause = {
      viewCount: 'desc',
    }
  } else if (sortAttribute === 'date') {
    orderByClause = {
      createdAt: 'desc',
    }
  }

  let unanswered = req.query.sort === 'answer' && { commentsCount: 0 }

  try {
    const posts = await prisma.post.findMany({
      where: {
        categories: {
          some: {
            category: {
              id: {
                contains: categorySearch,
              },
            },
          },
        },
        title: {
          contains: search,
          mode: 'insensitive',
        },
        ...unanswered,
      },
      orderBy: orderByClause,
      include: {
        author: {
          select: {
            name: true,
            id: true,
            image_profile: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                name: true,
                id: true,
                image_profile: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * per_page,
      take: per_page,
    })

    res.json({
      message: 'Berhasil mendapatkan data',
      data: posts,
      meta: {
        current_page: page,
        per_page: per_page,
        total: count,
        total_page: Math.ceil(count / per_page),
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getDetailPost = async (req, res, next) => {
  try {
    const { slug } = req.params
    const track = req.query.track || true
    // console.log(track)
    const post = await prisma.post.findFirst({
      where: {
        slug,
      },
      include: {
        author: {
          select: {
            name: true,
            id: true,
            image_profile: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                name: true,
                id: true,
                image_profile: true,
              },
            },
          },
        },
      },
    })

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (track) {
      console.log('track', track)
      await prisma.post.update({
        where: {
          id: post.id,
        },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      })
    }

    res.json({
      message: 'Berhasil mendapatkan data',
      data: post,
    })
  } catch (error) {
    next(error)
  }
}

export const deletePost = async (req, res, next) => {
  const { id } = req.params

  const post = await prisma.post.findFirst({
    where: { id },
    include: { author: true },
  })

  if (!post) {
    return res.status(404).json({ message: 'Post not found' })
  }

  if (post.author.id !== req.user.id && (await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const deletedPost = await prisma.post.delete({ where: { id } })
    console.log(deletedPost)

    res.json({
      message: 'Berhasil menghapus data',
      data: deletedPost,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const createPost = async (req, res, next) => {
  try {
    const { title, content, category } = req.body
    const slug = await createUniqueSlugPost(title)
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        published: true,
        author: {
          connect: {
            id: req.user.id,
          },
        },
        categories: {
          createMany: {
            data: JSON.parse(category).map((cat) => ({
              categoryId: cat,
            })),
          },
        },
      },
    })
    res.json({
      message: 'Berhasil membuat data',
      data: post,
    })
  } catch (error) {
    next(error)
  }
}

export const updatePost = async (req, res, next) => {
  const { slug } = req.params
  const post = await prisma.post.findFirst({
    where: { slug },
    include: { author: true },
  })

  if (!post) {
    return res.status(404).json({ message: 'Post not found' })
  }

  if (post.author.id !== req.user.id && (await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const { title, content, category } = req.body
    const newSlug =
      post.title !== title ? await createUniqueSlugPost(title) : slug
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        title,
        slug: newSlug,
        categories: {
          deleteMany: {
            postId: post.id,
          },
          createMany: {
            data: JSON.parse(category).map((cat) => ({
              categoryId: cat,
            })),
          },
        },
        content,
      },
    })

    res.json({
      message: 'Berhasil mengupdate data',
      data: updatedPost,
    })
  } catch (error) {
    next(error)
  }
}

export const commentPost = async (req, res, next) => {
  try {
    const { id } = req.params
    const { content } = req.body
    const comment = await prisma.comment.create({
      data: {
        content,
        author: {
          connect: {
            id: req.user.id,
          },
        },
        post: {
          connect: {
            id,
          },
        },
      },
    })

    const post = await prisma.post.findFirst({
      where: {
        id,
      },
      select: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        title: true,
        slug: true,
      },
    })

    await prisma.post.update({
      where: {
        id,
      },
      data: {
        commentsCount: {
          increment: 1,
        },
      },
    })

    // send notification if not author of post
    if (post.author.id !== req.user.id) {
      const notifications = await prisma.notification.create({
        data: {
          message: `${req.user.name} mengomentari postingan anda`,
          user: {
            connect: {
              id: post.author.id,
            },
          },
          link: `/forum/${post.slug}`,
        },
      })

      const client = new MailtrapClient({
        endpoint: config.mailTrapApi,
        token: config.mailTrapToken,
      })

      const sender = {
        email: 'mailtrap@anggrekpedia.my.id',
        name: 'Anggrekpedia',
      }

      const recipient = [
        {
          email: post.author.email,
        },
      ]

      client
        .send({
          from: sender,
          to: recipient,
          subject: 'Ada komentar baru di postingan anda',
          text: `${req.user.name} mengomentari postingan anda yang berjudul ${post.title}`,
          category: 'Notification comment',
        })
        .then(console.log, console.error)
    }

    res.json({
      message: 'Berhasil menambahkan komentar',
      data: comment,
    })
  } catch (error) {
    next(error)
  }
}

export const getCommentPost = async (req, res, next) => {
  try {
    const { id } = req.params
    const comments = await prisma.comment.findMany({
      where: {
        postId: id,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        content: true,
        author: {
          select: {
            name: true,
            id: true,
            image_profile: true,
          },
        },
      },
    })

    res.json({
      message: 'Berhasil mendapatkan data',
      data: comments,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteComment = async (req, res, next) => {
  const { id } = req.params

  const comment = await prisma.comment.findFirst({
    where: { id },
    include: { author: true },
  })

  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' })
  }

  if (
    comment.author.id !== req.user.id &&
    (await isAdmin(req.user)) === false
  ) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const deletedComment = await prisma.comment.delete({ where: { id } })
    //decrement comment count
    await prisma.post.update({
      where: {
        id: comment.postId,
      },
      data: {
        commentsCount: {
          decrement: 1,
        },
      },
    })

    res.json({
      message: 'Berhasil menghapus komentar',
      data: deletedComment,
    })
  } catch (error) {
    next(error)
  }
}

export const getLatestComment = async (req, res, next) => {
  try {
    const comment = await prisma.comment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      include: {
        post: {
          select: {
            title: true,
            slug: true,
          },
        },
        author: {
          select: {
            name: true,
          },
        },
      },
    })
    res.json({
      message: 'Berhasil mendapatkan komentar terbaru',
      data: comment,
    })
  } catch (error) {
    next(error)
  }
}
