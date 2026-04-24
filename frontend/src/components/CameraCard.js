import React from 'react';
export default function CameraCard() {
  return (
    <div className="card camera-card">
      <h3>Real-time Monitoring</h3>
      <div className="camera-frame">
        <img src="/video_feed" alt="Live feed" />
      </div>
      <div style={{marginTop:10}} className="small-muted">Camera Feed</div>
    </div>
  );
}
