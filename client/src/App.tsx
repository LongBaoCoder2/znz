import VideoConference from "./test/VideoConference";

import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { useNavigate } from "react-router";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  let navigate = useNavigate();

  const session = false;
  useEffect(() => {
    if (!session) {
      navigate("/home");
    }
  }, []);


  return (
    <>
    </>
  );
}

export default App;
