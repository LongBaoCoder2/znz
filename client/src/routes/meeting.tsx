import {
  Container,
  Row,
  Col,
  Form,
  ButtonGroup,
  Button,
  Image,
  Card,
  OverlayTrigger,
  Popover,
  Offcanvas,
  Modal
} from "react-bootstrap";
import addParticipantImage from "../assets/add-participant.svg";
import microphoneOffImage from "../assets/microphone-off.svg";
import microphoneOnImage from "../assets/microphone-on.svg";
import cameraOffImage from "../assets/camera-off.svg";
import cameraOnImage from "../assets/camera-on.svg";
import shareScreenOffImage from "../assets/share-screen-off.svg";
import shareScreenOnImage from "../assets/share-screen-on.svg";
import endCallImage from "../assets/end-call.svg";
import viewMessagesImage from "../assets/view-messages.svg";
import viewParticipantsImage from "../assets/view-participants.svg";
import { useNavigate, useParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import { Connector, Publish, Subscribe, MediasoupDevice } from "../usecase/mediasoup";
import { Device } from "mediasoup-client";
import { JoinRequest, Participant } from "../interface/Participant";
import {
  MicFill,
  MicMuteFill,
  CameraVideoFill,
  CameraVideoOffFill,
  DisplayFill,
  PersonFill
} from "react-bootstrap-icons";
import UserCard from "../components/UserCard";
import JoinRequestsModal from "../components/JoinRequestsModal";
import WaitingApprovalModal from "../components/WaitingApprovalModal";
// import MyCard from "../components/MyCard";

export let connector: Connector;
let publish: Publish | null = null;
let subscribe: Subscribe;
let device: MediasoupDevice;

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
    <Card
      className='position-relative h-100'
      style={{
        backgroundColor: "#1E2757",
        border: "none",
        maxHeight: "calc(90vh - 2rem)"
      }}
    >
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
        <div className='d-flex justify-content-center align-items-center h-100'>
          <PersonFill size={72} color='#6c757d' />
        </div>
      )}

      <div
        className='position-absolute bottom-0 w-100 d-flex justify-content-between p-2'
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
          borderBottomLeftRadius: "0.5rem",
          borderBottomRightRadius: "0.5rem"
        }}
      >
        <span className='text-white'>{username} (You)</span>
        {micOn ? <MicFill color='white' size={16} /> : <MicMuteFill color='red' size={16} />}
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
  const [joinStatus, setJoinStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  const initializeDevice = async () => {
    try {
      const routerRtpCapabilities = await connector.sendRequest("getRouterRtpCapabilities", {});
      device = new Device();
      await device.load({ routerRtpCapabilities });
      setDeviceReady(true);
    } catch (error) {
      console.error("[error] Device initialization failed:", error);
    }
  };

  useEffect(() => {
    console.log("participants updated: ", participants);
  }, [participants]);

  // Handler functions
  const handleMicToggle = () => {
    if (micOn) {
      publish?.pauseProducer("audio");
      setMicOn(false);
      editVideoAudio("audioOff");
    } else {
      publish?.resumeProducer("audio");
      setMicOn(true);
      editVideoAudio("audioOn");
    }
  };

  const handleCameraToggle = () => {
    if (cameraOn) {
      console.log("handleCameraToggle::cameraOn: true ", publish);
      publish?.pauseProducer("video");
      setCameraOn(false);
      editVideoAudio("videoOff");
    } else {
      console.log("handleCameraToggle::cameraOn: false ", publish);
      publish?.resumeProducer("video");
      console.log(localVideoRef.current);
      setCameraOn(true);
      editVideoAudio("videoOn");
    }
  };
  const handleScreenSharingToggle = () => setScreenSharing((prev) => !prev);

  useEffect(() => {
    return () => {
      if (publish?.localStream) {
        const tracks = publish.localStream.getTracks();
        tracks.forEach((track) => track.stop());
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
              setJoinRequests((prev) => [...prev, request]);
              setShowRequestsModal(true);
            },
            onJoinRequestApproved: async () => {
              setJoinStatus("approved");
              setShowWaitingModal(false);
              await initializeDevice();
            },
            onJoinRequestRejected: () => {
              setJoinStatus("rejected");
              setShowWaitingModal(false);
              navigate("/");
              // Handle rejection (e.g., redirect to home)
            },
            onMemberJoined: (member: { username: string; socketId: string; joinedAt: Date }) => {
              console.log(`New member joined: ${member.username}`);
            },
            onMemberLeft: (socketId: string) => {
              setParticipants((prev) => prev.filter((participant) => participant.socketId !== socketId));
            },
            onNewProducer: () => {
              console.log("setParticipants old: ", participants);
              const newParticipants = subscribe.participants.map((participant) => participant);
              setParticipants(newParticipants);
              console.log("setParticipants new: ", participants);
              console.log("newParticipants: ", newParticipants);
            }
          });

          await connector.connectServer();

          console.log("connector.role: ", connector.role);
          if (connector.role === "host") {
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
        try {
          console.log("Starting subscribe...");
          subscribe = new Subscribe(device, connector);
          connector.setSubscribe(subscribe);
          await subscribe.subscribe();
          console.log("Ending subscribe...");
          setSubReady(true);

          publish = new Publish(device, connector, localVideoRef);
          await publish.publish(true, true).catch((error: any) => {
            console.error("public error: ", error);
          });

          console.log("participants: ", participants);
          console.log("subscribe: ", subscribe.participants);
        } catch (error: any) {
          console.error("initializePublish error: ", error);
        }
      }
    };

    initializePublish();
  }, [deviceReady]);

  useEffect(() => {
    if (subReady) {
      console.log("participants: ", participants);
      console.log("subscribe: ", subscribe.participants);
      const updateVideo = setInterval(() => {
        setParticipants(subscribe.participants);
      }, 1000);

      return () => {
        clearInterval(updateVideo);
      };
    }
  }, [subReady]);

  const handleJoinRequestResponse = (socketId: string, approved: boolean) => {
    connector.socket.emit("join:response", { socketId, approved });
    setJoinRequests((prev) => prev.filter((req) => req.socketId !== socketId));
    if (joinRequests.length <= 1) {
      setShowRequestsModal(false);
    }
  };

  const editVideoAudio = (op: string) => {
    if (!(publish && publish.localStream)) {
      return;
    }
    if (op == "videoOn" && publish.localStream.getVideoTracks()[0]) {
      publish.localStream.getVideoTracks()[0].enabled = true;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = publish.localStream;
      }
    }

    if (op == "videoOff" && publish.localStream.getVideoTracks()[0]) {
      publish.localStream.getVideoTracks()[0].enabled = false;
    }
    if (op == "audioOn" && publish.localStream.getAudioTracks()[0]) {
      publish.localStream.getAudioTracks()[0].enabled = true;
    }
    if (op == "audioOff" && publish.localStream.getAudioTracks()[0]) {
      publish.localStream.getAudioTracks()[0].enabled = false;
    }
  };

  const [title, setTitle] = useState("ZNZ");
  const [microphoneState, setMicrophoneState] = useState(false);
  const [cameraState, setCameraState] = useState(false);
  const [shareScreenState, setShareScreenState] = useState(false);
  const [viewParticipantsShow, setViewParticipantsShow] = useState(false);
  const [viewMessagesShow, setViewMessagesShow] = useState(false);
  const [message, setMessage] = useState("");

  const handleEndCallClick = () => {
    console.log("End Call");
  };

  const handleViewParticipantsClick = () => {
    setViewParticipantsShow(true);
  };

  const handleMessageClick = () => {
    setViewMessagesShow(true);
  };

  const handleSendMessageClick = () => {
    console.log("Send Message");
  };

  return (
    <Container fluid className='vh-100 d-flex flex-column'>
      <Row style={{ flex: 1 }} className='align-items-center ps-3'>
        <h4>
          {URI} | {title}
        </h4>
      </Row>

      <Row style={{ flex: 10 }}>
        <Col className='col-9'>
          <MyCard videoRef={localVideoRef} username='Long Bao' micOn={micOn} cameraOn={cameraOn} />
        </Col>

        <Col className='h-100 p-2 col-3' style={{ overflowY: "auto" }}>
          {participants.map((participant: Participant, index: number) => (
            <UserCard key={index} participant={participant} />
          ))}
        </Col>
      </Row>

      <Row style={{ flex: 1 }} className='align-items-center bg-light'>
        <Col className='col-2 offset-1'>
          <OverlayTrigger
            trigger='click'
            placement='top'
            overlay={
              <Popover>
                <Popover.Header as='h3'>Popover right</Popover.Header>
                <Popover.Body>
                  And here's some <strong>amazing</strong> content. It's very engaging. right?
                </Popover.Body>
              </Popover>
            }
          >
            <Image src={addParticipantImage} style={{ width: "75%", cursor: "pointer" }} />
          </OverlayTrigger>
        </Col>
        <Col className='col-2 offset-2 d-flex justify-content-around'>
          <Image
            src={microphoneState ? microphoneOnImage : microphoneOffImage}
            style={{ width: "20%", cursor: "pointer" }}
            onClick={handleMicToggle}
          />
          <Image
            src={cameraState ? cameraOnImage : cameraOffImage}
            style={{ width: "20%", cursor: "pointer" }}
            onClick={handleCameraToggle}
          />
          <Image
            src={shareScreenState ? shareScreenOnImage : shareScreenOffImage}
            style={{ width: "20%", cursor: "pointer" }}
            onClick={handleScreenSharingToggle}
          />
        </Col>
        <Col className='col-1'>
          <Image src={endCallImage} className='w-100' style={{ cursor: "pointer" }} onClick={handleEndCallClick} />
        </Col>
        <Col className='col-2 offset-2 d-flex justify-content-around'>
          <Image
            src={viewParticipantsImage}
            style={{ width: "60%", cursor: "pointer" }}
            onClick={handleViewParticipantsClick}
          />
          <Image src={viewMessagesImage} style={{ width: "20%", cursor: "pointer" }} onClick={handleMessageClick} />
        </Col>
      </Row>

      <Offcanvas show={viewParticipantsShow} onHide={() => setViewParticipantsShow(false)} placement='end'>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Participants</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists,
          etc.
        </Offcanvas.Body>
      </Offcanvas>

      <Offcanvas show={viewMessagesShow} onHide={() => setViewMessagesShow(false)} placement='end'>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Messages</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists,
          etc.
        </Offcanvas.Body>
      </Offcanvas>

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
      {connector?.role === "host" && joinRequests.length > 0 && (
        <Button variant='primary' className='position-fixed top-0 end-0 m-3' onClick={() => setShowRequestsModal(true)}>
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
    </Container>
  );
}

export default Meeting;
