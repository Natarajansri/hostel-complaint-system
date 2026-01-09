import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import "./AdminDashboard.css";

/* ===============================
   AI ANALYSIS HELPERS
   =============================== */

// Extract block from room (A-23 → A)
const getBlockFromRoom = (room) => {
  if (!room) return "Unknown";
  return room.charAt(0).toUpperCase();
};

const analyzeComplaints = (complaints) => {
  const blockCategoryCount = {};
  const categoryCount = {};

  complaints.forEach(c => {
    const block = getBlockFromRoom(c.room);
    const category = c.category;

    if (!blockCategoryCount[block]) {
      blockCategoryCount[block] = {};
    }

    blockCategoryCount[block][category] =
      (blockCategoryCount[block][category] || 0) + 1;

    categoryCount[category] =
      (categoryCount[category] || 0) + 1;
  });

  return { blockCategoryCount, categoryCount };
};

const generateInsights = (analysis, complaints) => {
  const insights = [];
  const { blockCategoryCount, categoryCount } = analysis;

  if (complaints.length === 0) return insights;

  const now = new Date();
  const last24HoursCount = complaints.filter(c => {
    if (!c.createdAt) return false;
    const createdTime = c.createdAt.toDate();
    return now - createdTime <= 24 * 60 * 60 * 1000;
  }).length;

  insights.push({
    type: "neutral",
    text: `${last24HoursCount} complaints were received in the last 24 hours.`
  });

  const unresolved = complaints.filter(c => c.status !== "resolved");

  const sortedCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1]);

  const [topCategory, topCount] = sortedCategories[0];
  const percent = Math.round((topCount / complaints.length) * 100);

  insights.push({
    type: "info",
    text: `${topCategory} is the most reported department, accounting for ${percent}% of total complaints.`
  });

  const blockTotals = {};
  Object.keys(blockCategoryCount).forEach(block => {
    blockTotals[block] = Object.values(blockCategoryCount[block])
      .reduce((a, b) => a + b, 0);
  });

  const topBlock = Object.entries(blockTotals)
    .sort((a, b) => b[1] - a[1])[0][0];

  insights.push({
    type: "neutral",
    text: `${topBlock} Block currently reports the highest number of complaints overall.`
  });

  if (unresolved.length > 0) {
    insights.push({
      type: "action",
      text: `Recommended action: prioritize preventive maintenance for ${topCategory} in ${topBlock} Block.`
    });
  }

  return insights;
};

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [selectedType, setSelectedType] = useState({});
  const [aiInsights, setAiInsights] = useState([]);
  const [showAI, setShowAI] = useState(false);

  /* FILTER STATES */
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBlock, setFilterBlock] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "complaints"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setComplaints(data);

      const analysis = analyzeComplaints(data);
      const insights = generateInsights(analysis, data);
      setAiInsights(insights);
    });

    return () => unsub();
  }, []);

  const assignWorker = async (complaint) => {
    const type = selectedType[complaint.id];
    if (!type) {
      alert("Please select worker type");
      return;
    }

    await updateDoc(doc(db, "complaints", complaint.id), {
      assignedWorkerType: type,
      status: "worker_assigned",
      "tracking.workerAssignedAt": serverTimestamp()
    });

    alert("Worker assigned successfully");
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    await deleteDoc(doc(db, "complaints", id));
  };

  const logout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  /* APPLY FILTERS */
  const filteredComplaints = complaints.filter(c => {
    const block = getBlockFromRoom(c.room);

    const categoryMatch =
      filterCategory === "" || c.category === filterCategory;

    const blockMatch =
      filterBlock === "" || block === filterBlock;

    return categoryMatch && blockMatch;
  });

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>

        <div className="admin-header-actions">
           {/* FILTERS */}
  <div className="admin-filters">
    <select
      value={filterCategory}
      onChange={e => setFilterCategory(e.target.value)}
    >
      <option value="">All Categories</option>
      <option value="Electrical">Electrical</option>
      <option value="Plumbing">Plumbing</option>
      <option value="Carpentry">Carpentry</option>
      <option value="Cleaning">Cleaning</option>
       
    </select>

    <select
      value={filterBlock}
      onChange={e => setFilterBlock(e.target.value)}
    >
      <option value="">All Blocks</option>
      <option value="A">Block A</option>
      <option value="B">Block B</option>
      <option value="C">Block C</option>
      <option value="D">Block D</option>
      <option value="E">Block E</option>
      <option value="F">Block F</option>
    </select>
  </div>
          <button className="ai-toggle-btn" onClick={() => setShowAI(true)}>
            AI
          </button>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      {/* FILTER SECTION */}
       

      {/* AI MODAL */}
      {showAI && (
        <div className="ai-modal-overlay">
          <div className="ai-modal">
            <div className="ai-modal-header">
              <h2>AI Analysis Report</h2>
              <button className="close-btn" onClick={() => setShowAI(false)}>
                ✕
              </button>
            </div>

            <div className="ai-modal-content">
              <ul>
                {aiInsights.map((item, i) => (
                  <li key={i} className={item.type}>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* COMPLAINTS GRID */}
      <div className="admin-grid">
        {filteredComplaints.map(c => (
          <div key={c.id} className="admin-card">
            <h3>{c.category}</h3>

            <p><b>Student:</b> {c.studentName}</p>
            <p><b>Email:</b> {c.userEmail}</p>
            <p><b>Room:</b> {c.room}</p>
            <p><b>Description:</b> {c.description}</p>

            <div className="admin-actions">
              <span className={`status ${c.status}`}>
                {c.status.replace("_", " ")}
              </span>

              <select
                value={selectedType[c.id] || ""}
                onChange={e =>
                  setSelectedType({
                    ...selectedType,
                    [c.id]: e.target.value
                  })
                }
              >
                <option value="">Assign Worker</option>
                <option value="electrician">Electrician</option>
                <option value="plumber">Plumber</option>
                <option value="carpenter">Carpenter</option>
                <option value="cleaner">Cleaner</option>
              </select>

              <button onClick={() => assignWorker(c)}>Assign</button>

              <button
                className="delete-btn"
                onClick={() => deleteComplaint(c.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
