# 🎥 StreamScope

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![C++](https://img.shields.io/badge/C%2B%2B-00599C?style=for-the-badge&logo=cplusplus&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Dash.js](https://img.shields.io/badge/Dash.js-000000?style=for-the-badge)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

# StreamScope

**StreamScope** is a playback observability and analytics platform designed for **MPEG-DASH video streaming**. It combines a real-time monitoring dashboard with a C++ analytics engine to provide comprehensive insights into playback performance, stream quality, and user experience.

The project enables developers and QA engineers to monitor playback sessions, analyze streaming metrics, identify performance issues, and store playback analytics for future analysis.

---

## ✨ Features

### 🎬 Frontend Dashboard

- MPEG-DASH video playback using Dash.js
- Real-time playback monitoring
- Operational health monitoring
- Manifest Intelligence
- Playback Timeline
- Network Diagnostics
- Buffer level monitoring
- Bitrate tracking
- Resolution detection
- Video & Audio codec detection
- Buffer-over-Time chart
- Bitrate-over-Time chart
- Playback event logging
- Export playback session as JSON

---

### ⚙️ Backend Analytics Engine

- Playback session JSON parsing
- Session information analysis
- Manifest summary generation
- Playback statistics analysis
- Network summary generation
- Playback health score calculation
- Representation switch analysis
- Bitrate analysis
- Playback timeline generation
- Playback observations and insights
- SQLite database integration
- Session storage
- Session retrieval

---

## 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript (ES6)
- Dash.js
- Chart.js

### Backend

- C++
- SQLite3
- nlohmann/json

---

## 📊 Analytics Generated

The backend generates detailed playback reports including:

- Session Information
- Manifest Summary
- Playback Statistics
- Network Summary
- Playback Health Score
- Representation Switch Analysis
- Bitrate Analysis
- Playback Timeline
- Playback Observations

---

## 🗄️ Database

Playback sessions are stored in an SQLite database for future analysis.

Each stored session contains:

- Session Start Time
- Session End Time
- Playback Duration
- Average Bitrate
- Highest Bitrate
- Lowest Bitrate
- Average Buffer Level
- Dropped Frames
- Playback Errors
- Playback Health Score

---

## 🚀 Getting Started

### Frontend

1. Host the project using Apache or open it locally.
2. Enter an MPEG-DASH MPD URL.
3. Start playback.
4. Monitor playback analytics in real time.
5. Export the playback session.

### Backend

Compile the backend:

```bash
g++ main.cpp sqlite3.c -o StreamScopeBackend
```

Run the executable:

```bash
./StreamScopeBackend
```

The backend will:

- Read the exported playback session JSON
- Analyze playback metrics
- Generate playback reports
- Store the session in SQLite
- Display analytics in the console

---

## 🏗️ Project Workflow

```text
MPEG-DASH Stream
        │
        ▼
Frontend Dashboard
        │
Real-Time Playback Monitoring
        │
Export Playback Session (JSON)
        │
        ▼
C++ Analytics Engine
        │
Playback Analysis
        │
Health Score Calculation
        │
SQLite Database Storage
```

---

## 📂 Project Structure

```text
StreamScope
│
├── Frontend
│   ├── HTML
│   ├── CSS
│   ├── JavaScript
│   ├── Dash.js Integration
│   └── Chart.js Visualizations
│
└── Backend
    ├── C++
    ├── SQLite
    ├── JSON Parser
    └── Playback Analytics Engine
```

---

## 🔮 Future Enhancements

- Automatic Frontend-to-Backend communication using REST APIs
- Live playback analytics dashboard
- Historical playback reports
- Session comparison
- Trend analysis
- Advanced playback diagnostics
- Playback anomaly detection
- Multi-session analytics dashboard

---

## 👩‍💻 Author

**Namratha V Naik**

Information Science & Engineering Graduate

Frontend Developer • Software Engineer • AI Enthusiast

**GitHub:** https://github.com/namrathanaik-16

---

## 📄 License

This project is intended for educational, internship, and portfolio purposes.
