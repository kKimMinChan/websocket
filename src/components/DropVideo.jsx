import React, { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useSocket } from "./components/useSocket";
const ItemType = {
  VIDEO: "VIDEO",
};

const VideoItem = ({ video, onMoveBack }) => {
  const [, ref] = useDrag({
    type: ItemType.VIDEO,
    item: { video, outside: true },
  });

  const [, drop] = useDrop({
    accept: ItemType.VIDEO,
    drop: (item) => onMoveBack(item),
  });

  return (
    <div ref={(node) => ref(drop(node))} style={{ backgroundColor: "#999" }}>
      <video src={video.url} width="100" controls />
      <div>{video.title}</div>
    </div>
  );
};

const DropZone = ({ onDrop, video, index, onSwap }) => {
  const [, ref] = useDrop({
    accept: ItemType.VIDEO,
    drop: (item) => {
      // if (item.video.id !== video?.id) {
      if (item.outside === true) {
        onDrop(item.video, index, item.outside);
      } else {
        onSwap(item.video, index, item.outside);
      }
    },
  });

  const [, drag] = useDrag({
    type: ItemType.VIDEO,
    item: { video, outside: false },
    canDrag: () => video !== null && video !== undefined,
  });
  return (
    <div
      ref={(node) => ref(drag(node))}
      style={{
        padding: "8px",
        border: "1px solid black",
        height: "375px",
        width: "650px",
      }}
    >
      {video && (
        <div>
          <video src={video.url} width="650" controls />
          <div>{video.title}</div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [videos, setVideos] = useState([
    // {
    //   id: 1,
    //   title: "비디오 1",
    //   url: "https://www.w3schools.com/html/mov_bbb.mp4",
    // },
    // {
    //   id: 2,
    //   title: "비디오 2",
    //   url: "https://www.w3schools.com/html/mov_bbb.mp4",
    // },
    // {
    //   id: 3,
    //   title: "비디오 3",
    //   url: "https://www.w3schools.com/html/mov_bbb.mp4",
    // },
    // {
    //   id: 4,
    //   title: "비디오 4",
    //   url: "https://www.w3schools.com/html/mov_bbb.mp4",
    // },
    // {
    //   id: 5,
    //   title: "비디오 5",
    //   url: "https://www.w3schools.com/html/mov_bbb.mp4",
    // },
  ]);

  const [droppedVideos, setDroppedVideos] = useState([
    // {
    //   id: 1,
    //   title: "좌",
    //   url: "https://www.w3schools.com/html/mov_bbb.mp4",
    // },
    // {
    //   id: 2,
    //   title: "우",
    //   url: "https://www.w3schools.com/html/mov_bbb.mp4",
    // },
    // {
    //   id: 3,
    //   title: "뒤",
    //   url: "https://www.w3schools.com/html/mov_bbb.mp4",
    // },
    // {
    //   id: 4,
    //   title: "비디오 4",
    //   url: "https://www.w3schools.com/html/mov_bbb.mp4",
    // },
    // {
    //   id: 5,
    //   title: "비디오 5",
    //   url: "https://www.w3schools.com/html/mov_bbb.mp4",
    // },
  ]);

  const socket = useSocket("ws://192.168.0.9/9000/ws");

  useEffect(() => {
    socket.on("update-videos", (updatedVideos) => {
      setVideos(updatedVideos);
    });

    // 웹소켓에서 오는 다른 이벤트들도 여기서 처리 가능
  }, [socket]);

  const handleDrop = (video, index, outside) => {
    if (outside === true) {
      const newDroppedVideos = [...droppedVideos];
      if (droppedVideos[index] === null) {
        newDroppedVideos[index] = video;
        setDroppedVideos(newDroppedVideos);
        setVideos(videos.filter((v) => v.id !== video.id));
      } else {
        const originVideo = droppedVideos[index];
        newDroppedVideos[index] = video;
        setDroppedVideos(newDroppedVideos);
        setVideos(videos.filter((v) => v.id !== video.id));
        setVideos((prev) => [...prev, originVideo]);
      }
    }
    socket.emit("video-dropped", { video, index, outside });
  };

  const handleMoveBack = (item) => {
    if (item.outside === false) {
      setVideos((prev) => [...prev, item.video]);
      setDroppedVideos((prev) =>
        prev.map((v) => (v?.id === item.video.id ? null : v))
      );
    }
  };

  const handleSwap = (draggedVideo, targetIndex, outside) => {
    const i = droppedVideos.indexOf(draggedVideo);
    // if (outside === false && i !== targetIndex) {
    //   const newDroppedVideos = [...droppedVideos];
    //   newDroppedVideos[targetIndex] = draggedVideo;
    //   newDroppedVideos[i] = null;
    //   setDroppedVideos(newDroppedVideos);
    // }
    let newArray = [...droppedVideos];
    let temp = newArray[i];
    newArray[i] = newArray[targetIndex];
    newArray[targetIndex] = temp;
    setDroppedVideos(newArray);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{}}>
        <div style={{ margin: "16px" }}>
          {videos.map((video) => (
            <VideoItem
              key={video.id}
              video={video}
              onMoveBack={handleMoveBack}
            />
          ))}
        </div>

        <div
          style={{ margin: "16px", display: "flex", justifyContent: "center" }}
        >
          {droppedVideos.slice(0, 2).map((video, index) => (
            <DropZone
              key={index}
              video={video}
              index={index}
              onDrop={handleDrop}
              onSwap={handleSwap}
            />
          ))}
        </div>
        <div
          style={{ margin: "16px", display: "flex", justifyContent: "center" }}
        >
          <button
            style={{ width: "120px", height: "40px", marginRight: "30px" }}
          >
            start
          </button>
          <button style={{ width: "120px", height: "40px" }}> stop</button>
          {videos.slice(2, 4).map((video, index) => (
            <DropZone
              key={index}
              video={video}
              index={index}
              onDrop={handleDrop}
              onSwap={handleSwap}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default App;
