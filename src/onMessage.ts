import { ServerMessageSchema } from "./types/ServerMessage";
import type { ServerMessage } from "./types/ServerMessage";

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
  addHeart: (value: string) => void,
  setPresentCount: (value: number) => void,
) {
  const message = parseRawMessage(rawMessage);
  console.log(message);

  if (message === null) {
    return;
  }

  if (message.data.present) {
    setPresentCount(message.data.present.length);
  } else {
    addHeart(message.message_id);
  }
}
