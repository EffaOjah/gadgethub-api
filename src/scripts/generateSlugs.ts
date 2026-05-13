import prisma from '../lib/prisma';

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

async function main() {
  const gadgets = await prisma.gadget.findMany();
  console.log(`Found ${gadgets.length} gadgets to update.`);

  for (const gadget of gadgets) {
    if (!gadget.slug) {
      let baseSlug = generateSlug(gadget.name);
      let slug = baseSlug;
      let counter = 1;
      
      // Ensure slug uniqueness
      while (true) {
        const existing = await prisma.gadget.findUnique({ where: { slug } });
        if (!existing || existing.id === gadget.id) {
          break;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      await prisma.gadget.update({
        where: { id: gadget.id },
        data: { slug }
      });
      console.log(`Updated ${gadget.name} -> ${slug}`);
    } else {
      console.log(`Skipped ${gadget.name} (already has slug: ${gadget.slug})`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Finished updating slugs.');
  });
