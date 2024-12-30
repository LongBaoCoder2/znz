import { useEffect } from "react";
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

  return null;
}

export default App;
