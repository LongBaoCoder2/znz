import { Container, Row, Col, Button, Image, Card, OverlayTrigger, Popover, Offcanvas, Modal, Spinner } from "react-bootstrap";
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
import { MicFill, MicMuteFill, CameraVideoFill, CameraVideoOffFill, DisplayFill, PersonFill } from "react-bootstrap-icons";
import UserCard from "../components/UserCard";
import JoinRequestsModal from "../components/JoinRequestsModal";
import WaitingApprovalModal from "../components/WaitingApprovalModal";

// Error handle - notify modal when failed
import { MediasoupError, MediasoupErrorKind } from "../usecase/mediasoup/error";
// Chat Service
import { ChatService, useChat } from "../usecase/chat";
import { ChatPanel } from "../components/ChatPanel";
import { useAuth } from "../store/AuthContext";
import { useNotify } from "../store/NotifyContext";

export let connector: Connector;
let publish: Publish | null = null;
let subscribe: Subscribe;
let device: MediasoupDevice;
export let chatService: ChatService;

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
          <PersonFill size={72} color="#6c757d" />
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
  const { user, loading } = useAuth();
  const username = user?.displayName || "Participant";

  // const mountedRef = useRef(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [deviceReady, setDeviceReady] = useState(false);
  const [subReady, setSubReady] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  // @ts-ignore
  const [joinStatus, setJoinStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  // A modal to show messages: error or success
  // Example: new member joined or error when setting device
  const { showMessage } = useNotify();


  const [showChat, setShowChat] = useState(false);
  const [chatService, setChatService] = useState<ChatService | null>(null);
  const { messages, sendMessage } = useChat(chatService as any);
  

  const initializeDevice = async () => {
    try {
      const routerRtpCapabilities = await connector.sendRequest('getRouterRtpCapabilities', {});
      device = new Device();
      await device.load({ routerRtpCapabilities });
      setDeviceReady(true);
    } catch (error) {
      console.error("[error] Device initialization failed:", error);
      throw MediasoupError.deviceLoad(error);
    }
  };

  const notifyNewParticipant = (username: string) => {
    showMessage(`${username} has joined the room`, 'success');
  };

  useEffect(() => {
    if (loading) return; 
  }, [loading]);

  // Handler functions
  const handleMicToggle = async () => {
    if (micOn) {
      publish?.pauseProducer("audio");
      setMicOn(false);
      editVideoAudio('audioOff');
    } else {
      try {
        if (!publish?.isPublishingAudio) {
          await publish?.startPublishingAudio();
        }
        else {
          publish?.resumeProducer("audio");
        }
        console.log(localVideoRef.current);
        setMicOn(true);
        editVideoAudio('audioOn');
      } catch (error) {
        showMessage(`Error starting audio: ${error}`, 'error');
        setMicOn(false);
      }
    }
  };

  const handleCameraToggle = async () => {
    if (cameraOn) {
      publish?.pauseProducer("video");
      setCameraOn(false);
      editVideoAudio('videoOff');
    } else {
      try {
        if (!publish?.isPublishingVideo) {
          await publish?.startPublishingVideo();
        }
        else {
          publish?.resumeProducer("video");
        }
        console.log(localVideoRef.current);
        setCameraOn(true);
        editVideoAudio('videoOn');
      } catch (error) {
        showMessage(`Error starting video: ${error}`, 'error');
        setCameraOn(false);
      }
    }
  };
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
      // mountedRef.current = false;
    };
  }, []);


  useEffect(() => {
    async function initializeSocket() {
      if (URI) {
        try {
          console.log("user: ", user);
          console.log("username: ", username);
          connector = new Connector(URI, username, {
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
              joinedAt: Date;
            }) => {
              // Show modal for notifying the user joins 
              console.log(`New member joined: ${member.username}`);
              notifyNewParticipant(member.username);
            },
            onMemberLeft: (socketId: string) => {
              setParticipants(prev => prev.filter(participant => participant.socketId !== socketId));
            },
            onNewProducer: () => {
              setParticipants([...subscribe.participants]);
            },
            onSetStateParticipants: () => {
              setParticipants([...subscribe.participants]);
            },
          });

          await connector.connectServer();

          // Chat Service to connect to the server
          const newChatService = new ChatService(connector.socket);
          setChatService(newChatService);

          if (connector.role === 'host') {
            await initializeDevice();
          }
        } catch (error) {

          // Error handle - notify modal when failed
          if (error instanceof MediasoupError) {
            switch (error.kind) {
              case MediasoupErrorKind.ROOM_NOT_FOUND:
                setCameraOn(false);
                setMicOn(false);
                showMessage(error.message, 'error');

                navigate("/");
                break;
              case MediasoupErrorKind.ROOM_IS_FULL:
                setCameraOn(false);
                setMicOn(false);
                showMessage(error.message, 'error');

                navigate("/");
                break;
              // ... handle other cases
            }
          }
        }
      }
    }

    initializeSocket();

    // Cleanup
    return () => {
      chatService?.dispose();
    };
  }, [URI]);



  useEffect(() => {
    const initializePublish = async () => {
      if (deviceReady) {
        try {
          subscribe = new Subscribe(device, connector);
          connector.setSubscribe(subscribe);
          await subscribe.subscribe();
          setSubReady(true);

          publish = new Publish(device, connector, localVideoRef);
          await publish.enumerateDevices();
          // await publish.publish(cameraOn, micOn)
          if (cameraOn) {
            await publish.startPublishingVideo();
          } 

          if (micOn) {
            await publish.startPublishingAudio();
          }
        } catch (error: any) {

          // Error handle - notify modal when failed
          if (error instanceof MediasoupError) {
            switch (error.kind) {
              case MediasoupErrorKind.DeviceLoadFailed:
                setCameraOn(false);
                setMicOn(false);
                showMessage(error.message, 'error');
                break;
              case MediasoupErrorKind.RtpCapabilitiesFailed:
                // Handle RTP capabilities failure
                break;
              // ... handle other cases
            }
          }
        }
      }
    };

    initializePublish();
  }, [deviceReady]);

  useEffect(() => {
    if (subReady) {
      const updateVideo = setInterval(() => {
        setParticipants(subscribe.participants);
      }, 1000);

      return () => {
        clearInterval(updateVideo);
      };
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
    if (!(publish && publish.localStream)) {
      return;
    }
    if (op == 'videoOn' && publish.localStream.getVideoTracks()[0]) {
      publish.localStream.getVideoTracks()[0].enabled = true;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = publish.localStream;
      }
    }

    if (op == 'videoOff' && publish.localStream.getVideoTracks()[0]) {
      publish.localStream.getVideoTracks()[0].enabled = false;
    }
    if (op == 'audioOn' && publish.localStream.getAudioTracks()[0]) {
      publish.localStream.getAudioTracks()[0].enabled = true;
    }
    if (op == 'audioOff' && publish.localStream.getAudioTracks()[0]) {
      publish.localStream.getAudioTracks()[0].enabled = false;
    }
  };


  const [title, setTitle] = useState("ZNZ");
  const [viewParticipantsShow, setViewParticipantsShow] = useState(false);
  const [viewMessagesShow, setViewMessagesShow] = useState(false);

  const handleEndCallClick = async () => {
    setIsDisconnecting(true);
    try {
      if (publish) {
        await publish.stopPublishing();
      }
      if (subscribe) {
        await subscribe.leave();
      }
      if (connector) {
        connector.disconnect();
      }
      // Reset states
      setParticipants([]);
      setCameraOn(false);
      setMicOn(false);
      // Close modals
      setShowWaitingModal(false);
      setShowRequestsModal(false);
      // Clear local video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      navigate("/home");
      // if (mountedRef.current) {
      //   navigate("/");
      // }
    } catch (error) {
      console.error('Error during disconnection:', error);
      // Optionally notify the user
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleViewParticipantsClick = () => {
    setViewParticipantsShow(true);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Row>
          <Col className="text-center">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            {/* <p className="mt-2">Loading your profile...</p> */}
          </Col>
        </Row>
      </Container>
    );
  }


  return (
    <Container fluid className="vh-100 d-flex flex-column">
      <Row style={{ flex: 1 }} className="align-items-center ps-3">
        <h4>
          {URI} | {title}
        </h4>
      </Row>

      <Row style={{ flex: 10 }}>
        <Col className="col-9">
          <MyCard
            videoRef={localVideoRef}
            username={username}
            micOn={micOn}
            cameraOn={cameraOn}
          />
        </Col>

        <Col className="h-100 p-2 col-3" style={{ overflowY: "auto" }}>
          {participants.map((participant: Participant, index: number) => (
            <UserCard
              key={index}
              participant={participant}
            />
          ))}
        </Col>
      </Row>

      <Row style={{ flex: 1 }} className="align-items-center bg-light">
        <Col className="col-2 offset-1">
          <OverlayTrigger trigger="click" placement="top" overlay={
            <Popover>
              <Popover.Header as="h3">Popover right</Popover.Header>
              <Popover.Body>
                And here's some <strong>amazing</strong> content. It's very engaging.
                right?
              </Popover.Body>
            </Popover>
          }>
            <Image
              src={addParticipantImage}
              style={{ width: "75%", cursor: "pointer" }}
            />
          </OverlayTrigger>
        </Col>
        <Col className="col-2 offset-2 d-flex justify-content-around">
          <Image
            src={micOn ? microphoneOnImage : microphoneOffImage}
            style={{ width: "20%", cursor: "pointer" }}
            onClick={handleMicToggle}
          />
          <Image
            src={cameraOn ? cameraOnImage : cameraOffImage}
            style={{ width: "20%", cursor: "pointer" }}
            onClick={handleCameraToggle}
          />
          <Image
            src={screenSharing ? shareScreenOnImage : shareScreenOffImage}
            style={{ width: "20%", cursor: "pointer" }}
            onClick={handleScreenSharingToggle}
          />
        </Col>
        <Col className="col-1">
          {/* <Image
            src={endCallImage}
            className="w-100"
            style={{ cursor: "pointer" }}
            onClick={handleEndCallClick}
          /> */}

          <Button disabled={isDisconnecting} onClick={handleEndCallClick}>
            {isDisconnecting ? 'Ending Call...' : 'End Call'}
          </Button>
        </Col>
        <Col className="col-2 offset-2 d-flex justify-content-around">
          <Image
            src={viewParticipantsImage}
            style={{ width: "60%", cursor: "pointer" }}
            onClick={handleViewParticipantsClick}
          />
          <Image
            src={viewMessagesImage}
            style={{ width: "20%", cursor: "pointer" }}
            onClick={() => setShowChat(!showChat)}
          />
        </Col>
      </Row>

      
      {/* Chat panel */}
      <Offcanvas show={viewParticipantsShow} onHide={() => setViewParticipantsShow(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Participants</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          Some text as placeholder. In real life you can have the elements you
          have chosen. Like, text, images, lists, etc.
        </Offcanvas.Body>
      </Offcanvas>

      <Offcanvas show={viewMessagesShow} onHide={() => setViewMessagesShow(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Messages</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          Some text as placeholder. In real life you can have the elements you
          have chosen. Like, text, images, lists, etc.
        </Offcanvas.Body>
      </Offcanvas>

      {/* Chat panel */}
      <Offcanvas show={showChat} onHide={() => setShowChat(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Chat</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {chatService && (
            <ChatPanel
              messages={messages}
              onSendMessage={sendMessage}
              currentUserId={connector?.socket.id || ''}
            />
          )}
        </Offcanvas.Body>
      </Offcanvas>

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
