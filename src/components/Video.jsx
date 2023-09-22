import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [ws, setWs] = useState(null);

  const startRecording = async () => {
    try {
      const response = axios.get("http://192.168.0.9:9000/start");
      const data = await response.json();
      if (data.status === "Recording started") {
        const websocket = new WebSocket("ws://192.168.0.9:9000/ws");
        websocket.onmessage = (event) => {
          const arrayBufferView = new Uint8Array(event.data);
          const blob = new Blob([arrayBufferView], { type: "image/jpeg" });
          const imageUrl = URL.createObjectURL(blob);
          document.getElementById("videoFrame").src = imageUrl;
        };
        setWs(websocket);
      }
    } catch (e) {
      console.log(e);
    }

    // const response = await fetch("http://192.168.0.9:9000/start");
  };

  const stopRecording = async () => {
    const response = await fetch("http://192.168.0.9:9000/stop");
    const data = await response.json();

    if (data.status === "Recording stopped" && ws) {
      ws.close();
      setWs(null);
      document.getElementById("videoFrame").src = "";
    }
  };

  return (
    <div className="App">
      <img id="videoFrame" alt="video stream" />
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
    </div>
  );
}

export default App;
