import prisma from "../src/server/db.ts";

async function check() {
  const users = await prisma.user.findMany({
    include: {
      clientProfile: true,
      coachProfile: {
        include: {
          clients: {
            include: {
              user: true
            }
          }
        }
      }
    }
  });

  console.log("USERS & PROFILES:");
  console.log(JSON.stringify(users, null, 2));
}

check().catch(console.error);
