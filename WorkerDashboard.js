import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import "./WorkerDashboard.css";

export default function WorkerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [workerType, setWorkerType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeJobs = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 1️⃣ Get workerType
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (!userSnap.exists()) {
          setLoading(false);
          return;
        }

        // ✅ ONLY FIX IS HERE
        const type = (userSnap.data().workerType || "")
          .trim()
          .toLowerCase();

        setWorkerType(type);

        // 2️⃣ Listen for assigned complaints
        const q = query(
          collection(db, "complaints"),
          where("assignedWorkerType", "==", type)
        );

        unsubscribeJobs = onSnapshot(q, (snap) => {
          setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        });
      } catch (err) {
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeJobs) unsubscribeJobs();
      unsubscribeAuth();
    };
  }, []);

  const markArrived = async (id) => {
    await updateDoc(doc(db, "complaints", id), {
      status: "arrived",
      "tracking.workStartedAt": serverTimestamp()
    });
  };

  const markResolved = async (id) => {
    await updateDoc(doc(db, "complaints", id), {
      status: "resolved",
      "tracking.completedAt": serverTimestamp()
    });
  };

  const logout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  return (
    <div className="worker-container">
      <header className="worker-header">
        <h1>{workerType ? workerType.toUpperCase() : "WORKER"} DASHBOARD</h1>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </header>

      {loading && <p>Loading assigned jobs...</p>}

      {!loading && jobs.length === 0 && (
        <p>No assigned work</p>
      )}

      <div className="worker-grid">
        {jobs.map(job => (
          <div key={job.id} className="worker-card">
            <h3>{job.category}</h3>

            <p><b>Student:</b> {job.studentName}</p>
            <p><b>Room:</b> {job.room}</p>
            <p><b>Description:</b> {job.description}</p>

            <span className={`status ${job.status}`}>
              {job.status.replace("_", " ")}
            </span>

            {job.status === "worker_assigned" && (
              <button onClick={() => markArrived(job.id)}>
                Mark Arrived
              </button>
            )}

            {job.status === "arrived" && (
              <button onClick={() => markResolved(job.id)}>
                Mark Resolved
              </button>
            )}

            {job.status === "resolved" && (
              <p className="done-text">✅ Work Completed</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
