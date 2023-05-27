import prisma from '../db'
import { isAdmin } from '../modules/auth'

export const getPosts = async (req, res, next) => {
  try {
    const page = req.query.page || 1
    const count = await prisma.post.count()
    const search = req.query.search || ''
    const posts = await prisma.post.findMany({
      where: {
        title: {
          contains: search,
          mode: 'insensitive',
        },
      },
      orderBy: {
        title: 'asc',
      },
      include: {
        author: {
          select: {
            name: true,
            id: true,
            image_profile: true,
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
        view: true,
      },
      // skip: (page - 1) * 10,
      // take: 10,
    })

    res.json({
      message: 'Berhasil mendapatkan data',
      data: posts,
      meta: {
        current_page: page,
        per_page: 10,
        total: count,
        total_page: Math.ceil(count / 10),
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getDetailPost = async (req, res, next) => {
  try {
    const { id } = req.params
    const post = await prisma.post.findFirst({
      where: {
        id,
      },
      include: {
        author: {
          select: {
            name: true,
            id: true,
            image_profile: true,
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
        view: true,
      },
    })

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    // add view count

    if (!post.view) {
      // If the post doesn't have a View record yet, create one
      await prisma.view.create({
        data: {
          postId: post.id,
          count: 1,
        },
      })
    } else {
      // If the post already has a View record, increment the count
      await prisma.view.update({
        where: { id: post.view.id },
        data: {
          count: {
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

    res.json({
      message: 'Berhasil menghapus data',
      data: deletedPost,
    })
  } catch (error) {
    next(error)
  }
}

export const createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body
    const post = await prisma.post.create({
      data: {
        title,
        slug: title.toLowerCase().replace(' ', '-'),
        content,
        published: true,
        author: {
          connect: {
            id: req.user.id,
          },
        },
        view: {
          create: {
            count: 0,
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
    const { title, content } = req.body
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        slug: title.toLowerCase().replace(' ', '-'),
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

    res.json({
      message: 'Berhasil menghapus komentar',
      data: deletedComment,
    })
  } catch (error) {
    next(error)
  }
}
