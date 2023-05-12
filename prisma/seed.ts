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

  const categoryInformasi = await prisma.articleCategory.create({
    data: {
      name: 'Informasi Umum',
    },
  })

  const artikel = await prisma.article.create({
    data: {
      title: 'Cara Menanam Anggrek Bulan',
      content: `# Jenis Anggrek yang Dilindungi Berdasarkan Peraturan Menteri Lingkungan Hidup dan Kehutanan Republik Indonesia Nomor P.92/MENLHK/SETJEN/KUM.1/8/2018

  Berbagai spesies tumbuhan dan hewan di Indonesia dilindungi oleh undang-undang demi menjaga keanekaragaman hayati di Indonesia. Salah satu kelompok tumbuhan yang dilindungi adalah anggrek.

  Berdasarkan **Peraturan Menteri Lingkungan Hidup dan Kehutanan Republik Indonesia Nomor P.92/MENLHK/SETJEN/KUM.1/8/2018 tentang Perubahan atas Peraturan Menteri Lingkungan Hidup dan Kehutanan Nomor P.20/MENLHK/SETJEN/KUM.1/6/2018 tentang Jenis Tumbuhan dan Satwa yang Dilindungi**, terdapat sejumlah jenis anggrek yang dilindungi. Berikut adalah daftar jenis anggrek yang dilindungi tersebut:

  | No | Nama Ilmiah | Nama Indonesia |
  |---|------------|----------------|
  | 1 | *Cymbidium hartinahianum* | Anggrek Ibu Tien |
  | 2 | *Paphiopedilum gigantifolium* | Anggrek Kasut Raksasa |
  | 3 | *Paphiopedilum glanduliferum* | Anggrek Kasut Berkelenjar |
  | 4 | *Paphiopedilum glaucophyllum* | Anggrek Kasut Berbulu |
  | 5 | *Paphiopedilum kolopakingii* | Anggrek Kasut Kolopaking |
  | 6 | *Paphiopedilum liemianum* | Anggrek Kasut Liem |
  | 7 | *Paphiopedilum mastersianum* | Anggrek Kasut Master |
  | 8 | *Paphiopedilum nataschae* | Anggrek Kasut Natascha |
  | 9 | *Paphiopedilum primulinum* | Anggrek Kasut Kuning |
  | 10 | *Paphiopedilum robinsonianum* | Anggrek Kasut Robinson |
  | 11 | *Paphiopedilum sangii* | Anggrek Kasut Sang |
  | 12 | *Paphiopedilum supardii* | Anggrek Kasut Supardi |
  | 13 | *Paphiopedilum victoria-mariae* | Anggrek Kasut Maria |
  | 14 | *Paphiopedilum victoria-regina* | Anggrek Kasut Regina |
  | 15 | *Paphiopedilum violacens* | Anggrek Kasut Ungu |
  | 16 | *Paphiopedilum wilhelminae* | Anggrek Kasut Wilhelmina |
  | 17 | *Paraphalaenopsis denevei* | Anggrek Ekor Tikus DeNevi |
  | 18 | *Paraphalaenopsis labukensis* | Anggrek Tikus Labuk |
  | 19 | *Paraphalaenopsis laycockii* | Anggrek Ekor Tikus Laycock |
  | 20 | *Paraphalaenopsis serpentilingua* | Anggrek Ekor Tikus Lidah Ular |
  | 21 | *Phalaenopsis bellina* | Anggrek Kelip |
  | 22 | *Phalaenopsis celebensis* | Anggrek Bulan Sulawesi |
  | 23 | *Phalaenopsis floresensis* | Anggrek Bulan Flores |
  | 24 | *Phalaenopsis gigantea*  | Anggrek Bulan Raksasa  |
  |25 |*Phalaenopsis javanica*| Anggrek Bulan Jawa
  |26 |*Phalaenopsis sumatrana*| Anggrek Bulan Sumatera
  |27 |*Vanda celebica*|Anggrek Vanda Mungil Minahasa
  |28 |*Vanda sumatrana*| Anggrek Vanda Sumatera

  Jenis-jenis anggrek ini dilindungi karena beberapa alasan, antara lain karena keunikan bentuk dan warna bunganya yang menarik perhatian, langka, serta terancam punah karena perburuan dan perusakan habitatnya. Oleh karena itu, dilarang untuk memanen, memungut, atau memperdagangkan anggrek-anggrek tersebut tanpa izin dari pihak yang berwenang.

  Melindungi jenis anggrek ini adalah upaya untuk menjaga keanekaragaman hayati di Indonesia dan memastikan bahwa spesies-spesies tersebut tetap ada untuk dinikmati oleh generasi-generasi mendatang.
  `,
      published: true,
      description: '',
      // connect to category
      categories: {
        create: {
          categoryId: await categoryInformasi.id,
        },
      },
      author: {
        connect: {
          id: fadil.id,
        },
      },
    },
  })

  const phalAmbon = await prisma.anggrek.create({
    data: {
      name: 'Phalaenopsis amboinensis',
      description: `Jenis ini berasal dari Ambon. Karena ditemukan untuk pertama kalinya di sana maka dinamakan anggrek bulan Ambon. Selain di Ambon, tumbuhan ini tersebar luas di daerah Maluku dan Irian Jaya. Masing-masing bunga bergaris tengah 5 cm,berwarna kuning kecoklatan dengan hiasan garis-garis pendek melintang warna coklat kemerahan. Bunga-bunga tersebut tersusun dalam perbungaan dengan gagang yang pendek. Daun kelopak dan daun mah-kota hampir sama besar, berbentuk lanset, berujung runcing. Tiap tandan memiliki ± 4 bunga.Pemeliharaannya mudah sekali. Tanamannya hanya ditempelkan pada pohon atau pada sekeping pakis. Penyiraman dan pemupukan perlu diberikan sewaktu-waktu. Untuk hidupnya, jenis ini menyukai tempat yang agak teduh dan lembab.  Di Kebun Raya Bogor, koleksi yang berasal dari Seram dan Sulawesi berbunga pada bulan-bulan Januari, Maret dan September.Lama mekar bunganya rata-rata seminggu.`,
      localName: 'Anggrek Bulan Ambon',
      degree: '',
      light: '',
      humidity: '',
      references: '',
      isApproved: true,
      contributor: {
        create: {
          userId: fadil.id,
        },
      },
    },
  })

  const fotoAmbon = [
    {
      path: `/public/uploads/anggrek/phalaenopsis_amboinensis.jpg`,
      anggrekId: phalAmbon.id,
      caption:
        'Lembaga Biologi Nasional - LIPI. (1979). Jenis Jenis Anggrek. PN Balai Pustaka.',
      link: '-',
    },
    {
      path: `/public/uploads/anggrek/phalaenopsis_amboinensis2.jpg`,
      anggrekId: phalAmbon.id,
      caption: 'Deutsche Orchideen-Gesellschaft e.V. - Gruppe Teutoburger Wald',
      link: 'https://www.facebook.com/DOGTeutoburgerWald/photos/pcb.530681187426873/530680744093584/?type=3&theater&ifg=1',
    },
  ]

  const insertAnggrekAmbon = await Promise.all([
    fotoAmbon.map(async (data) => {
      return prisma.anggrekPhoto.create({
        data,
      })
    }),
  ])

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
