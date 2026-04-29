const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL || "admin@ubonlocal.go.th";
const name = process.env.ADMIN_NAME || "ADMIN Ubon";
const password = process.env.ADMIN_PASSWORD || "12345678!";
const passwordHash =
  process.env.ADMIN_PASSWORD_HASH ||
  "$2a$12$lJNvdmuznRxQoljlo7SfTuol.b0HSGZsN8bel2SXpS9ICO7IM.dCS";

async function main() {
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: "admin",
      healthUnitId: null,
      isActive: true,
      loginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email,
      passwordHash,
      name,
      role: "admin",
      healthUnitId: null,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });

  console.log(
    JSON.stringify(
      {
        user,
        password,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
