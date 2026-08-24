import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface CustomerSeed {
  name: string;
  email: string;
  phone?: string;
  /** 1-based indexes into that album's galleryPhotoSeeds() list, starred by this customer */
  selections?: number[];
}

const albumSeeds: {
  slug: string;
  name: string;
  photoCount: number;
  status: string;
  coverSeed: string;
  template: string;
  expiryDate: Date;
  description: string;
  customers: CustomerSeed[];
}[] = [
  {
    slug: "an-minh-2026",
    name: "Đám cưới An & Minh",
    photoCount: 312,
    status: "active",
    coverSeed: "album-an-minh",
    template: "classic",
    expiryDate: new Date("2026-09-20"),
    description: "Cảm ơn anh chị đã tin tưởng Books View.",
    customers: [
      { name: "Minh Anh", email: "minhanh@example.com" },
      { name: "Gia đình chú rể", email: "chure@example.com" },
      { name: "Gia đình cô dâu", email: "codau@example.com" },
    ],
  },
  {
    slug: "yearbook-12a1",
    name: "Kỷ yếu 12A1 — THPT Lê Quý Đôn",
    photoCount: 540,
    status: "active",
    coverSeed: "album-yearbook",
    template: "editorial",
    expiryDate: new Date("2026-09-30"),
    description: "Bộ ảnh kỷ yếu lớp 12A1.",
    customers: [
      {
        name: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        phone: "0901111111",
        // overlaps with Trần Thị B on 3/4/5 — same file must land in both customers' folders
        selections: [1, 2, 3, 4, 5],
      },
      {
        name: "Trần Thị B",
        email: "tranthib@example.com",
        phone: "0902222222",
        selections: [3, 4, 5, 6, 7],
      },
      {
        name: "Lê Văn C",
        email: "levanc@example.com",
        phone: "0903333333",
        selections: [8, 9, 10],
      },
    ],
  },
  {
    slug: "family-hoa",
    name: "Gia đình chị Hoa",
    photoCount: 96,
    status: "expired",
    coverSeed: "album-family",
    template: "family",
    expiryDate: new Date("2026-07-02"),
    description: "Buổi chụp ảnh gia đình chị Hoa.",
    customers: [],
  },
  {
    slug: "newborn-soc",
    name: "Newborn — bé Sóc",
    photoCount: 64,
    status: "completed",
    coverSeed: "album-newborn",
    template: "minimal",
    expiryDate: new Date("2026-06-10"),
    description: "Bộ ảnh newborn bé Sóc.",
    customers: [],
  },
];

function galleryPhotoSeeds(prefix: string) {
  return Array.from({ length: 12 }, (_, i) => ({
    filename: `${prefix}${i + 1}.jpg`,
    seed: `${prefix}${i + 1}`,
  }));
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const studio = await prisma.studio.upsert({
    where: { email: "quyen@booksview.vn" },
    update: {},
    create: {
      name: "Trần Lệ Quyên",
      slug: "books-view",
      email: "quyen@booksview.vn",
      passwordHash,
      description: "Studio ảnh cưới & sự kiện tại TP.HCM.",
      phone: "0909 123 456",
    },
  });

  for (const seed of albumSeeds) {
    const album = await prisma.album.upsert({
      where: { linkToken: seed.slug },
      update: {},
      create: {
        studioId: studio.id,
        name: seed.name,
        description: seed.description,
        slug: seed.slug,
        template: seed.template,
        linkToken: seed.slug,
        status: seed.status,
        expiryDate: seed.expiryDate,
        photoCount: seed.photoCount,
      },
    });

    const existingPhotos = await prisma.photo.count({
      where: { albumId: album.id },
    });
    if (existingPhotos === 0) {
      const photos = galleryPhotoSeeds(seed.coverSeed);
      await prisma.photo.createMany({
        data: photos.map((p, i) => ({
          albumId: album.id,
          filename: p.filename,
          originalUrl: `https://picsum.photos/seed/${p.seed}/1200/1200`,
          thumbnailUrl: `https://picsum.photos/seed/${p.seed}/300/300`,
          previewUrl: `https://picsum.photos/seed/${p.seed}/700/700`,
          orderIndex: i,
        })),
      });
    }

    const albumPhotos = await prisma.photo.findMany({
      where: { albumId: album.id },
      orderBy: { orderIndex: "asc" },
    });

    for (const c of seed.customers) {
      const customer = await prisma.customer.upsert({
        where: { albumId_email: { albumId: album.id, email: c.email } },
        update: {},
        create: {
          albumId: album.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
        },
      });

      if (c.selections?.length) {
        await prisma.selection.createMany({
          data: c.selections
            .map((photoIndex) => albumPhotos[photoIndex - 1])
            .filter((p): p is (typeof albumPhotos)[number] => !!p)
            .map((photo) => ({
              customerId: customer.id,
              photoId: photo.id,
              likeType: "star",
            })),
          skipDuplicates: true,
        });
      }
    }
  }

  console.log("Seed complete. Login with quyen@booksview.vn / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
