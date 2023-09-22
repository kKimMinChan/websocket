import axios from "axios";
import React, { useState } from "react";

const Drop1Video = () => {
  const [ws, setWs] = useState(null);
  const [recording, setRecording] = useState(false);
  const [imageUrl, setImageUrl] = useState(""); // <-- 상태 추가

  const handleStartRecording = async () => {
    try {
      const res = await axios.get("http://192.168.0.9:9000/start");
      const data = res.data;

      if (data.status === "Recording started") {
        setRecording(true);
        const websocket = new WebSocket("ws://192.168.0.9:9000/ws");
        console.log(websocket, "web");
        websocket.onopen = () => {
          console.log("WebSocket Opened");
        };
        websocket.onclose = (event) => {
          if (event.wasClean) {
            console.log(
              `Closed cleanly, code=${event.code}, reason=${event.reason}`
            );
          } else {
            console.error("Connection died");
          }
        };
        websocket.onmessage = (event) => {
          // const arrayBufferView = new Uint8Array(event.data);
          // console.log(arrayBufferView, "view");
          // // console.log("1");
          // const blob = new Blob([arrayBufferView], { type: "image/jpeg" });
          // console.log(blob);
          // setImageUrl(URL.createObjectURL(blob)); // <-- 이미지 URL 상태 업데이트
          const imageUrl = URL.createObjectURL(
            new Blob([event.data], { type: "image/jpeg" })
          );
          setImageUrl(imageUrl);
        };
        websocket.onerror = (error) => {
          console.error("WebSocket Error:", error);
        };
        console.log(imageUrl, "url");
        setWs(websocket);
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const handleStopRecording = async () => {
    try {
      if (ws) {
        ws.close();
        setWs(null);
      }
      const res = await axios.get("http://192.168.0.9:9000/stop");
      console.log(res, "stop res");
      const data = res.data;

      if (data.status === "Recording stopped") {
        setRecording(false);
        setImageUrl(""); // <-- 이미지 URL 초기화
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  return (
    <div className="App">
      <img src={imageUrl} alt="video stream" />{" "}
      {/* <-- 이미지 src에 상태 바인딩 */}
      {!recording && (
        <button onClick={handleStartRecording}>Start Recording</button>
      )}
      {recording && (
        <button onClick={handleStopRecording}>Stop Recording</button>
      )}
    </div>
  );
};

export default Drop1Video;
