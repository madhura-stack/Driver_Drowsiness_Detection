import React from 'react';

export default function StatusCard({ metrics }) {
  if (!metrics) {
    return (
      <div className="card status-card">
        <h3>Drowsiness Detection</h3>
        <p>Loading metrics...</p>
      </div>
    );
  }
  return (
    <div className="card status-card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3>Drowsiness Detection</h3>
        <div className={metrics.drowsy ? 'badge-bad' : 'badge-good'}>{metrics.drowsy ? 'ALERT' : 'ALERTNESS'}</div>
      </div>

      <div style={{marginTop:10}}>
        <div className="meter">
          <div className="meter-bar" style={{width: `${metrics.alertness_score}%`, height:18, borderRadius:8}}></div>
          <div style={{textAlign:'right',fontWeight:700}}>{metrics.alertness_score}%</div>
        </div>
        <div style={{marginTop:8}} className="small-muted">Confidence: {Math.round(metrics.confidence*100)}%</div>

        <div style={{marginTop:12}} className="status-list">
          <div>Eye Closure: <strong>{metrics.eye_closure_pct}%</strong></div>
          <div>Blink Rate: <strong>{metrics.blink_rate_bpm} bpm</strong></div>
          <div>Yawn Frequency: <strong>{metrics.yawn_freq_per_min}/min</strong></div>
          <div>Head Stability: <strong>{metrics.head_stability_pct}%</strong></div>
          <div>Lighting: <strong>{metrics.lighting}</strong></div>
        </div>

        <div style={{marginTop:12}}>
          {metrics.break_recommended ? (
            <button onClick={() => { window.alert('Please take a break now'); }}>Stop & Rest</button>
          ) : (
            <small className="small-muted">No break recommended</small>
          )}
        </div>
      </div>
    </div>
  );
}
