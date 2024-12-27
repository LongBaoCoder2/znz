import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import SignIn from "./routes/signin.tsx";
import SignUp from "./routes/signup.tsx";
import Home from "./routes/home.tsx";
import Meeting from "./routes/meeting.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/meeting/:URI" element={<Meeting />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
