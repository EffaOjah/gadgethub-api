import prisma from '../src/lib/prisma';

const categories = [
  { id: 'c1', name: 'Smartphones', image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1200', badges: ['⭐ Flagships'] },
  { id: 'c2', name: 'Audio & Music', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1200', badges: ['🔥 Studio Quality'] },
  { id: 'c3', name: 'Computing', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200', badges: ['💻 High Power'] },
  { id: 'c4', name: 'Gaming Zone', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200', badges: ['🎮 Next Gen'] },
  { id: 'c5', name: 'Photography', image: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=1200', badges: ['📸 Cinema'] },
  { id: 'c6', name: 'Smart Life', image: 'https://images.unsplash.com/photo-1508921234172-b68ed335b3e6?q=80&w=1200', badges: ['⌚ Wearables'] },
  { id: 'c7', name: 'gadgets', image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1200', badges: ['⭐ Flagships'] },
  { id: 'c8', name: 'headphones', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1200', badges: ['🔥 Studio Quality'] },
  { id: 'c9', name: 'laptops', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200', badges: ['💻 High Power'] },
  { id: 'c10', name: 'gaming', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200', badges: ['🎮 Next Gen'] },
  { id: 'c11', name: 'cameras', image: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=1200', badges: ['📸 Cinema'] },
  { id: 'c12', name: 'smartwatches', image: 'https://images.unsplash.com/photo-1508921234172-b68ed335b3e6?q=80&w=1200', badges: ['⌚ Wearables'] }
];

const gadgets = [
  {
    id: '1',
    name: 'Samsung Galaxy A54 5G',
    categoryId: 'c7',
    image: '/img/latest-Gadget/lp-1.png',
    originalPrice: 400,
    discount: 12,
    badges: ['🔥 Most Popular'],
    description: 'The mid-range king in Nigeria. Excellent battery life for long power outages and a bright AMOLED screen.',
    specs: { 'Battery': '5000mAh', 'Screen': '6.4" Super AMOLED', 'RAM': '8GB' },
    shortSummary: 'Best mid-range Samsung phone right now. Solid battery, great screen.',
    pros: ['Amazing AMOLED display', '5000mAh battery lasts all day', '4 years of OS updates'],
    cons: ['Charging speed is slow (25W)', 'No charger in the box'],
    prices: { jumia: 520000, konga: 515000, slot: 530000, average: 521000 }
  },
  {
    id: '2',
    name: 'Tecno Camon 20 Pro',
    categoryId: 'c7',
    image: '/img/latest-Gadget/lp-7.png',
    badges: ['Camera Champ'],
    description: 'Aimed at heavy picture takers, the Camon 20 Pro brings high-end camera vibes to a budget price.',
    specs: { 'Camera': '64MP + 2MP', 'Storage': '256GB', 'Processor': 'Helio G99' },
    shortSummary: 'Massive storage and extremely good rear camera for the price.',
    pros: ['Very good night mode camera', 'Comes with 33W fast charger', 'Plenty of storage (256GB)'],
    cons: ['Lots of bloatware/ads out of the box', 'Selfie camera struggles in low light'],
    prices: { jumia: 285000, konga: 280000, slot: 290000, average: 285000 }
  },
  {
    id: '3',
    name: 'Oraimo Freepods 4',
    categoryId: 'c8',
    image: '/img/hero/model4-removebg-preview.png',
    originalPrice: 55,
    discount: 36,
    badges: ['Best Seller', 'Deal'],
    description: 'Active Noise Cancellation and big bass, specifically tuned for Afrobeats.',
    specs: { 'Battery Life': '35.5 hours with case', 'ANC': 'Yes, up to 30dB' },
    shortSummary: 'The undisputed budget king of ANC earbuds in Nigeria.',
    pros: ['Heavy bass (HavyBass tech)', 'ANC actually works well', 'Slide-to-open case is durable'],
    cons: ['Microphone is mediocre for calls on busy streets', 'Touch controls can be overly sensitive'],
    prices: { jumia: 45000, konga: 44000, slot: 46000, average: 45000 }
  },
  {
    id: '4',
    name: 'MacBook Air M1 (2020)',
    categoryId: 'c9',
    image: '/img/latest-Gadget/laptops-removebg-preview.png',
    badges: ['Trending'],
    description: 'Still the best value laptop for Nigerian creatives and programmers. Incredible battery efficiency.',
    specs: { 'Chip': 'Apple M1', 'RAM': '8GB', 'SSD': '256GB' },
    shortSummary: 'Unbeatable battery life for coding without Gen power.',
    pros: ['Battery outlasts local power cuts', 'Totally silent (no fan)', 'Excellent resale value in computer village'],
    cons: ['Only 2 USB-C ports', 'Very expensive screen replacement'],
    prices: { jumia: 1150000, konga: 1140000, slot: 1200000, average: 1160000 }
  },
  {
    id: '5',
    name: 'iPhone 15 Pro Max',
    categoryId: 'c7',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800',
    badges: ['🔥 Ultimate Flagship'],
    description: 'The pinnacle of mobile tech. Titanium build, A17 Pro chip, and the best video recording on any smartphone.',
    specs: { 'Chip': 'A17 Pro', 'Storage': '256GB/512GB/1TB', 'Material': 'Titanium' },
    shortSummary: 'The undisputed heavy hitter. Fast, light, and expensive.',
    pros: ['Titanium feels premium and light', 'Log video recording is game-changing', 'USB-C at last'],
    cons: ['Absurdly expensive in local naira', 'Action button is just okay'],
    prices: { jumia: 1850000, konga: 1840000, slot: 1880000, average: 1856000 }
  },
  {
    id: '6',
    name: 'Sony PlayStation 5 Slim',
    categoryId: 'c10',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800',
    originalPrice: 599,
    discount: 16,
    badges: ['🎮 Gamers Choice', 'Deal'],
    description: 'Small, powerful, and ready for 4K gaming. The refined design fits better in Nigerian living rooms.',
    specs: { 'Storage': '1TB SSD', 'Resolution': '4K 120Hz', 'Controller': 'DualSense' },
    shortSummary: 'The best console for exclusive titles and smooth performance.',
    pros: ['Lightning fast load times', 'DualSense is immersive', 'Smaller footprint'],
    cons: ['Storage fills up too fast with AAA games', 'Heat management is better but not perfect'],
    prices: { jumia: 780000, konga: 775000, slot: 790000, average: 781600 }
  },
  {
    id: '7',
    name: 'Infinix Note 40 Pro',
    categoryId: 'c7',
    image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=800',
    originalPrice: 320,
    discount: 22,
    badges: ['⚡ Fast Charge King', 'Deal'],
    description: '70W fast charging and magnetic wireless charging at a price that makes sense for the hustle.',
    specs: { 'Charging': '70W Wired / 20W Wireless', 'Screen': '120Hz AMOLED', 'Camera': '108MP' },
    shortSummary: 'Unbeatable charging specs for the price.',
    pros: ['Cheapest phone with wireless charging', 'Screen is flagship level', 'Comes with a full kit'],
    cons: ['Processor is not for heavy gaming', 'Software skin is still heavy'],
    prices: { jumia: 360000, konga: 355000, slot: 365000, average: 360000 }
  },
  {
    id: '8',
    name: 'HP Victus 15',
    categoryId: 'c9',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800',
    badges: ['💻 Budget Gaming'],
    description: 'The gateway to serious gaming. Balanced performance for both work and play.',
    specs: { 'GPU': 'RTX 3050', 'CPU': 'Core i5-13th Gen', 'Refresh': '144Hz' },
    shortSummary: 'Solid entry-level gaming laptop that handles most modern titles.',
    pros: ['Great price-to-performance ratio', 'Minimalist design for office work', 'Keyboard feels good'],
    cons: ['Screen brightness is low (250 nits)', 'Battery life is poor (typical for gaming)'],
    prices: { jumia: 1250000, konga: 1240000, slot: 1280000, average: 1256000 }
  },
  {
    id: '9',
    name: 'Sony WH-1000XM5',
    categoryId: 'c8',
    image: 'https://images.unsplash.com/photo-1618366712010-8c0e2474d7c4?q=80&w=800',
    badges: ['🎧 Best ANC'],
    description: 'Silence the noise. The industry-leading noise cancellation now in a sleek, new design.',
    specs: { 'Battery': '30 Hours', 'ANC': 'Industry Leading', 'Charge': 'USB-C' },
    shortSummary: 'The gold standard for noise-cancelling headphones.',
    pros: ['Best noise cancellation on the market', 'Extremely comfortable for long flights', 'Crystal clear call quality'],
    cons: ['Does not fold anymore', 'Case is much larger than XM4'],
    prices: { jumia: 580000, konga: 575000, slot: 595000, average: 583000 }
  },
  {
    id: '10',
    name: 'Dell XPS 13 (2024)',
    categoryId: 'c9',
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=800',
    badges: ['💎 Premium Windows'],
    description: 'The world\'s most iconic thin and light laptop. InfinityEdge display with stunning OLED clarity.',
    specs: { 'CPU': 'Intel Core Ultra 7', 'Display': 'OLED Touch', 'Weight': '1.2kg' },
    shortSummary: 'The ultimate Windows ultraportable.',
    pros: ['Stunning InfinityEdge display', 'Keyboard is surprisingly good', 'Smallest form factor for 13"'],
    cons: ['Only 2 ports', 'Heat issues on heavy loads'],
    prices: { jumia: 2150000, konga: 2130000, slot: 2200000, average: 2160000 }
  },
  {
    id: '11',
    name: 'DJI Mini 4 Pro',
    categoryId: 'c7',
    image: 'https://images.unsplash.com/photo-1473960104312-bf2e12834b54?q=80&w=800',
    badges: ['🚁 Content Creator'],
    description: 'Omini-directional obstacle sensing and 4K vertical video. The best drone under 249g.',
    specs: { 'Weight': '<249g', 'Video': '4K 60fps HDR', 'Sensor': 'Obstacle Avoidance' },
    shortSummary: 'Professional results in a tiny, travel-friendly package.',
    pros: ['No registration needed in many places', 'Omni-sensing is a lifesaver', 'Vertical shooting for TikTok'],
    cons: ['Controller is bulky', 'Wind resistance is low'],
    prices: { jumia: 1150000, konga: 1140000, slot: 1180000, average: 1156000 }
  },
  {
    id: '12',
    name: 'Canon EOS R50',
    categoryId: 'c11',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800',
    badges: ['📸 Vlogging Pro'],
    description: 'Simple, powerful, and compact. The perfect upgrade from your smartphone for high-quality content.',
    specs: { 'Sensor': 'APS-C 24.2MP', 'AF': 'Dual Pixel CMOS AF II', 'Video': '4K 30p' },
    shortSummary: 'The best entry-level mirrorless for creators.',
    pros: ['Excellent autofocus', 'Small and light', 'Built-in creative assist'],
    cons: ['Limited lens selection (RF-S)', 'Small battery life'],
    prices: { jumia: 980000, konga: 975000, slot: 995000, average: 983000 }
  },
  {
    id: '13',
    name: 'Samsung Galaxy Watch 6',
    categoryId: 'c12',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
    badges: ['⌚ Fitness Hub'],
    description: 'Track your health and your tech. Brightest screen yet on a Samsung watch with sleep coaching.',
    specs: { 'Screen': 'Super AMOLED', 'Health': 'ECG/BIA Sensor', 'OS': 'Wear OS 4' },
    shortSummary: 'The best Android smartwatch for health tracking.',
    pros: ['Beautiful large display', 'Seamless with Samsung phones', 'Great fitness tracking'],
    cons: ['Battery barely makes it to 48 hours', 'Charger is still proprietary'],
    prices: { jumia: 380000, konga: 375000, slot: 390000, average: 381000 }
  },
  {
    id: '14',
    name: 'Asus ROG Zephyrus G14',
    categoryId: 'c9',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800',
    originalPrice: 1999,
    discount: 20,
    badges: ['🐲 Peak Power', 'Deal'],
    description: 'The most powerful 14-inch gaming laptop in the world. Stunning Nebula OLED HDR display.',
    specs: { 'GPU': 'RTX 4070', 'CPU': 'Ryzen 9', 'Refresh': '120Hz OLED' },
    shortSummary: 'Unbeatable power-to-size ratio.',
    pros: ['Incredible 120Hz OLED screen', 'Light enough for daily carry', 'Excellent battery efficiency'],
    cons: ['Can get very hot under load', 'Soldered RAM on some models'],
    prices: { jumia: 2450000, konga: 2430000, slot: 2500000, average: 2460000 }
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
        badges: c.badges,
      }
    });
  }

  // Create Gadgets & Prices
  for (const g of gadgets) {
    const { prices, ...gadgetData } = g;
    const gadget = await prisma.gadget.create({
      data: gadgetData
    });

    if (prices) {
      await prisma.nigerianPrices.create({
        data: {
          gadgetId: gadget.id,
          jumia: prices.jumia,
          konga: prices.konga,
          slot: prices.slot,
          average: prices.average
        }
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
