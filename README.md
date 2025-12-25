#  CodePulse – POTD & Contest Tracker

**CodePulse** is a Chrome extension designed for competitive programmers to stay consistent and never miss important coding events.  
It helps you **track POTD (Problem of the Day)** and **get notified about upcoming contests** from popular coding platforms.

---

## ✨ Features

### 🔥 Problem of the Day (POTD)
- Track **LeetCode POTD**
- Track **GeeksforGeeks (GFG) POTD**
- Daily reset at **12:00 AM**
- One-click access to open the problem

### 📅 Upcoming Contests
- Shows upcoming contests from:
  - **LeetCode**
  - **Codeforces**
  - **CodeChef**
- Contest data fetched using **Clist API**
- Displays contest name, platform, and start time

### 🔔 Smart Notifications 
- Reminder system for upcoming contests
- Helps you stay prepared and never miss a contest
- more features are in pipeline
---

## 🛠️ Tech Stack

- **Chrome Extension (Manifest V3)**
- **JavaScript**
- **HTML & CSS**
- **Clist API** (for contest data)
- **Chrome Storage & Alarms API**

---

## 📦 Project Structure
```
contest-extension/
├── manifest.json
├── popup/
│ ├── popup.html
│ ├── popup.js
│ └── popup.css
├── background/
│ └── background.js
├── assets/
│ └── icons/
│ ├── icon16.png
│ ├── icon48.png
│ └── icon128.png
└── README.md
```
---

## 🧩 Permissions Used

| Permission | Purpose |
|----------|---------|
| `storage` | Store user preferences and POTD status |
| `alarms` | Schedule reminders for contests |
| `https://clist.by/*` | Fetch public contest information |

---
## 🚀 Installation (Extension)
1. Add the extension:
   ```bash
   https://chromewebstore.google.com/detail/potd-and-contests-tracker/ffojbjepmonngkcabnicaemnefoklpdg?authuser=0&hl=en
   
   

2. Clone the repository:
   ```bash
   git clone https://github.com/ultimatrix2/CodePulse.git

