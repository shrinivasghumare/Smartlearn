"use client";
import { useState, useContext } from "react";
import { supabase } from "../../_lib/supabaseClient";
import LayoutContext from "../../context/LayoutContext";
import "./styles.css";
import "../../globals.css";
const Login = () => {
  const [roll_no, setRoll_no] = useState("");
  const [password, setPassword] = useState("");
  const props = useContext(LayoutContext);

  const handleLogin = async () => {
    const { data, error } = await supabase
      .from("Students")
      .select("*")
      .eq("roll_no", parseInt(roll_no))
      .eq("password", parseInt(password));

    if (data && data.length > 0) {
      localStorage.setItem("user", JSON.stringify(data[0]));
      props.setUser(data[0]);
      props.router.push("/");
    } else {
      alert("Invalid Roll No. or password");
    }
  };

  return (
    <div className="login_page">
      <form className="login" onSubmit={(e) => e.preventDefault()}>
        <h1>Login</h1>
        <input
          type="number"
          placeholder="Username"
          value={roll_no}
          className="form-control"
          onChange={(e) => setRoll_no(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          className="form-control"
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="password"
        />
        <button
          onClick={handleLogin}
          className="btn btn-dark w-100 m-2"
          type="submit"
          disabled={!(roll_no && password)}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
