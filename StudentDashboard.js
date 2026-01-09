import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import ComplaintForm from "./ComplaintForm";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        loadComplaints(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadComplaints = async (email) => {
    setLoading(true);

    const q = query(
      collection(db, "complaints"),
      where("userEmail", "==", email),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    setComplaints(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  // ✅ ONLY ADDED
  const logout = async () => {
    await signOut(auth);
    
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p className="subtitle">Track and manage your complaints</p>
        </div>

        <div className="header-actions">
          <button className="primary-btn" onClick={() => setShowForm(true)}>
            + Raise Complaint
          </button>

          {/* ✅ ONLY ADDED */}
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {loading && <p className="info-text">Loading complaints...</p>}

      {!loading && complaints.length === 0 && (
        <div className="empty-state">
          <p>No complaints raised yet</p>
        </div>
      )}

      <div className="complaint-grid">
        {complaints.map(c => (
          <div key={c.id} className="complaint-card">
            <div className="card-header">
              <h3>{c.category}</h3>
              <span className={`status ${c.status}`}>
                {c.status.replace("_", " ")}
              </span>
            </div>

            <p><b>Name:</b> {c.studentName}</p>
            <p><b>Room:</b> {c.room}</p>

            <p className="description">
              <b>Description:</b> {c.description}
            </p>

            <ComplaintTracking status={c.status} />
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <ComplaintForm
              onClose={() => {
                setShowForm(false);
                loadComplaints(auth.currentUser.email);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* -------- TRACKING COMPONENT -------- */
function ComplaintTracking({ status }) {
  const steps = [
    { key: "submitted", label: "Complaint Submitted" },
    { key: "worker_assigned", label: "Worker Assigned" },
    { key: "arrived", label: "Worker Arrived" },
    { key: "resolved", label: "Work Completed" }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status);

  return (
    <div className="tracking">
      {steps.map((step, index) => {
        let state = "pending";
        if (index < currentStepIndex) state = "completed";
        if (index === currentStepIndex) state = "active";

        return (
          <div key={step.key} className={`tracking-step ${state}`}>
            <div className="dot" />
            <span>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
