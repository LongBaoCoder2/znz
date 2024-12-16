import { useState } from "react";
import "./login.css";
import AboutUsImage from "./assets/about-us.png";
import { useNavigate } from "react-router";

function Login() {
  let navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [isLoginFailed, setIsLoginFailed] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [isUsernameFailed, setIsUsernameFailed] = useState(false);
  const [isUsernameFailedMessage, setIsUsernameFailedMessage] = useState("");
  const [isPasswordFailed, setIsPasswordFailed] = useState(false);
  const passwordFailedMessage = "*Mật khẩu phải chứa ít nhất 8 ký tự, gồm ít nhất một ký tự hoa, một ký tự thường và một số.";
  const [isConfirmPasswordFailed, setIsConfirmPasswordFailed] = useState(false);
  const confirmPasswordFailedMessage = "*Mật khẩu không khớp!";

  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const handleLogin = () => {
    setIsLoginFailed(!isLoginFailed);
    return;
  };

  const handleSignup = () => {
    if (signupUsername.length < 8) {
      setIsUsernameFailedMessage("*Tên đăng nhập phải chứa ít nhất 8 ký tự.");
      setIsUsernameFailed(true);
      return;
    }
    setIsUsernameFailed(false);
    if (!signupUsername.match(/^[a-zA-Z0-9]+$/)) {
      setIsUsernameFailedMessage("*Tên đăng nhập chỉ được chứa các chữ cái thường, chữ cái viết hoa và số!");
      setIsUsernameFailed(true);
      return;
    }
    setIsUsernameFailed(false);
    if (signupPassword.length < 8 || !signupPassword.match(/[a-z]/) || !signupPassword.match(/[A-Z]/) || !signupPassword.match(/[0-9]/)) {
      setIsPasswordFailed(true);
      return;
    }
    setIsPasswordFailed(false);
    if (signupPassword !== signupConfirmPassword) {
      setIsConfirmPasswordFailed(true);
      return;
    }
    setIsConfirmPasswordFailed(false);
    navigate("/signup");
  };

  return (
    <div className="container">
      {isLogin ? (
        <div className="form-container">
          <h1 className="znz">ZNZ</h1>
          <h2 className="title">
            Đăng nhập
          </h2>
          <div>Chào mừng bạn quay trở lại với ZNZ!</div>
          <form className="form">
            <label className="label">
              Tên đăng nhập
            </label>
            <input
              className="input"
              type="text"
              placeholder="Tên đăng nhập"
              value={loginUsername}
              onChange={e => {
                setIsLoginFailed(false);
                setLoginUsername(e.target.value);
              }}
            />
            {isLoginFailed && (
              <label className="fail">
                *Tên đăng nhập hoặc mật khẩu không đúng!
              </label>
            )}
            <label className="label">
              Mật khẩu
            </label>
            <input
              className="input"
              type="password"
              placeholder="Mật khẩu"
              value={loginPassword}
              onChange={e => {
                setIsLoginFailed(false);
                setLoginPassword(e.target.value);
              }}
            />
            {isLoginFailed && (
              <label className="fail">
                *Tên đăng nhập hoặc mật khẩu không đúng!
              </label>
            )}
          </form>
          <button
            className="blue-button"
            onClick={handleLogin}
          >
            Đăng nhập
          </button>
          <span>
            <span>Mới biết đến </span>
            <b>ZNZ</b>
            <span>? </span>
            <b
              className="blue-text"
              onClick={() => setIsLogin(false)}
            >
              Đăng ký miễn phí
            </b>
          </span>
        </div>
      ) : (
        <div className="about-us-container">
          <h3 className="about-us-text">
            About Us
          </h3>
          <img
            className="about-us-image"
            src={AboutUsImage}
          />
          <button
            className="white-button"
            onClick={() => setIsLogin(true)}
          >
            Đăng nhập
          </button>
        </div>
      )}

      {isLogin ? (
        <div className="about-us-container">
          <h3 className="about-us-text">
            About Us
          </h3>
          <img
            className="about-us-image"
            src={AboutUsImage}
          />
          <button
            className="white-button"
            onClick={() => setIsLogin(false)}
          >
            Đăng ký
          </button>
        </div>
      ) : (
        <div className="form-container">
          <h1 className="znz">
            ZNZ
          </h1>
          <h2 className="title">
            Đăng ký
          </h2>
          <form className="form">
            <label className="label">
              Tên đăng nhập
            </label>
            <input
              className="input"
              type="text"
              placeholder="Tên đăng nhập"
              value={signupUsername}
              onChange={e => {
                setIsUsernameFailed(false);
                setSignupUsername(e.target.value);
              }}
            />
            {isUsernameFailed && (
              <label className="fail">
                {isUsernameFailedMessage}
              </label>
            )}
            <label className="label">
              Mật khẩu
            </label>
            <input
              className="input"
              type="password"
              placeholder="Mật khẩu"
              value={signupPassword}
              onChange={e => {
                setIsPasswordFailed(false);
                setSignupPassword(e.target.value);
              }}
            />
            {isPasswordFailed && (
              <label className="fail">
                {passwordFailedMessage}
              </label>
            )}
            <label className="label">
              Nhập lại mật khẩu
            </label>
            <input
              className="input"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={signupConfirmPassword}
              onChange={e => {
                setIsConfirmPasswordFailed(false);
                setSignupConfirmPassword(e.target.value);
              }}
            />
            {isConfirmPasswordFailed && (
              <label className="fail">
                {confirmPasswordFailedMessage}
              </label>
            )}
          </form>
          <button
            className="blue-button"
            onClick={handleSignup}
          >
            Đăng ký
          </button>
          <span>
            <span>Bạn đã có tài khoản? </span>
            <b
              className="blue-text"
              onClick={() => setIsLogin(true)}>
              Đăng nhập
            </b>
          </span>
        </div>
      )}
    </div>
  );
};

export default Login;
