# StreamScope

StreamScope is a browser-based MPEG-DASH playback diagnostics and analysis tool built to monitor the internal behavior of adaptive video streaming sessions.

The project focuses on playback diagnostics rather than heavy UI design. It provides real-time visibility into playback events, adaptive bitrate behavior, buffering, network requests, media tracks, playback errors, dropped frames, and DASH manifest information.

StreamScope is designed to help understand what happens internally during MPEG-DASH playback and to provide structured diagnostic data that can later be exported, stored, and analyzed.

## Features Implemented

### MPEG-DASH Playback

* Load and play MPEG-DASH streams using an MPD URL
* Adaptive streaming using dash.js
* Support for multiple video and audio representations
* TTML subtitle rendering
* Subtitle and audio track detection

### Playback Monitoring System

StreamScope listens to important playback events and records them with timestamps, playback time, and additional playback context.

Events currently monitored include:

* Stream loading
* Playback started
* Playback playing
* Playback paused
* Playback seeking
* Playback seeked
* Playback ended
* Buffer empty
* Buffer loaded
* Video representation switches
* Subtitle tracks detected
* Subtitle track changes
* Audio tracks detected
* Audio track changes
* Playback and player errors

Each diagnostic event can include information such as:

* Timestamp
* Event category
* Event type
* Current playback time
* Current resolution
* Current bitrate
* Buffer level
* Playback state
* Playback rate
* Additional event-specific details

## Live Playback Diagnostics

The dashboard displays real-time playback information including:

* Current video resolution
* Current bitrate
* Current buffer level
* Dropped video frames
* Video codec
* Audio codec

These metrics update during playback and provide immediate visibility into the current playback state.

## Network Monitoring

StreamScope monitors network and fragment requests generated during playback.

The network diagnostics include:

* Total requests
* Completed requests
* Abandoned requests
* Request completion rate
* Total data downloaded
* Total retry attempts

The system also records detailed request information that can help investigate segment delivery and network-related playback problems.

## Playback Error Logging

Detailed playback and network errors are captured for diagnostics.

Error information can include:

* Error code
* Error message
* Request URL
* Request type
* HTTP response details
* Playback context
* Additional error information

This helps distinguish between playback failures caused by the player, network requests, media delivery, or other streaming problems.

## Adaptive Bitrate and Representation Monitoring

StreamScope records video representation switches during playback.

Each representation-switch event can include:

* Previous representation
* New representation
* Resolution
* Bitrate
* Playback time
* Buffer level
* Current playback context

Example:

```text
Category: QUALITY
Event: REPRESENTATION_SWITCH

From:
Resolution: 3840x2160
Bitrate: 5.68 Mbps

To:
Resolution: 3840x2160
Bitrate: 10.87 Mbps
```

This makes it possible to observe how the adaptive bitrate algorithm reacts to changing playback and network conditions.

## Live Diagnostic Graphs

StreamScope currently provides two real-time graphs:

### Buffer Level Over Time

Displays how the playback buffer changes during the session.

The graph:

* Updates during active playback
* Stops updating when the video is paused
* Maintains a rolling display of recent data points
* Retains the complete buffer history for future session analysis

### Bitrate Over Time

Displays the selected video bitrate throughout playback.

This graph helps visualize:

* Adaptive bitrate changes
* Representation switching behavior
* Bitrate stability during playback

The graph also maintains a rolling display while retaining the complete bitrate history.

## DASH Manifest Analyzer

StreamScope analyzes the loaded MPEG-DASH MPD and displays important manifest information.

The analyzer currently extracts:

### Basic MPD Information

* MPD type
* Media duration
* DASH profile
* Number of periods

### Track and Representation Information

* Number of video adaptation sets
* Number of audio adaptation sets
* Available video resolutions
* Available video bitrates
* Video codec information
* Audio codec information

### Segment Information

* Segment type
* Segment duration

### Content Protection

* DRM presence detection

The analyzer automatically refreshes when a different MPD is loaded.

## Diagnostic Log Structure

Playback events are stored as structured JavaScript objects.

Example:

```json
{
  "timestamp": "2026-07-09T08:52:37.897Z",
  "category": "QUALITY",
  "event": "REPRESENTATION_SWITCH",
  "playbackTime": 0.25427,
  "details": {
    "from": {
      "resolution": "1920x1080",
      "bitrate": 2067007
    },
    "to": {
      "resolution": "1920x1080",
      "bitrate": 2003095
    }
  }
}
```

This structured approach prepares the playback data for future JSON export and offline analysis.

## How It Works

1. Enter a valid MPEG-DASH `.mpd` URL.
2. StreamScope initializes the dash.js player.
3. The MPD is analyzed.
4. The video begins playback.
5. Playback, buffer, quality, subtitle, audio, network, and error events are monitored.
6. Live playback metrics are displayed.
7. Buffer and bitrate history are visualized using live graphs.
8. Diagnostic data is stored during the playback session.

## Technologies Used

* HTML
* CSS
* JavaScript
* dash.js
* Chart.js
* MPEG-DASH
* TTML subtitles

## Project Architecture

The current browser-side flow is:

```text
MPD URL
    ↓
dash.js Player
    ↓
Manifest Analysis
    ↓
Video Playback
    ↓
Playback Event Monitoring
    ↓
Network and Error Monitoring
    ↓
Live Diagnostics and Graphs
    ↓
Structured Session Data
```

The planned complete architecture is:

```text
Browser / JavaScript
        ↓
Playback Session JSON
        ↓
C++ Diagnostic Processor
        ↓
SQLite3 Database
        ↓
Playback Diagnostics
```

## Current Project Status

StreamScope is under active development.

The browser-based playback monitoring and manifest analysis stages are complete for the currently selected features.

### Next Development Stages

* Central playback session object
* End Session functionality
* Final session statistics
* Complete session JSON export
* C++ JSON processing application
* Playback session validation
* SQLite3 session storage
* Offline diagnostic rule engine

The future diagnostic engine will identify playback problems such as:

* Frequent buffering
* Excessive total stall time
* Unstable quality switching
* Repeated buffer depletion
* Manifest loading failures
* Network or segment delivery problems

## Project Goal

The goal of StreamScope is to build a practical playback diagnostics system that connects browser-based MPEG-DASH monitoring with offline C++ analysis.

Rather than only playing video, StreamScope aims to explain what happened during a playback session by collecting structured data about:

* Playback behavior
* Adaptive bitrate changes
* Buffer conditions
* Network requests
* Playback errors
* Media tracks
* Dropped frames
* Manifest structure

The long-term goal is to turn this information into persistent session history and meaningful diagnostic results.

## Author

Namratha Naik
