import React from 'react';
import { postRecommendBreak } from '../api';

export default function BreakRecommendations({ metrics }) {
  const markBreak = async () => {
    await postRecommendBreak();
    window.alert('Break marked taken.');
  };

  const next = metrics ? Math.round(metrics.break_next_in_s / 60) : '-';

  return (
    <div className="card">
      <h3>Break Recommendations</h3>
      <div style={{marginTop:10}}>
        <div>Current session: {metrics ? new Date(metrics.session_start*1000).toLocaleTimeString() : '-'}</div>
        <div style={{marginTop:8}}>Next Break In: <strong>{next} min</strong></div>
        <div style={{height:10,background:'#f1f5f9',borderRadius:8,marginTop:8}}>
          <div style={{width:'40%',height:10,background:'#0b5cff'}}></div>
        </div>
        <div style={{marginTop:12}}><button onClick={markBreak}>Mark Break Taken</button></div>
      </div>

      <div style={{marginTop:12}}>
        <h4>Break Suggestions</h4>
        <ul>
          <li>Grab a coffee or tea (10-15 min)</li>
          <li>Walk around your vehicle (5-10 min)</li>
          <li>Stretch at a rest area (10-20 min)</li>
          <li>Power nap (15-20 min)</li>
        </ul>
      </div>
    </div>
  );
}
