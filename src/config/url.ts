export function getServerUrl(): string {
  const channel =
    new URL(window.location.href).searchParams.get("channel") ?? "hearts";

  return `http://localhost:3001/broadcast?channel=${channel}`;
}
