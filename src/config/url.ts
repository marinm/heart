import { env } from "./env";

export function getServerUrl(): string {
  return env.BROADCAST_SERVER_URL;
}
