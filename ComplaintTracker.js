import "./ComplaintTracker.css";

export default function ComplaintTracker({ complaint }) {
  // SAFE fallback if timeline is missing
  const timeline = complaint.timeline || {};

  const steps = [
    { label: "Complaint Submitted", time: timeline.submittedAt },
    { label: "Assigned to Worker", time: timeline.assignedAt },
    { label: "Worker Arrived", time: timeline.arrivedAt },
    { label: "Resolved", time: timeline.resolvedAt },
  ];

  return (
    <div className="tracker">
      {steps.map((step, index) => (
        <div key={index} className="step">
          <span className={`dot ${step.time ? "done" : ""}`} />
          <div>
            <div className="label">{step.label}</div>
            <div className="time">
              {step.time?.seconds
                ? new Date(step.time.seconds * 1000).toLocaleString()
                : "Pending"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
