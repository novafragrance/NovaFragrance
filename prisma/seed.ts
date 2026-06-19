import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';


const databaseString = process.env.DATABASE_URL;

if (!databaseString) {
  throw new Error("CRITICAL: DATABASE_URL is missing from .env");
}

const adapter = new PrismaPg({ connectionString: databaseString });
const prisma = new PrismaClient({ adapter });


// Prisma 7 Requires the Driver Adapter pattern for the seed script too
const adapter = new PrismaPg({ connectionString: databaseString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding the database...');

  // Clean the slate first to avoid duplicate errors
  await prisma.product.deleteMany();

  const products = await prisma.product.createMany({
    data: [
      {
        name: "VETIVER 46",
        slug: "vetiver-46",
        description: "An architectural approach to sensory design. Dark wood, crushed amber, smoked vetiver.",
        price: 290,
        note: "Woody / Earthy",
        imageUrl: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHBlcmZ1bWUlMjBib3R0bGV8ZW58MHx8MHx8fDA%3D",
        tags: ["signature", "woody", "bestseller"],
        stock: 50,
        isAvailable: true,
      },
      {
        name: "AMBRE 114",
        slug: "ambre-114",
        description: "A complex oriental blend featuring warm spices, vanilla, and deep amber resins.",
        price: 210,
        note: "Spicy / Oriental",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqT5t-2VOqV_r7l4Aw3EaPlVMuDrB52IDr3Q&s",
        tags: ["spicy", "evening"],
        stock: 30,
        isAvailable: true,
      },
      {
        name: "OUD WOOD",
        slug: "oud-wood",
        description: "Rare. Exotic. Distinctive. One of the most rare, precious, and expensive ingredients in a perfumer's arsenal.",
        price: 350,
        note: "Rich / Dark",
        imageUrl: "https://images.pexels.com/photos/32630375/pexels-photo-32630375.jpeg?cs=srgb&dl=pexels-fashionneedles-32630375.jpg&fm=jpg",
        tags: ["luxury", "oud", "rare"],
        stock: 15,
        isAvailable: true,
      },
      {
        name: "SANTAL 33",
        slug: "santal-33",
        description: "A unisex fragrance that captures the defining image of the spirit of the American West.",
        price: 290,
        note: "Leather / Musk",
        imageUrl: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800&auto=format&fit=crop",
        tags: ["leather", "musk", "unisex"],
        stock: 45,
        isAvailable: true,
      }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });