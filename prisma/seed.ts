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
      name: 'administrator',
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

  const glosariumData = [
    {
      name: 'Kompot / Compot',
      description:
        'Kompot / compot merupakan akronim dari community pot. Community Pot adalah pot yang dipakai untuk menanam bibit dalam jumlah banyak.',
    },
    {
      name: 'Angbul',
      description: 'Angbul merupakan akronim dari anggrek bulan.',
    },
    {
      name: 'Kuljar',
      description:
        'Kuljar merupakan akronim dari kultur jaringan. Kultur jaringan adalah metode penanaman tanaman dengan cara memisahkan sel-sel tanaman yang akan ditanam.',
    },
    {
      name: 'Anggrek rental',
      description:
        'Anggrek rental adalah anggrek yang disewakan. Anggrek bekas rental (ex rental) biasanya dijual dengan harga yang lebih murah karena kondisi setelah disewa terkadang sudah tidak bagus sehingga perlu waktu dan biaya untuk merawatnya kembali.',
    },
    {
      name: 'Metan',
      description: 'Metan merupakan akronim dari media tanam.',
    },
    {
      name: 'Spike',
      description: '',
    },
    {
      name: 'knop / knob',
      description: '',
    },
    {
      name: 'Seedling',
      description: '',
    },
  ]

  const glosariumWithContributors = await Promise.all(
    glosariumData.map(async (data) => {
      const glosarium = await prisma.glosarium.create({
        data: data,
      })

      return prisma.user.update({
        where: {
          id: fadil.id,
        },
        data: {
          contributor_glosarium: {
            connectOrCreate: {
              where: {
                id: glosarium.id,
              },
              create: {
                glosarium: {
                  connect: {
                    id: glosarium.id,
                  },
                },
              },
            },
          },
        },
        include: {
          contributor_glosarium: true,
        },
      })
    })
  )

  const articleCategoryData = [
    {
      name: 'Informasi Umum',
    },
    {
      name: 'Cara Menanam',
    },
    {
      name: 'Perawatan',
    },
  ]
  const ArticleCategory = await Promise.all([
    articleCategoryData.map(async (data) => {
      return prisma.articleCategory.create({
        data,
      })
    }),
  ])

  // const artikel = await prisma.article.create({
  //   data: {
  //     title: 'Cara Menanam Anggrek Bulan',
  //     content: `# Jenis Anggrek yang Dilindungi Berdasarkan Peraturan Menteri Lingkungan Hidup dan Kehutanan Republik Indonesia Nomor P.92/MENLHK/SETJEN/KUM.1/8/2018

  // Berbagai spesies tumbuhan dan hewan di Indonesia dilindungi oleh undang-undang demi menjaga keanekaragaman hayati di Indonesia. Salah satu kelompok tumbuhan yang dilindungi adalah anggrek.

  // Berdasarkan **Peraturan Menteri Lingkungan Hidup dan Kehutanan Republik Indonesia Nomor P.92/MENLHK/SETJEN/KUM.1/8/2018 tentang Perubahan atas Peraturan Menteri Lingkungan Hidup dan Kehutanan Nomor P.20/MENLHK/SETJEN/KUM.1/6/2018 tentang Jenis Tumbuhan dan Satwa yang Dilindungi**, terdapat sejumlah jenis anggrek yang dilindungi. Berikut adalah daftar jenis anggrek yang dilindungi tersebut:

  // | No | Nama Ilmiah | Nama Indonesia |
  // |---|------------|----------------|
  // | 1 | *Cymbidium hartinahianum* | Anggrek Ibu Tien |
  // | 2 | *Paphiopedilum gigantifolium* | Anggrek Kasut Raksasa |
  // | 3 | *Paphiopedilum glanduliferum* | Anggrek Kasut Berkelenjar |
  // | 4 | *Paphiopedilum glaucophyllum* | Anggrek Kasut Berbulu |
  // | 5 | *Paphiopedilum kolopakingii* | Anggrek Kasut Kolopaking |
  // | 6 | *Paphiopedilum liemianum* | Anggrek Kasut Liem |
  // | 7 | *Paphiopedilum mastersianum* | Anggrek Kasut Master |
  // | 8 | *Paphiopedilum nataschae* | Anggrek Kasut Natascha |
  // | 9 | *Paphiopedilum primulinum* | Anggrek Kasut Kuning |
  // | 10 | *Paphiopedilum robinsonianum* | Anggrek Kasut Robinson |
  // | 11 | *Paphiopedilum sangii* | Anggrek Kasut Sang |
  // | 12 | *Paphiopedilum supardii* | Anggrek Kasut Supardi |
  // | 13 | *Paphiopedilum victoria-mariae* | Anggrek Kasut Maria |
  // | 14 | *Paphiopedilum victoria-regina* | Anggrek Kasut Regina |
  // | 15 | *Paphiopedilum violacens* | Anggrek Kasut Ungu |
  // | 16 | *Paphiopedilum wilhelminae* | Anggrek Kasut Wilhelmina |
  // | 17 | *Paraphalaenopsis denevei* | Anggrek Ekor Tikus DeNevi |
  // | 18 | *Paraphalaenopsis labukensis* | Anggrek Tikus Labuk |
  // | 19 | *Paraphalaenopsis laycockii* | Anggrek Ekor Tikus Laycock |
  // | 20 | *Paraphalaenopsis serpentilingua* | Anggrek Ekor Tikus Lidah Ular |
  // | 21 | *Phalaenopsis bellina* | Anggrek Kelip |
  // | 22 | *Phalaenopsis celebensis* | Anggrek Bulan Sulawesi |
  // | 23 | *Phalaenopsis floresensis* | Anggrek Bulan Flores |
  // | 24 | *Phalaenopsis gigantea*  | Anggrek Bulan Raksasa  |
  // |25 |*Phalaenopsis javanica*| Anggrek Bulan Jawa
  // |26 |*Phalaenopsis sumatrana*| Anggrek Bulan Sumatera
  // |27 |*Vanda celebica*|Anggrek Vanda Mungil Minahasa
  // |28 |*Vanda sumatrana*| Anggrek Vanda Sumatera

  // Jenis-jenis anggrek ini dilindungi karena beberapa alasan, antara lain karena keunikan bentuk dan warna bunganya yang menarik perhatian, langka, serta terancam punah karena perburuan dan perusakan habitatnya. Oleh karena itu, dilarang untuk memanen, memungut, atau memperdagangkan anggrek-anggrek tersebut tanpa izin dari pihak yang berwenang.

  // Melindungi jenis anggrek ini adalah upaya untuk menjaga keanekaragaman hayati di Indonesia dan memastikan bahwa spesies-spesies tersebut tetap ada untuk dinikmati oleh generasi-generasi mendatang.
  // `,
  //     infographic: '',
  //     published: true,
  //     description: '',
  //     // connect to category
  //     categories: {
  //       connect: {
  //         cate: 21,
  //       },
  //     },
  //     author: {
  //       connect: {
  //         id: fadil.id,
  //       },
  //     },
  //   },
  // })

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
