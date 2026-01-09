import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import "./ComplaintForm.css";

export default function ComplaintForm({ onClose }) {
  const [studentName, setStudentName] = useState("");
  const [block, setBlock] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const submitComplaint = async (e) => {
    e.preventDefault();

    const room = `${block}-${roomNumber}`;

    await addDoc(collection(db, "complaints"), {
      studentName,
      room,
      category,
      description,
      userEmail: auth.currentUser.email,
      status: "submitted",
      createdAt: serverTimestamp(),
      tracking: {
        submittedAt: serverTimestamp(),
        workerAssignedAt: null,
        workStartedAt: null,
        completedAt: null
      }
    });

    onClose();
  };

  return (
    <form className="complaint-form" onSubmit={submitComplaint}>
      <h2>Raise Complaint</h2>

      <input
        placeholder="Student Name"
        value={studentName}
        onChange={e => setStudentName(e.target.value)}
        required
      />

      {/* BLOCK DROPDOWN */}
      <select
        value={block}
        onChange={e => setBlock(e.target.value)}
        required
      >
        <option value="">Select Block</option>
        <option value="A">Block A</option>
        <option value="B">Block B</option>
        <option value="C">Block C</option>
        <option value="D">Block D</option>
        <option value="E">Block E</option>
        <option value="F">Block F</option>
      </select>

      {/* ROOM NUMBER INPUT */}
      <input
        type="text"
        placeholder="Room Number (e.g. 23)"
        value={roomNumber}
        onChange={e => setRoomNumber(e.target.value)}
        required
      />

      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        required
      >
        <option value="">Select Category</option>
        <option value="Electrical">Electrical</option>
        <option value="Plumbing">Plumbing</option>
        <option value="Cleaning">Cleaning</option>
        <option value="Furniture">Furniture</option>
      </select>

      <textarea
        placeholder="Describe your issue clearly..."
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />

      <div className="form-actions">
        <button type="button" onClick={onClose}>Cancel</button>
        <button type="submit" className="primary-btn">Submit</button>
      </div>
    </form>
  );
}
