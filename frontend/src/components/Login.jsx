import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function Login() {

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Login />
    </GoogleOAuthProvider>
  );
}

export default Login;
