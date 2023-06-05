import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/modules/auth'
import { createUniqueSlugArticle } from '../src/modules/slug'
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
      title:
        'Jenis Anggrek yang Dilindungi Berdasarkan Peraturan Menteri Lingkungan Hidup dan Kehutanan Republik Indonesia',
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
      slug: await createUniqueSlugArticle(
        'Jenis Anggrek yang Dilindungi Berdasarkan Peraturan Menteri Lingkungan Hidup dan Kehutanan Republik Indonesia'
      ),
      description:
        'Berbagai spesies tumbuhan dan hewan di Indonesia dilindungi oleh undang-undang demi menjaga keanekaragaman hayati di Indonesia. Salah satu kelompok tumbuhan yang dilindungi adalah anggrek.',
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

  const artikel_siram = await prisma.article.create({
    data: {
      title: 'Panduan Menyiram Anggrek',
      content: `# Panduan Menyiram Anggrek

Anggrek adalah tanaman hias yang populer karena keindahan dan keunikan bunganya. Untuk menjaga anggrek tetap sehat dan berbunga indah, salah satu hal penting yang perlu dilakukan adalah menyiram anggrek dengan benar. Overwatering (terlalu banyak menyiram air pada tanaman) dan Underwatering (terlalu sedikit menyiram air pada tanaman) merupakan penyebab utama anggrek mati.

Menyiram anggrek secara tepat dapat membantu menjaga tingkat kelembaban yang tepat, mencegah akar dari kelebihan air, dan memberikan nutrisi yang diperlukan. Berikut ini adalah panduan tentang cara menyiram anggrek dengan benar.

## Waktu penyiraman
Lakukan penyiraman pada pagi hari dan sore hari jika diperlukan. Hindari menyiram tanaman pada siang hari dan malam hari karena :
- Penyiraman siang hari dapat membuat tanaman menjadi terbakar.
- Penyiraman pada malam hari dapat membuat tanaman menjadi busuk karena air tidak menguap.

 Untuk mempermudah penyiraman, gunakan alat bantu seperti :
- Gembor
- Sprayer
- Mister

Siram sampai air keluar dari bawah pot. ![siram](https://api.anggrekpedia.my.id//uploads/articles/siram.png)


## Kapan Harus Disiram ?
Secara umum, tanaman perlu disiram saat kondisinya **kering**. Berikut ini merupakan cara untuk memastikan apakah tanaman dalam kondisi kering. 

- Kering saat disentuh
- Berat pot terasa lebih ringan dibanding pot yang baru disiram.
- Media tanam terlihat kering.

![waktu siram](https://api.anggrekpedia.my.id//uploads/articles/waktu-siram.png)

## Jenis Pot Anggrek
Perbedaan jenis pot yang dipakai juga dapat mempengaruhi intensitas penyiraman. Penguapan air lebih cepat terjadi pada pot tanah liat karena dinding pot bersifat porous. Pot plastik bisa menahan kelembapan tanah lebih lama.
![jenis pot](https://api.anggrekpedia.my.id//uploads/articles/jenis-pot.png)

Referensi 
- Frowine, S. A., & National Gardening Association. (2022). Orchids for Dummies. John Wiley & Sons.
- Direktorat Buah dan Florikultura, Kementrian Pertanian. (2020). Standar Operasional Prosedur Anggrek (Seri Dendrobium).
`,
      published: true,
      slug: await createUniqueSlugArticle('Panduan Menyiram Anggrek'),
      description:
        'Anggrek adalah tanaman hias yang populer karena keindahan dan keunikan bunganya. Untuk menjaga anggrek tetap sehat dan berbunga indah, salah satu hal penting yang perlu dilakukan adalah menyiram anggrek dengan benar.',
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

  const infographic_siram = await prisma.infographic.create({
    data: {
      path: '/public/uploads/infographic/panduan_menyiram.png',
      articleId: artikel_siram.id,
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
      path: `/public/uploads/anggrek/phalaenopsis_amboinensis2.jpg`,
      anggrekId: phalAmbon.id,
      caption: 'Deutsche Orchideen-Gesellschaft e.V. - Gruppe Teutoburger Wald',
      link: 'https://www.facebook.com/DOGTeutoburgerWald/photos/pcb.530681187426873/530680744093584/?type=3&theater&ifg=1',
    },
    {
      path: `/public/uploads/anggrek/phalaenopsis_amboinensis.jpg`,
      anggrekId: phalAmbon.id,
      caption:
        'Lembaga Biologi Nasional - LIPI. (1979). Jenis Jenis Anggrek. PN Balai Pustaka.',
      link: '-',
    },
  ]

  const insertAnggrekAmbon = await Promise.all([
    fotoAmbon.map(async (data) => {
      return prisma.anggrekPhoto.create({
        data,
      })
    }),
  ])

  const vandaSumatra = await prisma.anggrek.create({
    data: {
      name: 'Vanda sumatrana Schltr.',
      description: `Tanaman ini berasal dari pulau Sumatera, karenanya dalam ilmu tumbuh-tumbuhan dinamakan Vanda sumatrana.
Batangnya tegak, kuat dan dapat mencapai tinggi 1,5 m. Daunnya Merupakan tipe daun sabuk dengan panjang ± 45 cm; tersusun rapat dan melengkung ke luar. Bunganya tersusun dalam bentuk tandan yang muncul dari ketiak daun. Setiap tandan menyangga 2 - 7 kuntum bunga. Bunganya berwarna gelap, merah coklat pada pangkal daun-daun mahkotanya sedangkan ujung-ujungnya berwarna coklat kehitaman. Garis tengahnya 5 - 7 cm. Buahnya berbentuk jorong dan bersekat enam.
Umumnya vanda sumatra ini tumbuh baik di dataran rendah. Bunganya memiliki keharuman yang lembut mirip bau kayu manis. Ke-tahanan mekarnya antara 10 - 14 hari.`,
      localName: 'Anggrek Vanda Sumatera',
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

  const fotoVandaSumatrana = [
    {
      path: `/public/uploads/anggrek/vanda_sumatrana1.jpg`,
      anggrekId: vandaSumatra.id,
      caption:
        'Lembaga Biologi Nasional - LIPI. (1979). Jenis Jenis Anggrek. PN Balai Pustaka.',
      link: '-',
    },
    {
      path: `/public/uploads/anggrek/vanda_sumatrana1.jpg`,
      anggrekId: vandaSumatra.id,
      caption:
        'Lembaga Biologi Nasional - LIPI. (1979). Jenis Jenis Anggrek. PN Balai Pustaka.',
      link: '-',
    },
  ]

  const insertVandaSumatrana = await Promise.all([
    fotoVandaSumatrana.map(async (data) => {
      return prisma.anggrekPhoto.create({
        data,
      })
    }),
  ])

  const cbdHarti = await prisma.anggrek.create({
    data: {
      name: 'Cymbidium hartinahianum',
      description: `Nama jenis hartinahianum berasal dari nama Siti Hartinah Suharto.Yang memberi nama ialah J.B.Com-ber dan Rusydi E. Nasution. Sdr. R.E. Nasution adalah salah seorang staf Kebun Raya Bogor yang mempunyai minat dalam penelitian anggrek.
Tumbuhan ini adalah anggrek tanah yang pertumbuhannya merumpun. Batangnya sangat pendek, berbentuk bulat telur, tertutup rapat oleh daun. Daunnya berbentuk pita berujung runcing, panjangnya 50-60 cm. Bunganya berbentuk bintang,berukuran 3,5 cm,bertekstur tebal. Daun kelopak dan daun mahkota hampir sama besar. sedang permukaan atas berwarna kuning kehijauan dan permukaan bawahnya berwarna kecoklatan dengan kuning di bagian tepinya. Gagang perjuangannya tegak.
Jenis ini dijumpai tumbuh hanya di daerah Sidikalang, Sumatera Utara. Umumnya tumbuh baik di tempat terbuka di antara rerumputan,pada ketinggian 1.700 m dpl. Di tempat asalnya anggrek ini belum dimanfaatkan, tetapi bunganya yang menarik dapat digunakan sebagai bunga potongan atau sebagai tanaman hias. Umumnya Cymbidium. mempunyai karangan bunga yang merunduk. Tetapi  ini termasuk Cymbidium yang mempunyai karangan bunga tegak, karenanya baik untuk silangan`,
      localName: 'Anggrek Vanda Sumatera',
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

  const fotoCbdHarti = [
    {
      path: `/public/uploads/anggrek/cbd_hartinahianum.jpg`,
      anggrekId: cbdHarti.id,
      caption:
        'Lembaga Biologi Nasional - LIPI. (1979). Jenis Jenis Anggrek. PN Balai Pustaka.',
      link: '-',
    },
  ]

  const insertCbdHarti = await Promise.all([
    fotoCbdHarti.map(async (data) => {
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
