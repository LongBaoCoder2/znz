import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const VideoConference: React.FC = () => {
  const [socket, setSocket] = useState<any>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Get local video stream
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Connect to socket server
        const socketS = io("https://localhost:8000/sfu");
        socketS.on("connect", () => {
          console.log("Connected to socket server");
          setIsConnected(true);
        });

        socketS.on("getRtpCapabilities", (data: any) => {
          console.log("getRtpCapabilities: ", data);
        });

        socketS.emit("getRtpCapabilities");

        setSocket(socketS);
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    startVideo();
  }, []);

  return (
    <div className='video-conference'>
      <div className='video-grid'>
        <div className='video-container local'>
          <video ref={localVideoRef} autoPlay playsInline muted className='video-player' />
          <div className='label'>You</div>
        </div>
        <div className='video-container remote'>
          <video ref={remoteVideoRef} autoPlay playsInline className='video-player' />
          <div className='label'>Remote User</div>
        </div>
      </div>
      <div className='controls'>
        <button className='control-btn'>{isConnected ? "Disconnect" : "Connect"}</button>
      </div>
    </div>
  );
};

export default VideoConference;
