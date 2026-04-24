import React from "react";
import "./MetricsCard.css";

export default function MetricsCard({ metrics }) {
  if (!metrics) {
    return (
      <div className="metrics-card">
        <h3>Drowsiness Detection</h3>
        <p>Loading metrics...</p>
      </div>
    );
  }

  return (
    <div className="metrics-card">
      <h3>Drowsiness Detection / ALERTNESS</h3>
      <div className="bar-container">
        <div
          className="bar-fill"
          style={{ width: `${metrics.alertness_score}%` }}
        ></div>
      </div>

      <div className="metrics-info">
        <p>Confidence: <b>{metrics.confidence}%</b></p>
        <p>Eye Closure: <b>{metrics.eye_closure_pct}%</b></p>
        <p>Blink Rate: <b>{metrics.blink_rate_bpm} bpm</b></p>
        <p>Yawn Frequency: <b>{metrics.yawn_freq_per_min}/min</b></p>
        <p>Head Stability: <b>{metrics.head_stability_pct}%</b></p>
        <p>Lighting: <b>{metrics.lighting}</b></p>
      </div>

      <div className="alert-text">
        {metrics.break_recommended ? (
          <p className="alert">⚠️ Break Recommended!</p>
        ) : (
          <p>No break recommended</p>
        )}
      </div>
    </div>
  );
}
