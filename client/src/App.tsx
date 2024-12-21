import VideoConference from "./test/VideoConference";

import { useState, useEffect } from "react";
import "./App.css";
import { useNavigate } from "react-router";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  let navigate = useNavigate();

  const session = false;
  useEffect(() => {
    if (!session) {
      navigate("/signin");
    }
  }, []);

  const [count, setCount] = useState(0);

  return (
    <>
      <VideoConference></VideoConference>
    </>
  );
}

export default App;
