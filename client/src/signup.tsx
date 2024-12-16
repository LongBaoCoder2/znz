import { useState } from "react";
import "./signup.css";
import AboutUsImage from "./assets/about-us.png";
import { useNavigate } from "react-router";

function SignUp() {
  let navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [isFullNameFailed, setIsFullNameFailed] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailFailed, setIsEmailFailed] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSignup = () => {
    if (fullName.length === 0) {
      setIsFullNameFailed(true);
      return;
    }
    setIsFullNameFailed(false);
    setIsEmailFailed(!isEmailFailed);

  };

  return (
    <div className="container">
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
          onClick={() => navigate("/login")}
        >
          Đăng nhập
        </button>
      </div>

      <div className="form-container">
        <h1 className="znz">
          ZNZ
        </h1>
        <h2 className="title">
          Cập nhật thông tin cá nhân
        </h2>
        <form className="form">
          <label className="label">
            Họ và tên
          </label>
          <input
            className="input"
            type="text"
            placeholder="Họ và tên"
            value={fullName}
            onChange={e => {
              setIsFullNameFailed(false);
              setFullName(e.target.value);
            }}
          />
          {isFullNameFailed && (
            <label className="fail">
              *Họ và tên không được để trống
            </label>
          )}
          <label className="label">
            Email
          </label>
          <input
            className="input"
            type="email"
            placeholder="Mật khẩu"
            value={email}
            onChange={e => {
              setIsEmailFailed(false);
              setEmail(e.target.value);
            }}
          />
          {isEmailFailed && (
            <label className="fail">
              *Email không hợp lệ
            </label>
          )}
          <label className="label">
            Số điện thoại (tùy chọn)
          </label>
          <input
            className="input"
            type="numer"
            placeholder="Nhập lại mật khẩu"
            value={phoneNumber}
            onChange={e => {
              setPhoneNumber(e.target.value);
            }}
          />
        </form>
        <button
          className="blue-button"
          onClick={handleSignup}
        >
          Hoàn tất
        </button>
      </div>
    </div>
  );
};

export default SignUp;
