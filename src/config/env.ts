import z from "zod";

const { VITE_PROTOCOL, VITE_HOST, VITE_PORT } = import.meta.env;

export const env = z
  .object({
    PROTOCOL: z.union([z.string("http"), z.string("https")]).default("http"),
    HOST: z.string().default("localhost"),
    PORT: z.coerce.number().default(3000),
  })
  .parse({
    PROTOCOL: VITE_PROTOCOL,
    HOST: VITE_HOST,
    PORT: VITE_PORT,
  });
