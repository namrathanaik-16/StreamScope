# 🎥 StreamScope

<p align="center">
  <b>Playback Observability Platform for MPEG-DASH Streaming</b><br>
  Real-time Playback Analytics • Manifest Intelligence • Network Diagnostics • Engineering Workspace
</p>

<p align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![C++](https://img.shields.io/badge/C++-00599C?style=for-the-badge&logo=cplusplus&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![dash.js](https://img.shields.io/badge/dash.js-000000?style=for-the-badge)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

</p>

---

## 📖 About StreamScope

**StreamScope** is a playback observability platform designed for **MPEG-DASH video streaming**.

It combines real-time playback monitoring, manifest analysis, network diagnostics, playback logging, session reporting, and an engineering-focused runtime inspection workspace into a single dashboard.

The platform enables developers and QA engineers to monitor streaming behaviour, analyze playback performance, investigate network activity, inspect runtime telemetry, and review completed playback sessions.

---

## ✨ Features

### 🎬 Playback Monitoring

StreamScope provides real-time visibility into playback performance:

- MPEG-DASH MPD playback
- Resolution monitoring
- Bitrate monitoring
- Buffer level tracking
- Dropped frame monitoring
- Video codec detection
- Audio codec detection
- Subtitle track detection
- Playback event monitoring
- Quality / representation switch detection

---

### 📊 Playback Analytics

Visualizes important playback metrics throughout the session:

- Buffer level history
- Bitrate history
- Buffer-over-time graph
- Bitrate-over-time graph
- Representation switch tracking
- Adaptive bitrate monitoring

---

### 📑 Manifest Intelligence

Analyzes the loaded MPEG-DASH manifest and extracts:

- MPD Type
- Duration
- DASH Profile
- Period Count
- Video Adaptation Sets
- Audio Adaptation Sets
- Available Resolutions
- Available Video Bitrates
- Full Video Codec Information
- Full Audio Codec Information
- Segment Type
- Segment Duration
- DRM Presence

---

### 🌐 Network Diagnostics

Tracks network activity generated during playback:

- Total Requests
- Completed Requests
- Abandoned Requests
- Completion Rate
- Data Downloaded
- Retry Attempts
- Network Health
- Video Codec
- Audio Codec
- Dropped Frames

---

### 📝 Playback Logs

StreamScope records detailed playback events including:

- Session events
- Playback events
- Buffer events
- Quality / representation events
- Audio track events
- Subtitle events
- Network events
- Playback errors
- Exportable playback logs

---

## ⚙️ Engineering Workspace

StreamScope includes a dedicated **Engineering Workspace** for deeper runtime inspection.

The workspace allows engineers to inspect the underlying runtime telemetry collected during playback without leaving the active session.

### Runtime Data Inspector

The Runtime Data Inspector provides direct access to:

- `bufferHistory`
- `bitrateHistory`
- `networkLogs`
- `getNetworkSummary()`

Each data source can be selected independently to inspect its corresponding runtime information.

The inspector supports:

- Live runtime data during playback
- Complete session data after playback
- Direct inspection of collected telemetry
- Large runtime datasets through the dedicated data viewer

### Mini Video Player

The Engineering Workspace includes a compact video player alongside the Runtime Data Inspector.

The existing playback video element is reused, allowing engineers to continue watching the active stream while inspecting runtime data without creating a second playback session.

### Engineering Mode Workflow

```text
Normal Dashboard
       |
       v
Enter Engineering Mode
       |
       +---- Runtime Data Inspector
       |       |
       |       +---- bufferHistory
       |       +---- bitrateHistory
       |       +---- networkLogs
       |       +---- getNetworkSummary()
       |
       +---- Mini Video Player
                |
                v
        Exit Engineering Mode
                |
                v
        Return to Dashboard
```

---

## 📄 Session Reporting

At the end of a playback session, StreamScope calculates session-level statistics including:

- Playback duration
- Average bitrate
- Highest bitrate
- Lowest bitrate
- Average buffer level
- Dropped frames
- Playback event count
- Representation switch count
- Total network requests
- Completed requests
- Abandoned requests
- Completion rate
- Data downloaded
- Retry attempts
- Playback errors

Session data can be sent to the backend for storage and further analysis.

---

## 🏗️ Architecture

```text
                    +---------------------------+
                    |       StreamScope UI      |
                    |                           |
                    |      HTML / CSS / JS      |
                    +-------------+-------------+
                                  |
                                  v
                    +---------------------------+
                    |       dash.js Player      |
                    |                           |
                    |      MPEG-DASH Playback   |
                    +-------------+-------------+
                                  |
          +-----------------------+-----------------------+
          |                       |                       |
          v                       v                       v
   Playback Metrics       Manifest Analysis       Network Telemetry
          |                       |                       |
          +-----------------------+-----------------------+
                                  |
                                  v
                    +---------------------------+
                    |     Runtime Data Layer    |
                    |                           |
                    |  bufferHistory             |
                    |  bitrateHistory            |
                    |  networkLogs               |
                    |  playbackLogs              |
                    +-------------+-------------+
                                  |
                    +-------------+-------------+
                    |                           |
                    v                           v
          +-------------------+       +----------------------+
          | Dashboard & Charts|       | Engineering Workspace|
          |                   |       |                      |
          | Playback Analytics|       | Runtime Data Inspector|
          | Manifest Analysis |       | Mini Video Player     |
          | Network Summary   |       | Session Data         |
          +-------------------+       +----------------------+
                    |
                    v
          +---------------------------+
          |       C++ Backend         |
          |                           |
          | HTTP Server               |
          | Session Processing        |
          +-------------+-------------+
                        |
                +-------+-------+
                |               |
                v               v
          +-----------+   +-------------+
          |  SQLite   |   |   Session   |
          |  Database |   |   Reports   |
          +-----------+   +-------------+
```

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| Frontend | HTML5, CSS3, JavaScript |
| Streaming | MPEG-DASH, dash.js |
| Visualization | Chart.js |
| Backend | C++ |
| Database | SQLite3 |
| HTTP Server | cpp-httplib |
| JSON Processing | nlohmann/json |
| Web Server | Apache HTTP Server |

---

## 📂 Project Structure

```text
StreamScope/
│
├── index.html
├── style.css
├── script.js
│
├── main.cpp
├── sqlite3.c
├── sqlite3.h
├── httplib.h
├── json.hpp
│
├── report.md
├── StreamScope.db
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Start the Backend

Compile the C++ backend and run:

```bash
main.exe
```

The backend server runs on:

```text
http://localhost:8000
```

### 2. Host the Frontend

Host the StreamScope frontend using an HTTP server such as Apache.

Open:

```text
http://<your-ip>/StreamScope
```

### 3. Start a Playback Session

1. Open StreamScope.
2. Paste a valid MPEG-DASH `.mpd` URL.
3. Click **Analyze Session**.
4. Start playback.
5. Monitor playback metrics and analytics.
6. Inspect the **Manifest Intelligence** section.
7. Monitor **Network Diagnostics**.
8. Open **Engineering Mode**.
9. Inspect:
   - `bufferHistory`
   - `bitrateHistory`
   - `networkLogs`
   - `getNetworkSummary()`
10. Exit Engineering Mode when finished.
11. End the playback session.
12. Review the generated session information and report.

---

## 📊 Key Outputs

StreamScope provides:

- 🎬 Real-time Playback Monitoring
- 📊 Playback Analytics
- 📑 Manifest Intelligence
- 🌐 Network Diagnostics
- 📝 Detailed Playback Logs
- ⚙ Engineering Workspace
- 📄 Session Reporting
- 💾 Session Data Storage

---

## 🎯 Engineering Focus

StreamScope is designed as an **observability and debugging platform for adaptive streaming systems**, rather than only a playback dashboard.

It connects high-level playback metrics with the underlying runtime telemetry, allowing engineers to move from:

```text
Playback Issue
      |
      v
Dashboard Metric
      |
      v
Runtime Telemetry
      |
      v
Detailed Investigation
      |
      v
Session Analysis
```

This makes StreamScope useful for investigating:

- Buffering behaviour
- Bitrate changes
- Representation switches
- Network activity
- Playback errors
- Dropped frames
- MPEG-DASH session health

---

## 🔮 Future Enhancements

Potential future extensions include:

- HLS support
- Historical session analytics
- Session comparison
- Advanced runtime log filtering
- PDF report export
- Cloud-based session storage
- Multi-session analytics
- Authentication and user management

---

## 👩‍💻 Author

**Namratha V Naik**

Information Science & Engineering  
Global Academy of Technology

Software Engineering • Streaming Technologies • Web Development

---

<p align="center">
  ⭐ If you found StreamScope interesting, consider giving the project a star.
</p>
