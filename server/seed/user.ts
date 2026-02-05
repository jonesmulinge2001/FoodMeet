/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../generated/prisma/enums';
import 'dotenv/config';

const prisma = new PrismaClient();
                      
async function main() {
  const hashedPassword = await bcrypt.hash('shal00j1010', 10); // hash the password

  const user = await prisma.user.upsert({
    where: { email: 'jonathanmulingemwandi@gmail.com' },
    update: {},
    create: {
      name: 'Jonathan',
      email: 'jonathanmulingemwandi@gmail.com',
      password: hashedPassword, // save hashed password
      role: UserRole.OWNER,
      isVerified: true, // optional
      phone: '+254712345678',
      verifyToken: '', // required field
      verifyTokenExpiresAt: null,
    },
  });

  console.log('Seeded user:', user);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
