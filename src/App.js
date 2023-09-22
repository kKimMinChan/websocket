import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [ws, setWs] = useState(null);
  const [status, setStatus] = useState("Disconnected"); // Start WebSocket connection
  const [imageUrl, setImageUrl] = useState("");
  const startConnection = () => {
    const websocket = new WebSocket("ws://192.168.0.9:9000/ws");

    websocket.onopen = () => {
      console.log("WebSocket connection opened.");
      setStatus("Connected");
    };

    websocket.onmessage = (event) => {
      const imageUrl = URL.createObjectURL(
        new Blob([event.data], { type: "image/jpeg" })
      );
      setImageUrl(imageUrl);
    };

    websocket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    websocket.onclose = (event) => {
      console.log("WebSocket connection closed:", event.reason);
      setStatus("Disconnected");
    };

    setWs(websocket);
  }; // Stop WebSocket connection

  const stopConnection = () => {
    if (ws) {
      ws.close();
      setWs(null);
      setStatus("Disconnected");
    }
  };

  const startRecording = async () => {
    const response = await axios.get("http://192.168.0.9:9000/start");
    const data = await response.data;
    console.log(data.status);

    if (data.status.includes("Recording started")) {
      startConnection();
    }
  };

  const stopRecording = async () => {
    stopConnection();

    const response = await axios.get("http://192.168.0.9:9000/stop");
    const data = await response.data;
    console.log(data.status);
  };

  return (
    <div>
            <h1>Status: {status}</h1>     {" "}
      <img src={imageUrl} alt="video stream" />{" "}
      <button onClick={startRecording}>Start Recording</button>     {" "}
      <button onClick={stopRecording}>Stop Recording</button>   {" "}
    </div>
  );
}

export default App;
