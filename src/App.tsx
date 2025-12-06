import "./App.css";
import { useEffect, useCallback, useState } from "react";
import { useBroadcastWebSocket } from "./hooks/useBroadcastWebSocket";
import { useTemporaryState } from "./hooks/useTemporaryState";
import classNames from "classnames";
import { NumberOnline } from "./components/NumberOnline";
import { HeartIcon } from "./components/HeartIcon";
import { useTemporarySet } from "./hooks/useTemporarySet";
import { handleMessage } from "./onMessage";
import type { HeartInfo } from "./types/HeartInfo";
import { getServerUrl } from "./config/url";
import { randomAnimationName } from "./constants/animations";

function App() {
  const webSocket = useBroadcastWebSocket();
  const { open } = webSocket;

  const [isTapped, setIsTappedTemporariy] = useTemporaryState(false, 555);
  const [onlineUserCount, setOnlineUserCount] = useState(0);
  const [hearts, addHeartTemporarily] = useTemporarySet<HeartInfo>(1500);

  const serverUrl = getServerUrl();

  const onMessage = useCallback(
    (rawMessage: object) => {
      handleMessage(rawMessage, addHeartTemporarily, setOnlineUserCount);
    },
    [addHeartTemporarily, setOnlineUserCount],
  );

  const tap = () => {
    setIsTappedTemporariy(true);

    switch (webSocket.readyState) {
      case WebSocket.CLOSED: {
        webSocket.open(serverUrl);
        return;
      }
      case WebSocket.OPEN: {
        webSocket.send({
          data: { timestamp: Date.now(), animation: randomAnimationName() },
        });
      }
    }
  };

  useEffect(() => {
    webSocket.onMessage(onMessage);
  }, [webSocket, onMessage]);

  useEffect(() => {
    open(serverUrl);
  }, [open, serverUrl]);

  return (
    <>
      <div onClick={tap}>
        <HeartIcon
          className={classNames("big-heart", {
            grayscale: webSocket.readyState !== WebSocket.OPEN,
            tapped: isTapped,
          })}
        />
      </div>
      <div className="stats-layer">
        <NumberOnline count={onlineUserCount} />
      </div>
      <div className="small-hearts-layer">
        {[...hearts].map((heartInfo) => (
          <HeartIcon
            className={classNames("small-heart", heartInfo.animation)}
            key={heartInfo.id}
          />
        ))}
      </div>
    </>
  );
}

export default App;
