import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Image, Modal } from "react-bootstrap";
import AboutUsImage from "../assets/about-us.png";
import axios from "axios";
import getURL from "../axios/network";
import { CreateProfileResponse } from "../axios/interface";
import { useAuth } from "../store/AuthContext";
import Loading from "../components/Loading";
import { useNavigate } from "react-router";

function SignUp() {
  const { loading, accessToken } = useAuth();

  const [fullName, setFullName] = useState("");
  const [isFullNameValid, setIsFullNameValid] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [isDisplayNameValid, setIsDisplayNameValid] = useState(true);
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");

  const [modalShow, setModalShow] = useState(false);

  const handleSignUp = async () => {
    if (fullName.length === 0) {
      setIsFullNameValid(false);
      return;
    }
    if (displayName.length === 0) {
      setIsDisplayNameValid(false);
      return;
    }
    if (email.length === 0) {
      setIsEmailValid(false);
      return;
    }
    try {
      const response = await axios.post<CreateProfileResponse>(getURL("/profile"), {
        displayName: displayName,
        fullName: fullName,
        email: email,
        phoneNumber: phoneNumber,
      },
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          }
        }
      );
      console.log(response);
    }
    catch (error) {
      console.error(error);
    }

    setModalShow(true);
  };

  const { hasJustRegistered, setHasJustRegistered } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!hasJustRegistered) {
      navigate("/signin"); // Redirect to signin if the user hasn't just registered
    }
  }, [hasJustRegistered, navigate]);

  useEffect(() => {
    if (loading) return;
  }, [loading])

  if (loading)  {
    return <Loading />
  }



  return (
    <Container fluid className="vw-100">
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
            href="/signin"
          >
            Đăng nhập
          </Button>
        </Col>

        <Col className="d-flex flex-column justify-content-start align-items-center">
          <h1 className="align-self-start mt-5 ms-5 text-primary">
            ZNZ
          </h1>
          <h2 className="text-primary my-4">
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
                  setDisplayName(e.target.value);
                }}
              />
              {!isFullNameValid && (
                <Form.Text className="text-danger">
                  *Họ và tên không được để trống
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Tên hiển thị</Form.Label>
              <Form.Control
                type="text"
                placeholder="Họ và tên"
                value={displayName}
                onChange={e => {
                  setIsDisplayNameValid(true);
                  setDisplayName(e.target.value);
                }}
              />
              {!isDisplayNameValid && (
                <Form.Text className="text-danger">
                  *Tên hiển thị không được để trống
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
        onHide={() => {
          setModalShow(false);
          setHasJustRegistered(false);
        }}
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
          <Button href="/signin">Đăng nhập</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SignUp;
