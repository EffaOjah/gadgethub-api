import prisma from '../src/lib/prisma';

const categories = [
  { id: 'c1', name: 'Smartphone', image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1200' },
  { id: 'c2', name: 'Audio', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1200' },
  { id: 'c3', name: 'Laptop', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200' },
  { id: 'c4', name: 'Gaming', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200' },
  { id: 'c5', name: 'Camera', image: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=1200' },
  { id: 'c6', name: 'Smartwatch', image: 'https://images.unsplash.com/photo-1508921234172-b68ed335b3e6?q=80&w=1200' },
  { id: 'c7', name: 'Tablet', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1200' },
  { id: 'c8', name: 'Printer', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=1200' },
  { id: 'c9', name: 'Television', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1200' },
  { id: 'c10', name: 'Monitor/TV', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200' },
  { id: 'c11', name: 'CPU', image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1200' },
  { id: 'c12', name: 'GPU', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=1200' }
];

const gadgets = [
  {
    id: '1',
    name: 'Samsung Galaxy A54 5G',
    brand: 'Samsung',
    price: 521000,
    categoryId: 'c1',
    image: '/img/latest-Gadget/lp-1.png',
    description: 'The mid-range king in Nigeria. Excellent battery life for long power outages and a bright AMOLED screen.',
    specs: { 'Battery': '5000mAh', 'Screen': '6.4" Super AMOLED', 'RAM': '8GB' }
  },
  {
    id: '2',
    name: 'Tecno Camon 20 Pro',
    brand: 'Tecno',
    price: 285000,
    categoryId: 'c1',
    image: '/img/latest-Gadget/lp-7.png',
    description: 'Aimed at heavy picture takers, the Camon 20 Pro brings high-end camera vibes to a budget price.',
    specs: { 'Camera': '64MP + 2MP', 'Storage': '256GB', 'Processor': 'Helio G99' }
  },
  {
    id: '3',
    name: 'Oraimo Freepods 4',
    brand: 'Oraimo',
    price: 45000,
    categoryId: 'c2',
    image: '/img/hero/model4-removebg-preview.png',
    description: 'Active Noise Cancellation and big bass, specifically tuned for Afrobeats.',
    specs: { 'Battery Life': '35.5 hours with case', 'ANC': 'Yes, up to 30dB' }
  },
  {
    id: '4',
    name: 'MacBook Air M1 (2020)',
    brand: 'Apple',
    price: 1160000,
    categoryId: 'c3',
    image: '/img/latest-Gadget/laptops-removebg-preview.png',
    description: 'Still the best value laptop for Nigerian creatives and programmers. Incredible battery efficiency.',
    specs: { 'Chip': 'Apple M1', 'RAM': '8GB', 'SSD': '256GB' }
  },
  {
    id: '5',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    price: 1856000,
    categoryId: 'c1',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800',
    description: 'The pinnacle of mobile tech. Titanium build, A17 Pro chip, and the best video recording on any smartphone.',
    specs: { 'Chip': 'A17 Pro', 'Storage': '256GB/512GB/1TB', 'Material': 'Titanium' }
  },
  {
    id: '6',
    name: 'Sony PlayStation 5 Slim',
    brand: 'Sony',
    price: 781600,
    categoryId: 'c4',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800',
    description: 'Small, powerful, and ready for 4K gaming. The refined design fits better in Nigerian living rooms.',
    specs: { 'Storage': '1TB SSD', 'Resolution': '4K 120Hz', 'Controller': 'DualSense' }
  }
];

async function main() {
  console.log('Starting DB Seed...');

  // Clean DB
  await prisma.review.deleteMany();
  await prisma.nigerianPrices.deleteMany();
  await prisma.gadget.deleteMany();
  await prisma.category.deleteMany();

  // Create Categories
  for (const c of categories) {
    await prisma.category.create({
      data: {
        id: c.id,
        name: c.name,
        image: c.image,
      }
    });
  }

  // Create Gadgets
  for (const g of gadgets) {
    await prisma.gadget.create({
      data: g
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
