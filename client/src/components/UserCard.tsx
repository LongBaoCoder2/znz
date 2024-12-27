import { useEffect, useRef } from "react";
import { Participant } from "../interface/Participant";
import { PersonFill, MicFill, MicMuteFill } from "react-bootstrap-icons";
import { Card } from "react-bootstrap";

const UserCard = ({ participant }: { participant: Participant }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <Card className="mb-3 position-relative" style={{ 
      width: "100%", 
      aspectRatio: "16/9",
      backgroundColor: "#1E2757",
      border: "none"
    }}>
      {participant.videoOn && participant.stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "0.5rem"
          }}
          muted={false}
        />
      ) : (
        <div className="d-flex justify-content-center align-items-center h-100">
          <PersonFill size={48} color="#6c757d"/>
        </div>
      )}
      
      <div className="position-absolute bottom-0 w-100 d-flex justify-content-between p-2"
           style={{ 
             background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
             borderBottomLeftRadius: "0.5rem",
             borderBottomRightRadius: "0.5rem"
           }}>
        <span className="text-white">{participant.username || "Unknown User"}</span>
        {participant.audioOn ? 
          <MicFill color="white" size={16} /> : 
          <MicMuteFill color="red" size={16} />
        }
      </div>
    </Card>
  );
};

export default UserCard;