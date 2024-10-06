"use client";
import { useState, useContext } from "react";
import { supabase } from "../../_lib/supabaseClient";
import LayoutContext from "../../context/LayoutContext";
import "./styles.css";
import "../../globals.css";
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const props = useContext(LayoutContext);

  const handleLogin = async () => {
    console.log(username, password);
    const { data, error } = await supabase
      .from("Students")
      .select("*")
      .eq("username", parseInt(username))
      .eq("password", parseInt(password));

    console.log(data, error);
    if (data && data.length > 0) {
      localStorage.setItem("user", JSON.stringify(data[0]));
      props.setUser(data[0]);
      props.router.push("/");
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="login_page">
      <form className="login" onSubmit={(e) => e.preventDefault()}>
        <h1>Login</h1>
        <input
          type="number"
          placeholder="Username"
          value={username}
          className="form-control"
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Password"
          value={password}
          className="form-control"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          onClick={handleLogin}
          className="btn btn-dark w-100 m-2"
          type="submit"
          disabled={!(username && password)}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
