import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Login from "./Login";
import StudentDashboard from "./StudentDashboard";
import AdminDashboard from "./AdminDashboard";
import WorkerDashboard from "./WorkerDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route
          path="/"
          element={user ? <Navigate to="/student" /> : <Login />}
        />

        {/* Protected routes */}
        <Route
          path="/student"
          element={user ? <StudentDashboard /> : <Navigate to="/" />}
        />

        <Route
          path="/admin"
          element={user ? <AdminDashboard /> : <Navigate to="/" />}
        />

        <Route
          path="/worker"
          element={user ? <WorkerDashboard /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
