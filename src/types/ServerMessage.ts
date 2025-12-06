import z from "zod";

export const ServerMessageSchema = z.object({
  connection_id: z.string(),
  message_id: z.string(),
  broadcast_at: z.string(),
  from: z.string(),
  data: z.object({
    present: z.array(z.string()).optional(),
    animation: z.string().optional(),
    timestamp: z.number().optional(),
  }),
});

export type ServerMessage = z.infer<typeof ServerMessageSchema>;
