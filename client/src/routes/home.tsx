import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Image, Modal, Spinner } from "react-bootstrap";
import JoinImage from "../assets/join.svg";
import HostImage from "../assets/host.svg";
import axios from "axios";
import getURL from "../axios/network";
import { GetProfileResponse } from "../axios/interface";
import { useAuth } from "../store/AuthContext";
import { useNavigate } from "react-router";

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user, accessToken, loading, logout } = useAuth();

  const [avatar, setAvatar] = useState("https://placehold.co/400");
  const [fullName, setFullName] = useState("Thái Văn Mạnh");
  const [isFullNameValid, setIsFullNameValid] = useState(true);
  const [displayName, setDisplayName] = useState("TVM");
  const [isDisplayNameValid, setIsDisplayNameValid] = useState(true);
  const [email, setEmail] = useState("example@gmail.com");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("0123456789");

  const [joinMeetingByIDModalShow, setJoinMeetingByIDModalShow] = useState(false);
  const [joinMeetingByURIModalShow, setJoinMeetingByURIModalShow] = useState(false);
  const [passwordModalShow, setPasswordModalShow] = useState(false);
  const [hostMeetingModalShow, setHostMeetingModalShow] = useState(false);
  const [editProfileModalShow, setEditProfileModalShow] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      if (loading) return; 

      if (!isAuthenticated || !user) {
        navigate('/signin');
        return;
      }

       console.log("user: ", user);


      try {
        const response = await axios.get<GetProfileResponse>(getURL("/profile"),
          {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
            }
          }
        );
        console.log(response);
        setFullName(response.data.data.fullName);
        setDisplayName(response.data.data.displayName);
        setEmail(response.data.data.email);
        setPhoneNumber(response.data.data.phoneNumber);
        setAvatar(response.data.data.avatarUrl);
      }
      catch (error) {
        console.error(error);
      }
    };
    getProfile();
  }, [loading, isAuthenticated, user]);

  const handleSignUp = () => {
    if (fullName.length === 0) {
      setIsFullNameValid(false);
      return;
    }
    setIsFullNameValid(true);
    setIsEmailValid(!isEmailValid);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {

    }
  }

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
    <Container fluid className="vh-100">
      <Row className="border-bottom p-3">
        <h1 className="text-primary">
          ZNZ
        </h1>
      </Row>

      <Row className="pt-3">
        <Col className="col-2 d-flex flex-column">
          <Button>
            Trang chủ
          </Button>
          <Button
            variant="light"
          >
            Đổi mật khẩu
          </Button>
          <Button
            variant="light"
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </Col>

        <Col className="d-flex flex-row justify-content-evenly">
          <Col className="col-8 p-3 shadow">
            <Row>
              <Col className="col-4 px-5">
                <Image
                  src="https://placehold.co/400"
                  fluid
                  rounded
                />
              </Col>
              <Col className="col-6">
                <h2>{fullName}</h2>
                <h4>{displayName}</h4>
              </Col>
              <Col className="col-2">
                <b
                  className="text-primary"
                  style={{ cursor: "pointer" }}
                  onClick={() => setEditProfileModalShow(true)}
                >
                  Chỉnh sửa
                </b>
              </Col>
            </Row>
            <Row className="mt-5 mb-3">
              <h5>
                Cá nhân
              </h5>
            </Row>
            <Row>
              <Col className="col-4">
                <p>Email</p>
              </Col>
              <Col className="col-6">
                <p>{email}</p>
              </Col>
              <Col className="col-2">
                <b
                  className="text-primary"
                  style={{ cursor: "pointer" }}
                  onClick={() => setEditProfileModalShow(true)}
                >
                  Chỉnh sửa
                </b>
              </Col>
            </Row>
            <Row>
              <Col className="col-4">
                <p>Điện thoại</p>
              </Col>
              <Col className="col-6">
                <p>{phoneNumber}</p>
              </Col>
              <Col className="col-2">
                <b
                  className="text-primary"
                  style={{ cursor: "pointer" }}
                  onClick={() => setEditProfileModalShow(true)}
                >
                  Chỉnh sửa
                </b>
              </Col>
            </Row>
          </Col>

          <Col className="col-3">
            <Col className="p-3 shadow gap-3 d-flex flex-column">
              <Row style={{ cursor: "pointer" }} onClick={() => setJoinMeetingByIDModalShow(true)}>
                <Col className="d-flex flex-row gap-3 align-items-center">
                  <Image
                    src={JoinImage}
                  />
                  <span>
                    Tham gia cuộc họp bằng ID
                  </span>
                </Col>
              </Row>
              <Row style={{ cursor: "pointer" }} onClick={() => setJoinMeetingByURIModalShow(true)}>
                <Col className="d-flex flex-row gap-3 align-items-center">
                  <Image
                    src={JoinImage}
                  />
                  <span>
                    Tham gia cuộc họp bằng URI
                  </span>
                </Col>
              </Row>
              <Row style={{ cursor: "pointer" }} onClick={() => setHostMeetingModalShow(true)}>
                <Col className="d-flex flex-row gap-3 align-items-center">
                  <Image
                    src={HostImage}
                  />
                  <span>
                    Chủ trì cuộc họp mới
                  </span>
                </Col>
              </Row>
            </Col>
          </Col>
        </Col>
      </Row>

      <Modal
        show={joinMeetingByIDModalShow}
        onHide={() => setJoinMeetingByIDModalShow(false)}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Tham gia cuộc họp bằng ID</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nhập ID cuộc họp</Form.Label>
              <Form.Control
                type="text"
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary">Tham gia</Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={joinMeetingByURIModalShow}
        onHide={() => setJoinMeetingByURIModalShow(false)}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Tham gia cuộc họp bằng URI</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nhập URI cuộc họp</Form.Label>
              <Form.Control
                type="text"
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary">Tham gia</Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={hostMeetingModalShow}
        onHide={() => setHostMeetingModalShow(false)}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Chủ trì cuộc họp mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên cuộc họp</Form.Label>
              <Form.Control
                type="text"
                autoFocus
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Mật khẩu cuộc họp (tùy chọn)</Form.Label>
              <Form.Control
                type="password"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary">Xác nhận</Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={editProfileModalShow}
        onHide={() => setEditProfileModalShow(false)}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa thông tin cá nhân</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Họ và tên</Form.Label>
              <Form.Control
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tên hiển thị</Form.Label>
              <Form.Control
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Điện thoại</Form.Label>
              <Form.Control
                type="text"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary">Xác nhận</Button>
        </Modal.Footer>
      </Modal>

    </Container >
  );
};

export default Home;
