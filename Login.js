import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      const snap = await getDoc(doc(db, "users", res.user.uid));
      if (!snap.exists()) {
        alert("Role not assigned");
        return;
      }

      const role = snap.data().role;

      if (role === "student") window.location.href = "/student";
      else if (role === "admin") window.location.href = "/admin";
      else window.location.href = "/worker";
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-page">
      <h1>Hostel Complaint System</h1>
      <div className="login-card">
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Login</button>
      </div>
    </div>
  );
}

export default Login;
