import { useState } from "react";
import { Container, Row, Col, Form, ButtonGroup, Button, Image, OverlayTrigger, Popover, Offcanvas, Modal } from "react-bootstrap";
import { useParams } from "react-router";
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

function Meeting() {
  const { URI } = useParams();

  const [title, setTitle] = useState("ZNZ");
  const [microphoneState, setMicrophoneState] = useState(false);
  const [cameraState, setCameraState] = useState(false);
  const [shareScreenState, setShareScreenState] = useState(false);
  const [viewParticipantsShow, setViewParticipantsShow] = useState(false);
  const [viewMessagesShow, setViewMessagesShow] = useState(false);
  const [message, setMessage] = useState("");

  const handleMicrophoneClick = () => {
    setMicrophoneState(!microphoneState);
  };

  const handleCameraClick = () => {
    setCameraState(!cameraState);
  };

  const handleShareScreenClick = () => {
    setShareScreenState(!shareScreenState);
  };

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
    <Container fluid className="vh-100 d-flex flex-column">
      <Row style={{ flex: 1 }} className="align-items-center ps-3">
        <h4>
          {URI} | {title}
        </h4>
      </Row>

      <Row style={{ flex: 10 }}>
        <Col className="d-flex">
          <Image
            src="https://placehold.co/600x400"
            className="w-100"
          />
        </Col>
        <Col className="d-flex">
          <Image
            src="https://placehold.co/600x400"
            className="w-100"
          />
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
            src={microphoneState ? microphoneOnImage : microphoneOffImage}
            style={{ width: "20%", cursor: "pointer" }}
            onClick={handleMicrophoneClick}
          />
          <Image
            src={cameraState ? cameraOnImage : cameraOffImage}
            style={{ width: "20%", cursor: "pointer" }}
            onClick={handleCameraClick}
          />
          <Image
            src={shareScreenState ? shareScreenOnImage : shareScreenOffImage}
            style={{ width: "20%", cursor: "pointer" }}
            onClick={handleShareScreenClick}
          />
        </Col>
        <Col className="col-1">
          <Image
            src={endCallImage}
            className="w-100"
            style={{ cursor: "pointer" }}
            onClick={handleEndCallClick}
          />
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
            onClick={handleMessageClick}
          />
        </Col>
      </Row>

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
    </Container >
  );
};

export default Meeting;
