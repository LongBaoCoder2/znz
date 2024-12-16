import "./signup-completed.css";
import AboutUsImage from "./assets/about-us.png";
import { useNavigate } from "react-router";

function SignUpCompleted() {
  let navigate = useNavigate();

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
          Chỉ một bước nữa thôi
        </h2>
        <p className="text">
          Vui lòng kiểm tra email của bạn và làm theo hướng dẫn để hoàn tất thủ tục đăng ký!
        </p>
      </div>
    </div>
  );
};

export default SignUpCompleted;
