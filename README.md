# 🎥 StreamScope

<p align="center">
  <b>Playback Observability Platform for MPEG-DASH Streaming</b><br>
  Real-time playback analytics • Manifest Intelligence • Network Diagnostics • Session Reporting
</p>

<p align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![C++](https://img.shields.io/badge/C++-00599C?style=for-the-badge&logo=cplusplus&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![dash.js](https://img.shields.io/badge/Dash.js-000000?style=for-the-badge)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

</p>

---

# 📖 About StreamScope

**StreamScope** is a Playback Observability Platform developed for **MPEG-DASH video streaming**.

It combines a modern monitoring dashboard with a C++ analytics engine to provide detailed insights into playback quality, adaptive streaming behaviour, network performance, and playback health.

The platform allows developers and QA engineers to monitor playback sessions, analyze streaming metrics, detect playback issues, generate reports, and store session analytics for future analysis.

---

# ✨ Features

## 🎬 Playback Monitoring

- Play MPEG-DASH MPD streams
- Live playback status
- Resolution monitoring
- Bitrate monitoring
- Buffer level tracking
- Dropped frames monitoring

---

## 📊 Playback Analytics

- Buffer Level Graph
- Bitrate Graph
- Representation Switch Detection
- Adaptive Bitrate Monitoring

---

## 📑 Manifest Intelligence

- MPD Type
- Duration
- DASH Profile
- Period Count
- Video Adaptation Sets
- Audio Adaptation Sets
- Available Resolutions
- Available Bitrates
- Video Codec
- Audio Codec
- Segment Type
- Segment Duration
- DRM Detection

---

## 🌐 Network Summary

- Total Requests
- Completed Requests
- Abandoned Requests
- Completion Rate
- Data Downloaded
- Retry Attempts
- Playback Health

---

## 📝 Playback Logs

- Playback Events
- Network Events
- Buffer Events
- Subtitle Events
- Audio Events
- Error Events
- Export Logs as JSON

---

## 📄 Session Report

Automatically generates a Markdown report containing:

- Session Information
- Manifest Information
- Playback Statistics
- Network Summary
- Playback Health Score
- Representation Switch Analysis
- Bitrate Analysis
- Observations

---

## 💾 Backend

- C++ HTTP Server
- SQLite Session Storage
- Markdown Report Generator
- REST APIs
- Session Analytics Engine

---

# 🏗️ Architecture

```text
                +----------------------+
                |     Frontend UI      |
                | HTML • CSS • JS      |
                +----------+-----------+
                           |
                           |
                     HTTP Requests
                           |
                           ▼
               +----------------------+
               |     C++ Backend      |
               | cpp-httplib Server   |
               +----------+-----------+
                           |
          +----------------+----------------+
          |                                 |
          ▼                                 ▼
  SQLite Database                Markdown Report
 Session Storage                 Report Generator
```

---

# 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| Frontend | HTML5, CSS3, JavaScript |
| Streaming | MPEG-DASH, dash.js |
| Visualization | Chart.js |
| Backend | C++ |
| Database | SQLite3 |
| Networking | cpp-httplib |
| JSON | nlohmann/json |

---

# 📂 Project Structure

```text
StreamScope
│
├── index.html
├── style.css
├── script.js
├── main.cpp
├── sqlite3.c
├── sqlite3.h
├── httplib.h
├── json.hpp
├── report.md
├── StreamScope.db
└── README.md
```

---

# 🚀 Getting Started

## Backend

Compile and run

```bash
main.exe
```

Server runs on

```
http://localhost:8000
```

---

## Frontend

Host using Apache Server.

Open

```
http://<your-ip>/StreamScope
```

Enter a valid MPD URL and click **Analyze Session**.

---

# 📊 Output

✔ Playback Dashboard

✔ Manifest Analysis

✔ Network Summary

✔ Playback Logs

✔ Markdown Report

✔ SQLite Session Storage


---

# 🔮 Future Enhancements

- HLS Support
- Historical Analytics Dashboard
- Session Comparison
- PDF Report Export
- User Authentication
- Cloud Database
- Live Streaming Analytics

---

# 👩‍💻 Author

**Namratha V Naik**

Information Science & Engineering

Global Academy of Technology

Software Engineering • Streaming Technologies • Web Development

---

<p align="center">

⭐ If you found this project interesting, consider giving it a star.

</p>
