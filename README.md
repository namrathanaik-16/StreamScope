# StreamScope

StreamScope is a browser-based MPEG-DASH playback diagnostics tool built to monitor and log important events that occur during adaptive video streaming.

The project focuses on playback behavior and diagnostics rather than heavy UI design. It provides visibility into playback state, buffering, adaptive bitrate changes, subtitle tracks, and other streaming events.

## Features Implemented

* Load and play MPEG-DASH streams using an MPD URL
* Live playback diagnostics
* Playback state monitoring
* Current video resolution display
* Current bitrate display
* Buffer level monitoring
* Session event logging
* Playback event logging
* Buffer event logging
* Representation and quality-switch logging
* Subtitle track detection
* TTML subtitle rendering
* Subtitle track-change logging
* Playback context captured with diagnostic events

## Playback Events Logged

StreamScope currently captures events such as:

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

## Technologies Used

* HTML
* CSS
* JavaScript
* dash.js
* MPEG-DASH
* TTML subtitles

## How It Works

1. Enter a valid MPEG-DASH `.mpd` URL.
2. StreamScope initializes the DASH player.
3. The video starts playing in the browser.
4. Live playback information is displayed in the diagnostics section.
5. Playback events are collected with timestamps and playback context.
6. Quality changes, buffering behavior, and subtitle information are recorded for debugging and analysis.

## Diagnostic Log Structure

Each event is stored with information such as:

```text
timestamp
category
event
playbackTime
details
```

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

## Current Project Status

StreamScope is under active development.

Upcoming features include:

* Live playback logs displayed directly on the webpage
* Network and fragment request monitoring
* Detailed playback error logging
* DRM-related event monitoring
* Audio track monitoring
* Live diagnostic graphs
* Session log export
* SQLite-based playback session storage

## Purpose

The goal of StreamScope is to better understand the internal behavior of MPEG-DASH playback systems and create a practical tool for analyzing streaming sessions, adaptive bitrate behavior, buffering, subtitles, and playback failures.

## Author

Namratha Naik
