import { useState } from "react";
import { Container, Row, Col, Form, Button, Image, Modal } from "react-bootstrap";
import AboutUsImage from "../assets/about-us.png";

function SignUp() {
  const [fullName, setFullName] = useState("");
  const [isFullNameValid, setIsFullNameValid] = useState(true);
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");

  const [modalShow, setModalShow] = useState(false);

  const handleSignUp = () => {
    if (fullName.length === 0) {
      setIsFullNameValid(false);
      return;
    }
    setIsFullNameValid(true);
    setIsEmailValid(!isEmailValid);

    setModalShow(true);
  };

  return (
    <Container fluid>
      <Row>
        <Col className="vh-100 d-flex flex-column justify-content-center align-items-center" style={{ backgroundColor: "#E5E5E5" }}>
          <h5 className="align-self-start mt-5 ms-5">
            About Us
          </h5>
          <Image
            className="mx-5"
            src={AboutUsImage}
            fluid
          />
          <Button
            className="mt-5 text-primary"
            variant="light"
            href="/login"
          >
            Đăng nhập
          </Button>
        </Col>

        <Col className="d-flex flex-column justify-content-start align-items-center">
          <h1 className="align-self-start mt-5 ms-5 text-primary">
            ZNZ
          </h1>
          <h2 className="text-primary my-5">
            Đăng ký
          </h2>
          <span className="mb-4">
            Vui lòng cập nhật thông tin cá nhân của bạn.
          </span>
          <Form className="col-6 text-start">
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Họ và tên</Form.Label>
              <Form.Control
                type="text"
                placeholder="Họ và tên"
                value={fullName}
                onChange={e => {
                  setIsFullNameValid(true);
                  setFullName(e.target.value);
                }}
              />
              {!isFullNameValid && (
                <Form.Text className="text-danger">
                  *Họ và tên không được để trống
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => {
                  setIsEmailValid(true);
                  setEmail(e.target.value);
                }}
              />
              {!isEmailValid && (
                <Form.Text className="text-danger">
                  *Email không hợp lệ
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Số điện thoại (tùy chọn)</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Số điện thoại"
                value={phoneNumber}
                onChange={e => {
                  setPhoneNumber(e.target.value);
                }}
              />
            </Form.Group>
          </Form>
          <Button
            className="my-4"
            onClick={handleSignUp}
          >
            Hoàn tất
          </Button>
        </Col>
      </Row>

      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title>
            Chỉ một bước nữa thôi!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Vui lòng kiểm tra email của bạn và làm theo hướng dẫn để hoàn tất thủ tục đăng ký!
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button href="/login">Đăng nhập</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SignUp;
