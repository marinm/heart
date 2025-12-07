import { env } from "./env";

export function getServerUrl(): string {
  const channel =
    new URL(window.location.href).searchParams.get("channel") ?? "hearts";

  return `${env.PROTOCOL}://${env.HOST}:${env.PORT}/broadcast?channel=${channel}`;
}
