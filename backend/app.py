from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
from scipy.spatial import distance
import threading
import time
import pygame


app = Flask(__name__)
CORS(app)


mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(max_num_faces=1, refine_landmarks=True)
mp_drawing = mp.solutions.drawing_utils
drawing_spec = mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=1, circle_radius=1)


LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]
UPPER_LIP = [13, 14]
LOWER_LIP = [17, 0]
MOUTH_CORNERS = [78, 308]

EAR_THRESHOLD = 0.25
MAR_THRESHOLD = 0.6
CONSEC_FRAMES = 20


monitoring = False
camera = None
output_frame = None
frame_lock = threading.Lock()

alarm_playing = False
alarm_should_play = False

counter = 0
yawn_frames = 0
total_yawns = 0

latest_metrics = {
    "drowsy": False,
    "alertness_score": 100,
    "confidence": 0.0,
    "eye_closure_pct": 0,
    "blink_rate_bpm": 0,
    "yawn_freq_per_min": 0,
    "lighting": "Good",
    "break_recommended": False,
}


pygame.mixer.init()
ALARM_PATH = r"C:\Users\madhura G R\Desktop\Driver drowsiness detection\backend\alarm.wav.mpeg"

def play_alarm():
    """Play alarm in loop until manually stopped."""
    global alarm_playing, alarm_should_play
    if alarm_playing:
        return
    alarm_playing = True
    alarm_should_play = True
    threading.Thread(target=_alarm_loop, daemon=True).start()
    print("🚨 Alarm started.")

def _alarm_loop():
    global alarm_playing, alarm_should_play
    try:
        pygame.mixer.music.load(ALARM_PATH)
        while alarm_should_play:
            if not pygame.mixer.music.get_busy():
                pygame.mixer.music.play()
            time.sleep(1)
        pygame.mixer.music.stop()
    except Exception as e:
        print(f"⚠️ Alarm playback error: {e}")
    finally:
        alarm_playing = False

def stop_alarm():
    """Stop alarm manually."""
    global alarm_should_play, alarm_playing
    alarm_should_play = False
    if pygame.mixer.music.get_busy():
        pygame.mixer.music.stop()
    alarm_playing = False
    print("🔕 Alarm stopped.")


def eye_aspect_ratio(landmarks, eye_indices, w, h):
    eye = np.array([(landmarks[i].x * w, landmarks[i].y * h) for i in eye_indices])
    A = distance.euclidean(eye[1], eye[5])
    B = distance.euclidean(eye[2], eye[4])
    C = distance.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

def mouth_aspect_ratio(landmarks, w, h):
    top = distance.euclidean(
        (landmarks[UPPER_LIP[0]].x * w, landmarks[UPPER_LIP[0]].y * h),
        (landmarks[LOWER_LIP[0]].x * w, landmarks[LOWER_LIP[0]].y * h)
    )
    width = distance.euclidean(
        (landmarks[MOUTH_CORNERS[0]].x * w, landmarks[MOUTH_CORNERS[0]].y * h),
        (landmarks[MOUTH_CORNERS[1]].x * w, landmarks[MOUTH_CORNERS[1]].y * h)
    )
    return top / width


def monitor_camera():
    global camera, monitoring, output_frame, counter, yawn_frames, total_yawns, latest_metrics
    camera = cv2.VideoCapture(0)
    if not camera.isOpened():
        print("❌ Camera not accessible.")
        monitoring = False
        return

    print("🎥 Camera started.")
    last_blink_time = time.time()

    while monitoring:
        success, frame = camera.read()
        if not success:
            continue

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(frame_rgb)
        frame_h, frame_w = frame.shape[:2]
        drowsy = False
        confidence = 0.0

        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0].landmark
            left_ear = eye_aspect_ratio(landmarks, LEFT_EYE, frame_w, frame_h)
            right_ear = eye_aspect_ratio(landmarks, RIGHT_EYE, frame_w, frame_h)
            avg_ear = (left_ear + right_ear) / 2.0
            mar = mouth_aspect_ratio(landmarks, frame_w, frame_h)

            if avg_ear < EAR_THRESHOLD:
                counter += 1
            else:
                if 1 < counter < CONSEC_FRAMES:
                    blink_duration = time.time() - last_blink_time
                    latest_metrics["blink_rate_bpm"] = int(60 / blink_duration)
                    last_blink_time = time.time()
                counter = 0

            
            if mar > MAR_THRESHOLD:
                yawn_frames += 1
                if yawn_frames == 15:
                    total_yawns += 1
            else:
                yawn_frames = 0

            
            if counter >= CONSEC_FRAMES or mar > 0.75:
                drowsy = True

           
            ear_conf = max(0, (EAR_THRESHOLD - avg_ear) / EAR_THRESHOLD)
            mar_conf = max(0, (mar - MAR_THRESHOLD) / 0.4)
            confidence = min(1.0, (ear_conf + mar_conf) / 2)

            latest_metrics.update({
                "drowsy": drowsy,
                "alertness_score": round((1 - confidence) * 100),
                "confidence": round(confidence, 2),
                "eye_closure_pct": round((1 - avg_ear / EAR_THRESHOLD) * 100),
                "yawn_freq_per_min": total_yawns,
                "break_recommended": drowsy,
            })

            mp_drawing.draw_landmarks(
                frame, results.multi_face_landmarks[0],
                mp_face_mesh.FACEMESH_CONTOURS, drawing_spec, drawing_spec
            )

            text = "DROWSY!" if drowsy else "AWAKE"
            color = (0, 0, 255) if drowsy else (0, 255, 0)
            cv2.putText(frame, text, (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 3)

            if drowsy:
                play_alarm()
            else:
                stop_alarm()

        ret, buffer = cv2.imencode(".jpg", frame)
        with frame_lock:
            output_frame = buffer.tobytes()
        time.sleep(0.03)

    camera.release()
    stop_alarm()
    print("📷 Camera released.")

@app.route("/")
def home():
    return "✅ Flask Drowsiness Detection Backend Running"

@app.route("/start")
def start_monitoring():
    global monitoring
    if not monitoring:
        monitoring = True
        threading.Thread(target=monitor_camera, daemon=True).start()
        print("▶ Monitoring started")
    return jsonify({"status": "monitoring_started"})

@app.route("/stop")
def stop_monitoring():
    global monitoring
    monitoring = False
    stop_alarm()
    print("⏹ Monitoring stopped")
    return jsonify({"status": "monitoring_stopped"})

@app.route("/stop_alarm")
def stop_alarm_route():
    stop_alarm()
    return jsonify({"status": "alarm_stopped"})

@app.route("/video_feed")
def video_feed():
    def generate():
        global output_frame
        while True:
            if output_frame is None:
                time.sleep(0.05)
                continue
            with frame_lock:
                frame = output_frame
            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")
    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/metrics")
def get_metrics():
    return jsonify(latest_metrics)


if __name__ == "__main__":
    print("🚀 Running Flask backend on http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=False)
