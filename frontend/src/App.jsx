import React from "react";
import { Routes, Route } from "react-router-dom";
import RegisterForm from "./components/auth/RegisterForm";
import LoginForm from "./components/auth/LoginForm";

function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>Welcome to XONGROH</h1>} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/login" element={<LoginForm />} />
      {/* Add a default route if necessary */}
    </Routes>
  );
}

export default App;
