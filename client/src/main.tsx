import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import SignIn from "./routes/signin.tsx";
import SignUp from "./routes/signup.tsx";
import Home from "./routes/home.tsx";
import Meeting from "./routes/meeting.tsx";
import { AuthProvider } from "./store/AuthContext";
import { NotifyProvider } from "./store/NotifyContext";
import MessageModalContainer from "./components/MessageModal";
import { useNotify } from "./store/NotifyContext";

function Root() {
  const { hideMessage, isVisible, message, type } = useNotify();

  return (
    <>
      <MessageModalContainer
        type={type}
        message={message}
        isVisible={isVisible}
        hideMessage={hideMessage}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
          <Route path="/meeting/:URI" element={<Meeting />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <NotifyProvider>
        <Root />
      </NotifyProvider>
    </AuthProvider>
  </StrictMode>
);
