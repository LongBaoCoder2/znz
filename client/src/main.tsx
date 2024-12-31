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
import ProtectedRoute from "./components/ProtectedRoute";

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
          <Route 
            path="/signin" 
            element={
              <ProtectedRoute requireUnauth redirectPath="/home">
                <SignIn />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <ProtectedRoute requireUnauth redirectPath="/home">
                <SignUp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/home" 
            element={
              <ProtectedRoute requireAuth redirectPath="/signin">
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/meeting/:URI" 
            element={
                <Meeting />
            } 
          />
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