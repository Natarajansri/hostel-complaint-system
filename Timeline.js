import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";

function Timeline({ complaintId }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const load = async () => {
      const q = query(
        collection(db, "complaints", complaintId, "timeline"),
        orderBy("time", "asc")
      );

      const snap = await getDocs(q);
      setEvents(snap.docs.map(d => d.data()));
    };

    load();
  }, [complaintId]);

  return (
    <div className="timeline">
      {events.map((e, i) => (
        <div key={i} className="timeline-item">
          <div className="dot" />
          <div>
            <b>{e.title}</b>
            <div className="time">
              {e.time?.toDate().toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Timeline;
