import { Prisma } from "@prisma/client";

// { id?: number, text?: string }
export type MessageUpdatePayload = Prisma.MessageWhereUniqueInput &
  Pick<Prisma.MessageUpdateInput, "text">;