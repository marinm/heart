import z from "zod";

const { VITE_BROADCAST_SERVER_URL } = import.meta.env;

export const env = z
  .object({
    BROADCAST_SERVER_URL: z.string(),
  })
  .parse({
    BROADCAST_SERVER_URL: VITE_BROADCAST_SERVER_URL,
  });
