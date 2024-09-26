import { PrismaClient } from "@prisma/client";

declare global {
  // Declare prisma como uma variável no escopo global de forma opcional
  var prisma: PrismaClient | undefined;
}

// Usa `const` já que prisma não deve ser reatribuído após ser inicializado
const prisma = global.prisma ?? new PrismaClient();

// Se estamos no ambiente de desenvolvimento, a instância é salva no global para reutilização
if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}

export default prisma;
