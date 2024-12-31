import { Container, Row, Col, Button, Card, OverlayTrigger, Popover, Modal, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import { Connector, Publish, Subscribe, MediasoupDevice } from "../usecase/mediasoup";
import { Device } from "mediasoup-client";
import { JoinRequest, Participant } from "../interface/Participant";
import { PersonFillAdd, MicFill, MicMuteFill, CameraVideo, CameraVideoOff, Display, Cast, PersonFill, PeopleFill, ChatDots, Chat, PersonCircle, Grid1x2, LayoutSidebarReverse } from "react-bootstrap-icons";
import UserCard from "../components/UserCard";
import JoinRequestsModal from "../components/JoinRequestsModal";
import WaitingApprovalModal from "../components/WaitingApprovalModal";
import { ChatNotification, ChatNotificationContainer } from "../components/ChatNotification";

// Error handle - notify modal when failed
import { MediasoupError, MediasoupErrorKind } from "../usecase/mediasoup/error";
// Chat Service
import { ChatMessage, ChatService, useChat } from "../usecase/chat";
import { ChatPanel } from "../components/ChatPanel";
import { useAuth } from "../store/AuthContext";
import { useNotify } from "../store/NotifyContext";

export let connector: Connector;
let publish: Publish | null = null;
let subscribe: Subscribe;
let device: MediasoupDevice;
export let chatService: ChatService;
const title = "ZNZ";

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
    // <Card className="h-100" style={{
    //   backgroundColor: "#1E2757",
    //   border: "none",
    //   maxHeight: "100%",
    // }}>
    <Card style={{
      height: "100%",
      aspectRatio: "16/9",
      objectFit: "cover",
      border: "none",
      minHeight: "80vh",
      backgroundColor: "#1E2757",
    }}>
      {cameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            height: "100%",
            aspectRatio: "16/9",
            objectFit: "cover",
            overflow: "hidden",
            borderRadius: "0.5rem"
          }}
          muted
        />
      ) : (
        <div className="d-flex flex-fill justify-content-center align-items-center" style={{
          height: "100%",
          aspectRatio: "16/9",
          objectFit: "cover",
        }}>
          <PersonFill size={72} color="#6c757d" />
        </div>
      )}

      <div className="position-absolute bottom-0 w-100 d-flex justify-content-between py-2 px-3"
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


    // </Card>
  );
};

function Meeting() {
  const { URI } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [username, setUsername] = useState("Participant");
  const [spotlight, setSpotlight] = useState(true);

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

  // Chat service
  const [chatService, setChatService] = useState<ChatService | null>(null);
  const { messages, sendMessage } = useChat(chatService as any);

  const [viewParticipantsShow, setViewParticipantsShow] = useState(false);
  const [viewMessagesShow, setViewMessagesShow] = useState(false);

  const [notifications, setNotifications] = useState<Array<{ id: number; user: string; message: string; }>>([]);
  const notificationCounterRef = useRef(0);

  const [isUserReady, setIsUserReady] = useState(false);

  const [showShareButtons, setShowShareButtons] = useState(false);
  const [isCopiedUri, setIsCopiedUri] = useState(false);

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
    showMessage("Member join", `${username} has joined the room`, 'success');
  };

  useEffect(() => {
    if (!loading) {
      if (user) {
        setUsername(user.displayName || "Participant");
      }
      setIsUserReady(true);
    }
  }, [loading, user]);

  // Handler functions
  const handleMicToggle = async () => {
    if (micOn) {
      publish?.pauseProducer("audio");
      setMicOn(false);
      editVideoAudio("audioOff");
      showMessage("Micro", "Micro off", "error");
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
        showMessage("Micro", "Mic on", "success");

      } catch (error) {
        showMessage("Audio error", `Error starting audio: ${error}`, 'error');
        setMicOn(false);
      }
    }
  };

  const handleCameraToggle = async () => {
    if (cameraOn) {
      publish?.pauseProducer("video");
      setCameraOn(false);
      editVideoAudio('videoOff');
      showMessage("Camera", "Camera off", "error");

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
        showMessage("Camera", "Camera on", "success");    
      } catch (error) {
        showMessage("Video error", `Error starting video: ${error}`, 'error');
        setCameraOn(false);
      }
    }
  };

  const handleScreenSharingToggle = () => {
    setScreenSharing((prev) => !prev);
    if(!screenSharing) {
      showMessage("Screen", "Screen Sharing", "success");
    }
    else {
      showMessage("Screen", "Stop Sharing", "error");
    }
  }


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
      if (URI && isUserReady) {
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
              // navigate("/");
              // Handle rejection (e.g., redirect to home)
            },
            onMemberJoined: (member: {
              username: string,
              socketId: string,
              joinedAt: Date;
              isAudioMuted: boolean;
              isVideoMuted: boolean;
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
          showMessage("Meeting", "Meeting joined successfully", "success");
        } catch (error) {

          // Error handle - notify modal when failed
          if (error instanceof MediasoupError) {
            switch (error.kind) {
              case MediasoupErrorKind.ROOM_NOT_FOUND:
                setCameraOn(false);
                setMicOn(false);
                showMessage("Room error", error.message, 'error');

                navigate("/");
                break;
              case MediasoupErrorKind.ROOM_IS_FULL:
                setCameraOn(false);
                setMicOn(false);
                showMessage("Room error", error.message, 'error');

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
  }, [URI, isUserReady]);

  useEffect(() => {
    if (chatService) {
      const handleMessage = (message: ChatMessage) => {
        if (message.senderId !== connector?.socket.id) {
          const id = notificationCounterRef.current++;
          setNotifications(prev => [...prev, {
            id,
            user: message.senderName,
            message: message.content
          }]);
        }
      };

      chatService.addMessageListener(handleMessage);
      return () => chatService.removeMessageListener(handleMessage);
    }
  }, [chatService, connector]);

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
                showMessage("Device error", error.message, 'error');
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

  const handleEndCallClick = async () => {
    setIsDisconnecting(true);
    try {
      if (publish) {
        await publish.stopPublishing();
      }
      if (subscribe) {
        await subscribe.leave();
        
        // console.log("You have successfully left the room");
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
      showMessage("Meeting", "You have successfully left the room", "success");   
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
    setViewParticipantsShow(!viewParticipantsShow);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const handleCopyToClipboard = (text: string) => {
    return navigator.clipboard.writeText(text);
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
    <Container fluid className="vh-100 d-flex flex-column" style={{ backgroundColor: "#1C1F2E" }}>
      <Row style={{ flex: 1 }} className="align-items-center ps-3 bg-light">
        <h4 className="text-primary">
          {URI} | {title}
        </h4>
      </Row>

      <Row style={{ flex: 10 }} className="d-flex justify-content-center align-items-center">
        {spotlight ? (
          <Col className="col-9 p-3 d-flex justify-content-center align-items-center">
            <MyCard
              videoRef={localVideoRef}
              username={username}
              micOn={micOn}
              cameraOn={cameraOn}
            />
          </Col>
        ) : (
          <Col className="p-3 d-flex flex-row justify-content-around align-items-center">
            <MyCard
              videoRef={localVideoRef}
              username={username}
              micOn={micOn}
              cameraOn={cameraOn}
            />
            <Col className="h-100 p-2 col-3 align-self-start" style={{ maxHeight: "80vh", overflowY: "auto", scrollbarWidth: "none" }}>
              {participants.map((participant: Participant, index: number) => (
                <UserCard
                  key={index}
                  participant={participant}
                />
              ))}
            </Col>
          </Col>
        )}

        {viewParticipantsShow && (
          <Col className="col-3 h-100 text-light p-3" style={{ backgroundColor: "#1F2335" }}>
            <h5 className="mb-3">
              Participants
            </h5>
            <span className="my-4 d-flex align-items-center">
              <PersonCircle size={24} className="ms-3 me-4" />
              {username} (You)
            </span>
            {participants.map((participant: Participant) => (
              <span className="my-4 d-flex align-items-center">
                <PersonCircle size={24} className="ms-3 me-4" />
                {participant.username}
              </span>
            ))}
          </Col>
        )}

        {viewMessagesShow && (
          <Col className="col-3 h-100 p-0" style={{ backgroundColor: "#1F2335" }}>
            {chatService && (
              <ChatPanel
                messages={messages}
                onSendMessage={sendMessage}
                currentUserId={connector?.socket.id || ''}
              />
            )}

          </Col>
        )}
      </Row>

      <Row style={{ flex: 1, backgroundColor: "#161929" }} className="align-items-center py-2" >
        <Col className="col-2 offset-1">
          <OverlayTrigger trigger="click" placement="top" overlay={
            <Popover>
              <Popover.Header as="h3">Meeting information</Popover.Header>
              <Popover.Body>
                <p><strong>URI:</strong> {URI}</p>
              </Popover.Body>
              <div className="d-flex gap-1">
                <Button
                  variant="secondary"
                  className="w-100"
                  onClick={() => setShowShareButtons(!showShareButtons)}
                >
                  Chia sẻ với bạn bè
                </Button>
              </div>
              {showShareButtons && (
                <div className="mt-2 d-flex flex-column gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      handleCopyToClipboard(URI || '')
                        .then(() => setIsCopiedUri(true));
                    }}
                  >
                    {isCopiedUri ? "Đã sao chép URI" : "Sao chép URI"}
                  </Button>
                </div>
              )}
            </Popover>
          }>
            <Button
              variant="primary"
              className="d-flex justify-content-around align-items-center"
              style={{ height: "50px", width: "80%", cursor: "pointer", backgroundColor: "#1E2757", borderRadius: "50px" }}
            >
              <span className="fw-medium" style={{ color: "#1A71FF" }}>Add Participant</span>
              <PersonFillAdd size={25} style={{ color: "#1A71FF" }} />
            </Button>
          </OverlayTrigger>
        </Col>

        <Col className="col-2 offset-1 d-flex justify-content-between">
          <Button style={{ height: "50px", aspectRatio: 1, borderRadius: "50px", backgroundColor: micOn ? "#1A71FF" : "#DA6565", display: "flex", justifyContent: "center", alignItems: "center", border: 0 }} onClick={handleMicToggle}>
            {micOn ? <MicFill size={20} /> : <MicMuteFill size={20} />}
          </Button>
          <Button style={{ height: "50px", aspectRatio: 1, borderRadius: "50px", backgroundColor: cameraOn ? "#1A71FF" : "#DA6565", display: "flex", justifyContent: "center", alignItems: "center", border: 0 }} onClick={handleCameraToggle}>
            {cameraOn ? <CameraVideo size={20} /> : <CameraVideoOff size={20} />}
          </Button>
          <Button style={{ height: "50px", aspectRatio: 1, borderRadius: "50px", backgroundColor: screenSharing ? "#1A71FF" : "#DA6565", display: "flex", justifyContent: "center", alignItems: "center", border: 0 }} onClick={handleScreenSharingToggle}>
            {screenSharing ? <Display size={20} /> : <Cast size={20} />}
          </Button>
          <Button style={{ height: "50px", aspectRatio: 1, borderRadius: "50px", backgroundColor: "#1E2757", display: "flex", justifyContent: "center", alignItems: "center", color: "#1A71FF" }}
            onClick={() => {
              setViewMessagesShow(false);
              setViewParticipantsShow(false);
              setSpotlight(!spotlight);
            }}>
            {spotlight ? <Grid1x2 size={20} /> : <LayoutSidebarReverse size={20} />}
          </Button>
        </Col>

        <Col className="col-2 d-flex ps-5">
          <Button className="fw-medium" disabled={isDisconnecting} onClick={handleEndCallClick} style={{ height: "50px", width: "50%", cursor: "pointer", backgroundColor: "#FF4949", borderRadius: "50px", border: 0 }}>
            {isDisconnecting ? 'Ending Call...' : 'End Call'}
          </Button>
        </Col>
        
        <Col className="col-3 offset-1 d-flex justify-content-evenly">
          <Button
            variant="primary"
            className="d-flex justify-content-around align-items-center"
            style={{ height: "50px", width: "50%", cursor: "pointer", backgroundColor: "#1E2757", borderRadius: "50px" }}
            onClick={() => {
              setViewMessagesShow(false);
              setSpotlight(true);
              setViewParticipantsShow(!viewParticipantsShow);
            }}
          >
            <span className="fw-medium" style={{ color: "#1A71FF" }}>View Participants</span>
            <PeopleFill size={25} style={{ color: "#1A71FF" }} />
          </Button>
          <Button style={{ height: "50px", aspectRatio: 1, borderRadius: "50px", backgroundColor: "#1E2757", display: "flex", justifyContent: "center", alignItems: "center" }}
            onClick={() => {
              setViewParticipantsShow(false);
              setSpotlight(true);
              setViewMessagesShow(!viewMessagesShow);
            }}>
            <ChatDots size={20} style={{ color: "#1A71FF" }} />
          </Button>
        </Col>
      </Row>

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

      <ChatNotificationContainer>
        {notifications.map(notification => (
          <ChatNotification
            key={notification.id}
            user={notification.user}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
            onClick={() => setViewMessagesShow(true)}
          />
        ))}
      </ChatNotificationContainer>

    </Container >
  );
};

export default Meeting;
