import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Image, Modal, Spinner } from "react-bootstrap";
import JoinImage from "../assets/join.svg";
import HostImage from "../assets/host.svg";
import axios from "axios";
import getURL from "../axios/network";
import { GetProfileResponse, EditProfileResponse, JoinMeetingByIDResponse } from "../axios/interface";
import { useAuth } from "../store/AuthContext";
import { useNavigate } from "react-router";
import { readFileSync } from "fs";

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user, accessToken, loading, logout } = useAuth();

  const [avatar, setAvatar] = useState("");
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [joinMeetingByIDModalShow, setJoinMeetingByIDModalShow] = useState(false);
  const [joinMeetingByURIModalShow, setJoinMeetingByURIModalShow] = useState(false);
  const [passwordModalShow, setPasswordModalShow] = useState(false);
  const [hostMeetingModalShow, setHostMeetingModalShow] = useState(false);

  const [editProfileModalShow, setEditProfileModalShow] = useState(false);
  const [editFullName, setEditFullName] = useState("Thái Văn Mạnh");
  const [editDisplayName, setEditDisplayName] = useState("TVM");
  const [editEmail, setEditEmail] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [isFullNameValid, setIsFullNameValid] = useState(true);
  const [isDisplayNameValid, setIsDisplayNameValid] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);

  const [editAvatarModalShow, setEditAvatarModalShow] = useState(false);
  const [editAvatar, setEditAvatar] = useState("");

  const [meetingID, setMeetingID] = useState("");
  const [meetingPasswords, setMeetingPasswords] = useState("");

  const [requiredPasswords, setRequiredPasswords] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      if (loading) return;

      if (!isAuthenticated || !user) {
        navigate("/signin");
        return;
      }

      console.log("user: ", user);

      try {
        const response = await axios.get<GetProfileResponse>(getURL("/profile"), {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        console.log(response);
        setFullName(response.data.data.fullName);
        setDisplayName(response.data.data.displayName);
        setEmail(response.data.data.email);
        setPhoneNumber(response.data.data.phoneNumber);
        setAvatar(response.data.data.avatarBase64);
      } catch (error) {
        console.error(error);
      }
    };
    getProfile();
  }, [loading, isAuthenticated, user]);

  const handleEditProfile = async () => {
    try {
      const response = await axios.patch<EditProfileResponse>(
        getURL("/profile"),
        {
          fullName: editFullName,
          displayName: editDisplayName,
          email: editEmail,
          phoneNumber: editPhoneNumber
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      console.log("edit profile response: ");
      console.log(response);
      if (response.status === 200) {
        console.log("edit profile success");
        setFullName(editFullName);
        setDisplayName(editDisplayName);
        setEmail(editEmail);
        setPhoneNumber(editPhoneNumber);
      }
      setEditProfileModalShow(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditAvatar = async () => {
    try {
      const response = await axios.patch<EditProfileResponse>(
        getURL("/profile/avatar"),
        {
          avatarBase64: editAvatar
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      if (response.status === 200) {
        setAvatar(editAvatar);
        setEditAvatarModalShow(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleJoinMeetingByID = async () => {
    try {
      const response = await axios.post<JoinMeetingByIDResponse>(
        getURL("/meeting/join"),
        {
          displayId: meetingID,
          password: meetingPasswords
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      if (response.status === 200) {
        console.log("join meeting success");
        console.log(response);
        navigate(`/meeting/${response.data.data.uri}`);
      }
    } catch (error) {
      console.log(meetingID);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // console.error("Unauthorized access (401):", error.message);
        setRequiredPasswords(true);
      }
      console.error(error);
    }
  };

  const handleJoinMeetingByURI = async () => {
    try {
    } catch (error) {
      console.error(error);
    }
  };

  const handleHostNewMeeting = async () => {
    try {
    } catch (error) {
      console.error(error);
    }
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
      <Container className='d-flex justify-content-center align-items-center' style={{ minHeight: "100vh" }}>
        <Row>
          <Col className='text-center'>
            <Spinner animation='border' role='status' variant='primary'>
              <span className='visually-hidden'>Loading...</span>
            </Spinner>
            {/* <p className="mt-2">Loading your profile...</p> */}
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className='vh-100'>
      <Row className='border-bottom p-3'>
        <h1 className='text-primary'>ZNZ</h1>
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

        <Col className='d-flex flex-row justify-content-evenly'>
          <Col className='col-8 p-3 shadow'>
            <Row>
              <Col className='col-4 px-5'>
                <Image
                  src={`data:image/png;base64,${avatar}`}
                  fluid
                  rounded
                  style={{ cursor: "pointer" }}
                  onClick={() => setEditAvatarModalShow(true)}
                />
              </Col>
              <Col className='col-6'>
                <h2>{fullName}</h2>
                <h4>{displayName}</h4>
              </Col>
              <Col className='col-2'>
                <b
                  className='text-primary'
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setEditProfileModalShow(true);
                    setEditFullName(fullName);
                    setEditDisplayName(displayName);
                    setEditEmail(email);
                    setEditPhoneNumber(phoneNumber);
                  }}
                >
                  Chỉnh sửa
                </b>
              </Col>
            </Row>
            <Row className='mt-5 mb-3'>
              <h5>Cá nhân</h5>
            </Row>
            <Row>
              <Col className='col-4'>
                <p>Email</p>
              </Col>
              <Col className='col-6'>
                <p>{email}</p>
              </Col>
              <Col className='col-2'>
                <b className='text-primary' style={{ cursor: "pointer" }} onClick={() => setEditProfileModalShow(true)}>
                  Chỉnh sửa
                </b>
              </Col>
            </Row>
            <Row>
              <Col className='col-4'>
                <p>Điện thoại</p>
              </Col>
              <Col className='col-6'>
                <p>{phoneNumber}</p>
              </Col>
              <Col className='col-2'>
                <b className='text-primary' style={{ cursor: "pointer" }} onClick={() => setEditProfileModalShow(true)}>
                  Chỉnh sửa
                </b>
              </Col>
            </Row>
          </Col>

          <Col className='col-3'>
            <Col className='p-3 shadow gap-3 d-flex flex-column'>
              <Row style={{ cursor: "pointer" }} onClick={() => setJoinMeetingByIDModalShow(true)}>
                <Col className='d-flex flex-row gap-3 align-items-center'>
                  <Image src={JoinImage} />
                  <span>Tham gia cuộc họp bằng ID</span>
                </Col>
              </Row>
              <Row style={{ cursor: "pointer" }} onClick={() => setJoinMeetingByURIModalShow(true)}>
                <Col className='d-flex flex-row gap-3 align-items-center'>
                  <Image src={JoinImage} />
                  <span>Tham gia cuộc họp bằng URI</span>
                </Col>
              </Row>
              <Row style={{ cursor: "pointer" }} onClick={() => setHostMeetingModalShow(true)}>
                <Col className='d-flex flex-row gap-3 align-items-center'>
                  <Image src={HostImage} />
                  <span>Chủ trì cuộc họp mới</span>
                </Col>
              </Row>
            </Col>
          </Col>
        </Col>
      </Row>

      <Modal
        show={joinMeetingByIDModalShow}
        onHide={() => setJoinMeetingByIDModalShow(false)}
        backdrop='static'
        keyboard={false}
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Tham gia cuộc họp bằng ID</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nhập ID cuộc họp</Form.Label>
              <Form.Control type='text' style={{ marginBottom: 15}} autoFocus value={meetingID} onChange={(e) => setMeetingID(e.target.value)} />
              {requiredPasswords && (
                <>
                  <Form.Label>Nhập Password</Form.Label>
                  <Form.Control
                    type='text'
                    autoFocus
                    value={meetingPasswords}
                    onChange={(e) => setMeetingPasswords(e.target.value)}
                  />
                </>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='primary' onClick={handleJoinMeetingByID}>
            Tham gia
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={joinMeetingByURIModalShow}
        onHide={() => setJoinMeetingByURIModalShow(false)}
        backdrop='static'
        keyboard={false}
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Tham gia cuộc họp bằng URI</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nhập URI cuộc họp</Form.Label>
              <Form.Control type='text' autoFocus />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='primary' onClick={handleJoinMeetingByURI}>
            Tham gia
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={hostMeetingModalShow}
        onHide={() => setHostMeetingModalShow(false)}
        backdrop='static'
        keyboard={false}
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Chủ trì cuộc họp mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>Tên cuộc họp</Form.Label>
              <Form.Control type='text' autoFocus />
            </Form.Group>
            <Form.Group>
              <Form.Label>Mật khẩu cuộc họp (tùy chọn)</Form.Label>
              <Form.Control type='password' />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='primary' onClick={handleHostNewMeeting}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={editProfileModalShow}
        onHide={() => setEditProfileModalShow(false)}
        backdrop='static'
        keyboard={false}
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa thông tin cá nhân</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>Họ và tên</Form.Label>
              <Form.Control type='text' value={editFullName} onChange={(e) => setEditFullName(e.target.value)} />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Tên hiển thị</Form.Label>
              <Form.Control type='text' value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Email</Form.Label>
              <Form.Control type='email' value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Điện thoại</Form.Label>
              <Form.Control type='text' value={editPhoneNumber} onChange={(e) => setEditPhoneNumber(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='primary' onClick={handleEditProfile}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={editAvatarModalShow}
        onHide={() => setEditAvatarModalShow(false)}
        backdrop='static'
        keyboard={false}
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa ảnh đại diện</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>Tải ảnh đại diện lên</Form.Label>
              <Form.Control
                type='file'
                accept='image/png, image/jpg'
                onChange={(e: any) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const avatarBase64 = reader.result as string;
                    setEditAvatar(avatarBase64.split(",")[1]);
                  };
                  reader.readAsDataURL(e.target.files[0]);
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='primary' onClick={handleEditAvatar}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Home;
