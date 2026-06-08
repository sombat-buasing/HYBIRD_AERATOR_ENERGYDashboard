import { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

export default function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const doLogin = async () => {

    try {

      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          username,
          password
        }
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      window.location.href = "/";

    } catch (err) {

      console.error(err);

      alert("Login Failed");

    }
  };

  return (
    <div style={{ padding: "50px" }}>

      <h2>Energy Monitor Login</h2>

      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />

      <br /><br />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      <br /><br />

      <button onClick={doLogin}>
        Login
      </button>

    </div>
  );
}