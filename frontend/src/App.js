import React, { useEffect, useState } from "react";
import "./App.css";
import ControlPanel from "./components/ControlPanel";
import MetricsCard from "./components/MetricsCard";
import VideoFeed from "./components/VideoFeed";
import { fetchMetrics } from "./api";

export default function App() {
  const [metrics, setMetrics] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await fetchMetrics();
        setMetrics(data);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🚗</span> SafeDrive
        </div>
        <div className="tagline">Driver Safety Monitor</div>
        <div className="status">{running ? "🟢 Running" : "🔴 Stopped"}</div>
      </header>

      <ControlPanel running={running} setRunning={setRunning} />

      <div className="dashboard">
        <div className="camera-card">
          <h3>Real-time Monitoring</h3>
          <VideoFeed />
        </div>
        <MetricsCard metrics={metrics} />
      </div>

      <footer className="footer">
        <p>Provides audio alerts for drowsiness or break recommendations.</p>
      </footer>
    </div>
  );
}
