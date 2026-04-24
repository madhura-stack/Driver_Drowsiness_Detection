import React from "react";
import "./VideoFeed.css";

export default function VideoFeed() {
  return (
    <div className="video-container">
      <img
        src="http://127.0.0.1:5000/video_feed"
        alt="Camera Feed"
        className="video-frame"
      />
    </div>
  );
}
