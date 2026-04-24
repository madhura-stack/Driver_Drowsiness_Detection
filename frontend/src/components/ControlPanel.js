import React from "react";
import "./ControlPanel.css";
import { postStart, postStop } from "../api";

export default function ControlPanel({ running, setRunning }) {
  const startMonitoring = async () => {
    try {
      await postStart();
      setRunning(true);
    } catch {
      alert("Failed to start monitoring. Check Flask backend.");
    }
  };

  const stopMonitoring = async () => {
    try {
      await postStop();
      setRunning(false);
    } catch {
      alert("Failed to stop monitoring.");
    }
  };

  const stopAlarm = () => {
    window.speechSynthesis.cancel();
    alert("Alarm stopped.");
  };

  const openPetrolBunks = () => {
    window.open("https://www.google.com/maps/search/petrol+bunks+near+me");
  };

  return (
    <div className="control-panel">
      <h3>Control Panel</h3>
      <div className="button-row">
        <button className="btn start-btn" onClick={startMonitoring}>
          ▶ Start Monitoring
        </button>
        <button className="btn stop-btn" onClick={stopMonitoring}>
          ⏹ Stop Monitoring
        </button>
        <button className="btn alarm-btn" onClick={stopAlarm}>
          🔇 Stop Alarm
        </button>
        <button className="btn petrol-btn" onClick={openPetrolBunks}>
          ⛽ Petrol Bunks
        </button>
      </div>

      <div className="quick-settings">
        <h4>Quick Settings</h4>
        <div className="options">
          <label><input type="checkbox" defaultChecked /> Voice Alerts</label>
          <label><input type="checkbox" defaultChecked /> Break Reminders</label>
          <label><input type="checkbox" defaultChecked /> Low Light Mode</label>
        </div>
      </div>
    </div>
  );
}
