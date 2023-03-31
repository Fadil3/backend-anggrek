import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/modules/auth'
const prisma = new PrismaClient()
async function main() {
  console.log('Start seeding ...')
  const fadil = await prisma.user.create({
    data: {
      email: 'fadil@gmail.com',
      name: 'fadil normal',
      password: await hashPassword('fadil123'),
    },
  })
  const fadilAdmin = await prisma.user.create({
    data: {
      email: 'fadilAdmin@gmail.com',
      name: 'fadilAdmin',
      password: await hashPassword('fadil123'),
      role: 'ADMINISTRATOR',
    },
  })
  const fadilSuperAdmin = await prisma.user.create({
    data: {
      email: 'fadilSuperAdmin@gmail.com',
      name: 'fadilSuperAdmin',
      password: await hashPassword('fadil123'),
      role: 'SUPER_ADMINISTRATOR',
    },
  })

  const glosarium1 = await prisma.glosarium.create({
    data: {
      name: 'Kompot / Compot',
      description:
        'Kompot / compot merupakan akronim dari community pot. Community Pot adalah pot yang dipakai untuk menanam bibit dalam jumlah banyak.',
      contributor: {
        create: {
          userId: fadil.id,
        },
      },
    },
  })

  const glosarium2 = await prisma.glosarium.create({
    data: {
      name: 'Angbul',
      description: 'Angbul merupakan akronim dari anggrek bulan.',
      contributor: {
        create: {
          userId: fadil.id,
        },
      },
    },
  })

  const glosarium3 = await prisma.glosarium.create({
    data: {
      name: 'Kuljar',
      description:
        'Kuljar merupakan akronim dari kultur jaringan. Kultur jaringan adalah metode penanaman tanaman dengan cara memisahkan sel-sel tanaman yang akan ditanam.',
      contributor: {
        create: {
          userId: fadil.id,
        },
      },
    },
  })

  const glosarium4 = await prisma.glosarium.create({
    data: {
      name: 'Anggrek rental',
      description:
        'Anggrek rental adalah anggrek yang disewakan. Anggrek bekas rental (ex rental) biasanya dijual dengan harga yang lebih murah karena kondisi setelah disewa terkadang sudah tidak bagus sehingga perlu waktu dan biaya untuk merawatnya kembali.',
      contributor: {
        create: {
          userId: fadil.id,
        },
      },
    },
  })

  console.log('Seeding success...')
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
