import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000"; 


export const fetchMetrics = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/metrics`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching metrics:", error);
    return {};
  }
};


export const postStart = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/start`);
    return res.data;
  } catch (error) {
    console.error("❌ Error starting monitoring:", error);
    throw error;
  }
};


export const postStop = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/stop`);
    return res.data;
  } catch (error) {
    console.error("❌ Error stopping monitoring:", error);
    throw error;
  }
};

// 🔹 Stop only the alarm sound
export const postStopAlarm = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/stop_alarm`);
    return res.data;
  } catch (error) {
    console.error("❌ Error stopping alarm:", error);
    throw error;
  }
};

// 🔹 Trigger a break recommendation manually
export const postRecommendBreak = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/recommend_break`);
    return res.data;
  } catch (error) {
    console.error("❌ Error sending break recommendation:", error);
    throw error;
  }
};

// 🔹 Get video feed stream URL
export const getVideoFeed = () => `${BASE_URL}/video_feed`;
