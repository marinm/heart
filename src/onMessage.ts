import { ServerMessageSchema } from "./types/ServerMessage";
import type { ServerMessage } from "./types/ServerMessage";
import type { HeartInfo } from "./types/HeartInfo";

export function handleMessage(
  rawMessage: object,
  addHeart: (heart: HeartInfo) => void,
  setPresentCount: (value: number) => void,
) {
  const message = parseRawMessage(rawMessage);

  if (!message) {
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

function parseRawMessage(rawMessage: object): null | ServerMessage {
  const parseResult = ServerMessageSchema.safeParse(rawMessage);

  if (parseResult.error) {
    console.error("Bad message", rawMessage);
    console.error(parseResult.error);
    return null;
  }

  return parseResult.data;
}
