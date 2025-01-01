import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Container, Row, Col, Form, Button, Image } from "react-bootstrap";
import AboutUsImage from "../assets/about-us.png";
import axios from "axios";
import getURL from "../axios/network";
import { SignInResponse, SignUpResponse } from "../axios/interface";
import { useAuth } from "../store/AuthContext";
import Loading from "../components/Loading";
import { useNotify } from "../store/NotifyContext";

function SignIn() {
  let navigate = useNavigate();

  const { showMessage } = useNotify();
  const { loading, login, setHasJustRegistered } = useAuth();

  const [isSignIn, setIsSignIn] = useState(true);

  const [isSignInValid, setIsSignInValid] = useState(true);
  const signInFailedMessage = "*Tên đăng nhập hoặc mật khẩu không đúng!";

  const [signInUsername, setSignInUsername] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [isSignUpUsernameValid, setIsSignUpUsernameValid] = useState(true);
  const [signUpUsernameFailedMessage, setSignUpUsernameFailedMessage] = useState("");

  const [isSignUpPasswordValid, setIsSignUpPasswordValid] = useState(true);
  const signUpPasswordFailedMessage = "*Mật khẩu phải chứa ít nhất 8 ký tự, gồm ít nhất một ký tự hoa, một ký tự thường và một số.";

  const [isSignUpConfirmedPasswordValid, setIsSignUpConfirmedPasswordValid] = useState(true);
  const signUpConfirmedPasswordFailedMessage = "*Mật khẩu không khớp!";

  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signupConfirmedPassword, setSignUpConfirmedPassword] = useState("");

  const handleSignIn = async () => {
    try {
      const response = await axios.post<SignInResponse>(getURL("/auth/login"), {
        username: signInUsername,
        password: signInPassword,
      });
      console.log(response);
      login(response.data);
      showMessage("Login", "Login successful", "success");
      navigate("/home");
    }
    catch (error) {
      setIsSignInValid(false);
    }
    return;
  };

  const handleSignUp = async () => {
    if (signUpUsername.length < 8) {
      setSignUpUsernameFailedMessage("*Tên đăng nhập phải chứa ít nhất 8 ký tự.");
      setIsSignUpUsernameValid(false);
      return;
    }
    setIsSignUpUsernameValid(true);
    if (!signUpUsername.match(/^[a-zA-Z0-9]+$/)) {
      setSignUpUsernameFailedMessage("*Tên đăng nhập chỉ được chứa các chữ cái thường, chữ cái viết hoa và số!");
      setIsSignUpUsernameValid(false);
      return;
    }
    setIsSignUpUsernameValid(true);
    if (signUpPassword.length < 8 || !signUpPassword.match(/[a-z]/) || !signUpPassword.match(/[A-Z]/) || !signUpPassword.match(/[0-9]/)) {
      setIsSignUpPasswordValid(false);
      return;
    }
    setIsSignUpPasswordValid(true);
    if (signUpPassword !== signupConfirmedPassword) {
      setIsSignUpConfirmedPasswordValid(false);
      return;
    }
    setIsSignUpConfirmedPasswordValid(true);

    try {
      const response = await axios.post<SignUpResponse>(getURL("/auth/signup"), {
        username: signUpUsername,
        password: signUpPassword,
      });
      console.log(response);
      if (response.status === 201) {
        const loginResponse = await axios.post<SignInResponse>(getURL("/auth/login"), {
          username: signUpUsername,
          password: signUpPassword,
        });
        setHasJustRegistered(true);
        login(loginResponse.data);
        navigate("/signup");
      }
    }
    catch (error) {
      setSignUpUsernameFailedMessage("*Tên đăng nhập đã tồn tại, vui lòng chọn tên đăng nhập khác!");
      setIsSignUpUsernameValid(false);
      console.error(error);
    }
  };

  useEffect(() => {
    if (loading) return;
  }, [loading]);

  if (loading) {
    return <Loading />;
  }

  return (
    <Container fluid className="vw-100">
      <Row>
        {isSignIn ? (
          <Col className="d-flex flex-column justify-content-start align-items-center">
            <h1 className="align-self-start mt-5 ms-5 text-primary">
              ZNZ
            </h1>
            <h2 className="text-primary my-5">
              Đăng nhập
            </h2>
            <span className="mb-4">
              <span>Chào mừng bạn quay trở lại với </span>
              <b>ZNZ</b>
              <span> !</span>
            </span>
            <Form className="col-6 text-start">
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Tên đăng nhập</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Tên đăng nhập"
                  value={signInUsername}
                  onChange={e => {
                    setIsSignInValid(true);
                    setSignInUsername(e.target.value);
                  }}
                />
                {!isSignInValid && (
                  <Form.Text className="text-danger">
                    {signInFailedMessage}
                  </Form.Text>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Mật khẩu"
                  value={signInPassword}
                  onChange={e => {
                    setIsSignInValid(true);
                    setSignInPassword(e.target.value);
                  }}
                />
                {!isSignInValid && (
                  <Form.Text className="text-danger">
                    {signInFailedMessage}
                  </Form.Text>
                )}
              </Form.Group>
            </Form>
            <Button
              className="my-4"
              onClick={handleSignIn}
            >
              Đăng nhập
            </Button>
            <span>
              <span>Mới biết đến </span>
              <b>ZNZ</b>
              <span>? </span>
              <b
                className="text-primary"
                style={{ cursor: "pointer" }}
                onClick={() => setIsSignIn(false)}
              >
                Đăng ký miễn phí
              </b>
            </span>
          </Col>
        ) : (
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
              onClick={() => setIsSignIn(true)}
            >
              Đăng nhập
            </Button>
          </Col>
        )}

        {isSignIn ? (
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
              onClick={() => setIsSignIn(false)}
            >
              Đăng ký
            </Button>
          </Col>
        ) : (
          <Col className="d-flex flex-column justify-content-start align-items-center">
            <h1 className="align-self-start mt-5 ms-5 text-primary">
              ZNZ
            </h1>
            <h2 className="text-primary my-5">
              Đăng ký
            </h2>
            <Form className="col-6 text-start">
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Tên đăng nhập</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Tên đăng nhập"
                  value={signUpUsername}
                  onChange={e => {
                    setIsSignUpUsernameValid(true);
                    setSignUpUsername(e.target.value);
                  }}
                />
                {!isSignUpUsernameValid && (
                  <Form.Text className="text-danger">
                    {signUpUsernameFailedMessage}
                  </Form.Text>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Mật khẩu"
                  value={signUpPassword}
                  onChange={e => {
                    setIsSignUpPasswordValid(true);
                    setSignUpPassword(e.target.value);
                  }}
                />
                {!isSignUpPasswordValid && (
                  <Form.Text className="text-danger">
                    {signUpPasswordFailedMessage}
                  </Form.Text>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Nhập lại mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={signupConfirmedPassword}
                  onChange={e => {
                    setIsSignUpConfirmedPasswordValid(true);
                    setSignUpConfirmedPassword(e.target.value);
                  }}
                />
                {!isSignUpConfirmedPasswordValid && (
                  <Form.Text className="text-danger">
                    {signUpConfirmedPasswordFailedMessage}
                  </Form.Text>
                )}
              </Form.Group>
            </Form>
            <Button
              className="my-4"
              onClick={handleSignUp}
            >
              Đăng ký
            </Button>
            <span>
              <span>Bạn đã có tài khoản? </span>
              <b
                className="text-primary"
                style={{ cursor: "pointer" }}
                onClick={() => setIsSignIn(true)}
              >
                Đăng nhập
              </b>
            </span>
          </Col>
        )}
      </Row>
    </Container >
  );
};

export default SignIn;
