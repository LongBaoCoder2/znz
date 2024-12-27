import { Container, Row, Col, Button, Image, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import AddParticipantImage from "../assets/add-participant.png";
import MessageImage from "../assets/message.png";
import { useEffect, useRef, useState } from "react";
import { Connector, Publish, Subscribe, MediasoupDevice } from "../usecase/mediasoup";
import { Device } from "mediasoup-client";
import { JoinRequest, Participant } from "../interface/Participant";
import { MicFill, MicMuteFill, CameraVideoFill, CameraVideoOffFill, DisplayFill, PersonFill } from "react-bootstrap-icons";
import UserCard from "../components/UserCard";
import JoinRequestsModal from "../components/JoinRequestsModal";
import WaitingApprovalModal from "../components/WaitingApprovalModal";
// import MyCard from "../components/MyCard";


export let connector: Connector;
let publish: Publish | null = null;
let subscribe: Subscribe;
let device: MediasoupDevice;


// import { useEffect, useRef } from "react";
// import { PersonFill, MicFill, MicMuteFill } from "react-bootstrap-icons";
// import { Card } from "react-bootstrap";
// import { useEffect } from "react";

interface MyCardProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  username: string;
  micOn: boolean;
  cameraOn: boolean;
}

const MyCard = ({ videoRef, username, micOn, cameraOn }: MyCardProps) => {
  useEffect(() => {
    if (videoRef.current && cameraOn && publish?.localStream) {
      videoRef.current.srcObject = publish.localStream;
    }
  }, [videoRef, cameraOn]);
  
  return (
    <Card className="position-relative h-100" style={{ 
      backgroundColor: "#1E2757",
      border: "none",
      maxHeight: "calc(90vh - 2rem)" 
    }}>
      {cameraOn ? (
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
          muted
        />
      ) : (
        <div className="d-flex justify-content-center align-items-center h-100">
          <PersonFill size={72} color="#6c757d"/>
        </div>
      )}
      
      <div className="position-absolute bottom-0 w-100 d-flex justify-content-between p-2"
           style={{ 
             background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
             borderBottomLeftRadius: "0.5rem",
             borderBottomRightRadius: "0.5rem"
           }}>
        <span className="text-white">{username} (You)</span>
        {micOn ? 
          <MicFill color="white" size={16} /> : 
          <MicMuteFill color="red" size={16} />
        }
      </div>
    </Card>
  );
};


function Meeting() {
  const { URI } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [deviceReady, setDeviceReady] = useState(false);
  const [subReady, setSubReady] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  // @ts-ignore
  const [joinStatus, setJoinStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  const initializeDevice = async () => {
    try {
      const routerRtpCapabilities = await connector.sendRequest('getRouterRtpCapabilities', {});
      device = new Device();
      await device.load({ routerRtpCapabilities });
      setDeviceReady(true);
    } catch (error) {
      console.error("[error] Device initialization failed:", error);
    }
  };

  // Handler functions
  const handleMicToggle = () => {
    if (micOn) {
      publish?.pauseProducer("audio");
      setMicOn(false); 
      editVideoAudio('audioOff');
    } else {
      publish?.resumeProducer("audio");
      setMicOn(true);
      editVideoAudio('audioOn');
    }
  }
  const handleCameraToggle = () => {
    if (cameraOn) {
      console.log("handleCameraToggle::cameraOn: true ", publish);
      publish?.pauseProducer("video");
      setCameraOn(false);
      editVideoAudio('videoOff');
    } else {
      console.log("handleCameraToggle::cameraOn: false ", publish);
      publish?.resumeProducer("video");
      console.log(localVideoRef.current);
      setCameraOn(true);
      editVideoAudio('videoOn');
    }
  }
  const handleScreenSharingToggle = () => setScreenSharing((prev) => !prev);


  useEffect(() => {
    return () => {
      if (publish?.localStream) {
        const tracks = publish.localStream.getTracks();
        tracks.forEach(track => track.stop());
      }
      if (connector?.socket) {
        connector.socket.close();
      }
      setJoinStatus(null);
      setShowWaitingModal(false);
    };
  }, []);


  useEffect(() => {
    async function initializeSocket() {
      if (URI) {
        try {
          connector = new Connector(URI, "Long Bao", {
            onWaitingApproval: () => {
              console.log("connector.role: ", connector.role);
              setShowWaitingModal(true);
            },
            onJoinRequest: (request) => {
              setJoinRequests(prev => [...prev, request]);
              setShowRequestsModal(true);
            },
            onJoinRequestApproved: async () => {
              setJoinStatus('approved');
              setShowWaitingModal(false);
              await initializeDevice();
            },
            onJoinRequestRejected: () => {
              setJoinStatus('rejected');
              setShowWaitingModal(false);
              navigate("/");
              // Handle rejection (e.g., redirect to home)
            },
            onMemberJoined: (member: {
              username: string,
              socketId: string,
              joinedAt: Date
            }) => {
              console.log(`New member joined: ${member.username}`);
            },
            onMemberLeft: (socketId: string) => {
              setParticipants(prev => prev.filter(participant => participant.socketId !== socketId));
            }
          });

          await connector.connectServer();
          
          console.log("connector.role: ", connector.role);
          if (connector.role === 'host') {
            await initializeDevice();
          }
          // }
        } catch (error) {
          console.error("[error] Failed to initialize:", error);
        }
      }
    }

    initializeSocket();
  }, [URI]);




  useEffect(() => {
    const initializePublish = async () => {
      if (deviceReady) {
          console.log("Starting subscribe...");
          subscribe = new Subscribe(device, connector);
          connector.setSubscribe(subscribe);
          await subscribe.subscribe();
          console.log("Ending subscribe...");
          setSubReady(true);

          publish = new Publish(device, connector, localVideoRef);
          await publish.publish(true, true)
              .catch((error: any) => {
                  console.error("public error: ", error);
              });

          console.log("participants: ", participants);
          console.log("subscribe: ", subscribe.participants);
      }
    };

    initializePublish();
  },[deviceReady])

    useEffect(() => {
      if (subReady) {
          console.log("participants: ", participants);
          console.log("subscribe: ", subscribe.participants);
          const updateVideo = setInterval(() => {
              setParticipants(subscribe.participants);
          }, 1000);

          return () => {
              clearInterval(updateVideo);
          }
      }

  }, [subReady]);
  

  const handleJoinRequestResponse = (socketId: string, approved: boolean) => {
    connector.socket.emit('join:response', { socketId, approved });
    setJoinRequests(prev => prev.filter(req => req.socketId !== socketId));
    if (joinRequests.length <= 1) {
      setShowRequestsModal(false);
    }
  };

  const editVideoAudio = (op: string) => {
    if(!(publish && publish.localStream)){
        return;
    }
    if(op == 'videoOn' && publish.localStream.getVideoTracks()[0]){
        publish.localStream.getVideoTracks()[0].enabled = true;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = publish.localStream;
        }
    }
    
    if(op == 'videoOff' && publish.localStream.getVideoTracks()[0]){
        publish.localStream.getVideoTracks()[0].enabled = false;
    }
    if(op == 'audioOn' && publish.localStream.getAudioTracks()[0]){
        publish.localStream.getAudioTracks()[0].enabled = true;
    }
    if(op == 'audioOff' && publish.localStream.getAudioTracks()[0]){
        publish.localStream.getAudioTracks()[0].enabled = false;
    }
  }

  return (
    // <Container fluid className="vh-100 d-flex flex-column">
    <Container 
      fluid 
      className="vh-100 d-flex flex-column" 
      style={{ backgroundColor: "#1C1F2E" }}
    >
      <Row style={{ height: "90%" }} >
        {/* <Row className="d-flex flex-row align-items-center">
          <h5 className="text-primary">
            {URI}
          </h5>
        </Row> */}
        <Row className="d-flex flex-row">


        <Col md={9} className="h-100 p-2">
          <MyCard
            videoRef={localVideoRef}
            username="Long Bao"
            micOn={micOn}
            cameraOn={cameraOn}
          />
        </Col>
        
        <Col md={3} className="h-100 p-2" style={{ overflowY: "auto" }}>
          {participants.map((participant: Participant, index: number) => (
            <UserCard 
              key={index} 
              participant={participant} 
            />
          ))}
        </Col>


        </Row>
      </Row>
      
      <Row style={{ height: "10%", backgroundColor: "#161929" }} className="d-flex flex-row align-items-center">
        <Col className="col-2 offset-2">
          <Image
            src={AddParticipantImage}
            style={{ width: "80%" }}
          />
        </Col>



        <Col 
          className="col-2 offset-1 d-flex flex-row justify-content-evenly" 
          >
          {/* Microphone Button */}
          <Button
            variant="primary"
            className="d-flex align-items-center justify-content-center p-2 rounded-circle btn-lg border-0"
            style={micOn ? {} : { backgroundColor: "#1E2757" }}
            onClick={handleMicToggle}
          >
            {micOn ? <MicFill size={18} /> : <MicMuteFill size={18} />}
          </Button>

          {/* Camera Button */}
          <Button
            variant="primary"
            className="d-flex align-items-center justify-content-center p-2 rounded-circle btn-lg border-0"
            style={cameraOn ? {} : { backgroundColor: "#1E2757" }}
            onClick={handleCameraToggle}
          >
            {cameraOn ? <CameraVideoFill size={18} /> : <CameraVideoOffFill size={18} />}
          </Button>

          {/* Screen Sharing Button */}
          <Button
            variant="primary"
            className="d-flex align-items-center justify-content-center p-2 rounded-circle btn-lg border-0" 
            style={screenSharing ? {} : { backgroundColor: "#1E2757" }}
            onClick={handleScreenSharingToggle}
          >
            <DisplayFill size={18} />
          </Button>
        </Col>


        <Col className="col-1 offset-4">
          <Image
            src={MessageImage}
            style={{ width: "50%" }}
          />
        </Col>
      </Row>


      {/* <JoinRequestModal
        show={showJoinRequestModal}
        onHide={() => setShowJoinRequestModal(false)}
        onApprove={() => {
          connector.socket.emit('join:response', { approved: true });
          setShowJoinRequestModal(false);
        }}
        onReject={() => {
          connector.socket.emit('join:response', { approved: false });
          setShowJoinRequestModal(false);
        }}
        username={"Long Bao"}
      /> */}
      {connector?.role === 'host' && joinRequests.length > 0 && (
        <Button 
          variant="primary"
          className="position-fixed top-0 end-0 m-3"
          onClick={() => setShowRequestsModal(true)}
        >
          Pending Requests ({joinRequests.length})
        </Button>
      )}

      <JoinRequestsModal
        show={showRequestsModal}
        onHide={() => setShowRequestsModal(false)}
        requests={joinRequests}
        onResponse={handleJoinRequestResponse}
      />

      <WaitingApprovalModal show={showWaitingModal} />
    </Container >
  );
};

export default Meeting;
