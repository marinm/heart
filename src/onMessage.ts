import { ServerMessageSchema } from "./types/ServerMessage";
import type { ServerMessage } from "./types/ServerMessage";
import type { HeartInfo } from "./types/HeartInfo";

function parseRawMessage(rawMessage: object): null | ServerMessage {
  try {
    return ServerMessageSchema.parse(rawMessage);
  } catch (error) {
    console.error("Bad message", rawMessage);
    console.error(error);
    return null;
  }
}

export function onMessage(
  rawMessage: object,
  addHeart: (heart: HeartInfo) => void,
  setPresentCount: (value: number) => void,
) {
  const message = parseRawMessage(rawMessage);

  if (message === null) {
    return;
  }

  if (message.data.present) {
    setPresentCount(message.data.present.length);
  } else {
    addHeart({
      id: message.message_id,
      animation: message.data.animation ?? "",
    });
  }
}
