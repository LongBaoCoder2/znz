import { useState } from "react";
import { Container, Row, Col, Form, ButtonGroup, Button, Image, Modal } from "react-bootstrap";
import { useParams } from "react-router";
import AddParticipantImage from "../assets/add-participant.png";
import MicrophoneImage from "../assets/microphone.png";
import CameraImage from "../assets/camera.png";
import ShareScreenImage from "../assets/share-screen.png";
import MessageImage from "../assets/message.png";


function Meeting() {
  const { URI } = useParams();

  return (
    <Container fluid className="vh-100 d-flex flex-column">
      <Row style={{ height: "90%" }}>
        <Row className="d-flex flex-row align-items-center">
          <h5 className="text-primary">
            {URI}
          </h5>
        </Row>
        <Row>
          <Col className="col-8 offset-2 bg-warning d-flex flex-column justify-content-center align-items-center">
            <Image
              src="https://placehold.co/600x400"
              style={{ width: "90%" }}
            />
          </Col>
        </Row>
      </Row>
      <Row style={{ height: "10%" }} className="d-flex flex-row align-items-center">
        <Col className="col-2 offset-2">
          <Image
            src={AddParticipantImage}
            style={{ width: "80%" }}
          />
        </Col>
        <Col className="col-2 offset-1 d-flex flex-row justify-content-evenly">
          <Image
            src={MicrophoneImage}
            style={{ width: "50px" }}
          />
          <Image
            src={CameraImage}
            style={{ width: "50px" }}
          />
          <Image
            src={ShareScreenImage}
            style={{ width: "50px" }}
          />
        </Col>
        <Col className="col-1 offset-4">
          <Image
            src={MessageImage}
            style={{ width: "50%" }}
          />
        </Col>
      </Row>
    </Container >
  );
};

export default Meeting;
