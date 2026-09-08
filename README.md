<div align="center">

  <!-- 3D Animated Hero Header -->
  <svg viewBox="0 0 800 240" width="100%" height="240" xmlns="http://www.w3.org/2000/svg" style="border-radius: 24px; box-shadow: 0 20px 40px -15px rgba(37,99,235,0.4);">
    <defs>
      <!-- Background Linear Gradient -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="50%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>

      <!-- 3D Neon Tube Gradient with Animation -->
      <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38bdf8">
          <animate attributeName="stop-color" values="#38bdf8;#818cf8;#c084fc;#38bdf8" dur="6s" repeatCount="indefinite" />
        </stop>
        <stop offset="50%" stop-color="#6366f1">
          <animate attributeName="stop-color" values="#6366f1;#ec4899;#38bdf8;#6366f1" dur="6s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stop-color="#a855f7">
          <animate attributeName="stop-color" values="#a855f7;#38bdf8;#818cf8;#a855f7" dur="6s" repeatCount="indefinite" />
        </stop>
      </linearGradient>

      <!-- Isometric 3D Keycap Shadows & Gradients -->
      <filter id="shadow3D" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#000000" flood-opacity="0.6"/>
        <feDropShadow dx="0" dy="2" stdDeviation="1" flood-color="#6366f1" flood-opacity="0.5"/>
      </filter>

      <linearGradient id="keyTop" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
      <linearGradient id="keyAccent" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4f46e5"/>
        <stop offset="100%" stop-color="#3730a3"/>
      </linearGradient>

      <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#334155" stroke-width="0.75" stroke-opacity="0.25"/>
      </pattern>
    </defs>

    <!-- Canvas Background with Grid -->
    <rect width="800" height="240" rx="20" fill="url(#bgGrad)" />
    <rect width="800" height="240" rx="20" fill="url(#gridPattern)" />

    <!-- Animated Ambient Light Orbs in 3D Depth -->
    <circle cx="160" cy="60" r="100" fill="#3b82f6" opacity="0.15">
      <animate attributeName="r" values="80;120;80" dur="4s" repeatCount="indefinite" />
      <animate attributeName="cx" values="140;180;140" dur="5s" repeatCount="indefinite" />
    </circle>
    <circle cx="640" cy="180" r="90" fill="#a855f7" opacity="0.18">
      <animate attributeName="r" values="70;110;70" dur="5s" repeatCount="indefinite" />
      <animate attributeName="cy" values="190;160;190" dur="6s" repeatCount="indefinite" />
    </circle>

    <!-- 3D Floating Isometric Mechanical Keycaps -->
    <g transform="translate(70, 75)" filter="url(#shadow3D)">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-8; 0,0" dur="3s" repeatCount="indefinite" ease="easeInOut"/>
        <!-- Side depth -->
        <rect x="0" y="8" width="56" height="56" rx="12" fill="#0f172a" />
        <!-- Top key face -->
        <rect x="0" y="0" width="56" height="52" rx="12" fill="url(#keyTop)" stroke="#475569" stroke-width="1.5"/>
        <text x="28" y="32" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="900" text-anchor="middle">W</text>
      </g>
    </g>

    <g transform="translate(138, 55)" filter="url(#shadow3D)">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-10; 0,0" dur="2.7s" begin="0.3s" repeatCount="indefinite" ease="easeInOut"/>
        <rect x="0" y="8" width="56" height="56" rx="12" fill="#1e1b4b" />
        <rect x="0" y="0" width="56" height="52" rx="12" fill="url(#keyAccent)" stroke="#818cf8" stroke-width="1.5"/>
        <text x="28" y="32" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="900" text-anchor="middle">P</text>
      </g>
    </g>

    <g transform="translate(206, 75)" filter="url(#shadow3D)">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-7; 0,0" dur="3.2s" begin="0.6s" repeatCount="indefinite" ease="easeInOut"/>
        <rect x="0" y="8" width="56" height="56" rx="12" fill="#0f172a" />
        <rect x="0" y="0" width="56" height="52" rx="12" fill="url(#keyTop)" stroke="#475569" stroke-width="1.5"/>
        <text x="28" y="32" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="900" text-anchor="middle">M</text>
      </g>
    </g>

    <!-- Main Title with 3D Depth & Glowing Text Gradient -->
    <text x="510" y="98" fill="url(#neonGlow)" font-family="system-ui, -apple-system, sans-serif" font-size="40" font-weight="900" text-anchor="middle" letter-spacing="1">
      TYPING SPEED TEST
    </text>

    <!-- Subtitle / Tagline -->
    <text x="510" y="134" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" text-anchor="middle" letter-spacing="2">
      ⚡ REAL-TIME WPM • ACCURACY • ERGONOMIC KEYBOARD
    </text>

    <!-- Dynamic Animated Typing Prompt Simulation -->
    <g transform="translate(340, 162)">
      <rect width="340" height="34" rx="17" fill="#0f172a" stroke="#334155" stroke-width="1.5" />
      <circle cx="20" cy="17" r="4" fill="#22c55e" />
      <text x="36" y="22" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="600">
        ready &gt; test_your_speed_now
      </text>
      <!-- Blinking 3D Cursor -->
      <line x1="242" y1="10" x2="242" y2="24" stroke="#a855f7" stroke-width="2.5">
        <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite" />
      </line>
    </g>
  </svg>

  <br/><br/>

  <!-- 3D Animated Live Project Call To Action Button -->
  <a href="https://typing-speed-checker-liard.vercel.app/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/🚀_LAUNCH_LIVE_PROJECT-https%3A%2F%2Ftyping--speed--checker--liard.vercel.app%2F-2563eb?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo Link" height="42" />
  </a>
  <a href="https://typing-speed-checker-liard.vercel.app/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/STATUS-LIVE_%26_OPERATIONAL-059669?style=for-the-badge&logo=statuspal&logoColor=white" alt="Project Status" height="42" />
  </a>

  <br/><br/>

  <!-- Tech Stack & Feature Badges in 3D Style -->
  <p>
    <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 18" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Web_Audio_API-F59E0B?style=for-the-badge&logo=soundcharts&logoColor=white" alt="Web Audio API" />
    <img src="https://img.shields.io/badge/Mobile_Responsive-10B981?style=for-the-badge&logo=capacitor&logoColor=white" alt="Mobile Responsive" />
  </p>

  <p>
    <strong>🌐 Production Deployment:</strong>
    <a href="https://typing-speed-checker-liard.vercel.app/">
      <code>https://typing-speed-checker-liard.vercel.app/</code>
    </a>
  </p>

</div>

---

## 🌟 Overview

**Typing Speed Test** is a high-precision, production-grade typing analytics application engineered with **React 18**, **TypeScript**, and **Tailwind CSS**. It delivers real-time calculation of **Words Per Minute (WPM)**, **Characters Per Minute (CPM)**, **Accuracy percentage**, and **Keystroke Consistency** with interactive visual keyboard feedback and cross-device mobile support.

Whether you are practicing on a desktop mechanical keyboard, a laptop, a tablet, or a mobile phone, the app adapts fluidly with zero friction.

---

## 🚀 Live Demo

Experience the live application right now in your browser:

> ### 🔗 **[https://typing-speed-checker-liard.vercel.app/](https://typing-speed-checker-liard.vercel.app/)**

---

## ✨ Key Features

<table>
  <tr>
    <td width="50%">
      <h3>⚡ Real-Time Typing Engine</h3>
      <ul>
        <li><b>Adjusted & Raw WPM</b> calculations following standard 5-keystroke net scoring algorithms.</li>
        <li><b>Live Accuracy & CPM</b> metrics updated seamlessly on every character stroke.</li>
        <li><b>Consistency Score</b> derived from standard deviation of character interval timing.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🎯 Target WPM Goal & Audio Alerts</h3>
      <ul>
        <li>Set a customized WPM target (Off, 40, 60, 80, 100, or any custom speed up to 300 WPM).</li>
        <li>Subtle celebration banner when reaching your target goal during active tests.</li>
        <li>Synthesized mechanical sound engine with pleasant success chimes via <b>Web Audio API</b>.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>⌨️ Interactive Ergonomic Keyboard</h3>
      <ul>
        <li>Full QWERTY layout with color-coded finger placement mapping.</li>
        <li>Real-time visual key activation as you type.</li>
        <li>Toggleable live keypress indicator and hands guide.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📱 100% Cross-Device & Mobile Ready</h3>
      <ul>
        <li>Automatic mobile detection with virtual keyboard auto-focus.</li>
        <li>Touch-friendly tap-to-focus triggers with optimized <code>inputMode="text"</code>.</li>
        <li>Adaptive SVG trend charts and clean fluid layouts across phones, tablets, and monitors.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📊 Analytical History & Trends</h3>
      <ul>
        <li>Performance trend graph charting your WPM progression over time.</li>
        <li>Detailed mistake breakdown showing error rates per key.</li>
        <li>Filter by difficulty levels (Easy, Medium, Hard) and test modes.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🎨 Deep Customization & Export</h3>
      <ul>
        <li><b>Theme Support:</b> Dark mode, Light mode, and High-Contrast accessibility.</li>
        <li><b>Test Durations:</b> Presets (15s, 30s, 60s, 120s) or custom duration up to 600s.</li>
        <li><b>Export Cards:</b> Download shareable scorecards as clean PNG images or JSON records.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 📱 Mobile & Cross-Device Compatibility

The application is engineered to work reliably on **any device**:

- 💻 **Desktops & Laptops:** Full hardware keyboard tracking, layout guides, and space/backspace navigation.
- 📱 **Smartphones & Touch Devices:** Transparent focus listener that opens mobile on-screen keyboards smoothly on tap without viewport jumping or zoom disorientations.
- 📟 **Tablets & iPads:** Responsive bento grid layout with scaled typography and thumb-friendly controls.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/) with strict type safety
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom dark/light theme switching
- **Icons:** [Lucide React](https://lucide.dev/)
- **Audio:** Native [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (zero external audio file dependencies, instant synthesizer)
- **Data Persistence:** Client-side `localStorage` with migration resilience and export tools
- **Deployment:** [Vercel](https://vercel.com/)

---

## 📂 Project Structure

```bash
typing-speed-test/
├── src/
│   ├── components/
│   │   ├── ActiveTestScreen.tsx   # Live typing arena, keystroke listeners & WPM alert
│   │   ├── HelpModal.tsx          # Touch typing ergonomic instructions & shortcuts
│   │   ├── HistoryScreen.tsx      # Trend charts, error key analysis & records
│   │   ├── HomeScreen.tsx         # Dashboard, mode selections & quick start
│   │   ├── KeyboardLayout.tsx     # 3D-styled interactive virtual keyboard
│   │   ├── Navbar.tsx             # Theme toggler, navigation & settings modal launch
│   │   ├── PreparationScreen.tsx  # Countdown & instructions before test begins
│   │   ├── ResultsScreen.tsx      # Score summary card, accuracy gauge & PNG export
│   │   ├── SettingsModal.tsx      # Durations, Target WPM, audio & visual options
│   │   └── Toast.tsx              # Notifications for resets, exports & alerts
│   ├── data/                      # Wordlists & quote text banks
│   ├── services/
│   │   ├── soundEngine.ts         # Pure Web Audio synthesizer for keyclicks & chimes
│   │   ├── storageService.ts      # Local history & user preferences persistence
│   │   └── textGenerator.ts       # Dynamic text synthesis (words, sentences, code)
│   ├── utils/
│   │   └── calculations.ts        # Mathematical algorithms for WPM, CPM, Accuracy
│   ├── types.ts                   # Core TypeScript interfaces & enum models
│   ├── App.tsx                    # Main app state controller & view router
│   ├── main.tsx                   # React root entry point
│   └── index.css                  # Tailwind styles & theme variables
├── index.html                     # HTML5 entry with synced SEO metadata
├── metadata.json                  # Application capabilities & manifest
├── package.json                   # Dependencies & npm scripts
└── README.md                      # Project documentation
```

---

## 💻 Local Development Setup

Clone the repository and run the development server locally:

### 1. Clone the repository
```bash
git clone https://github.com/your-username/typing-speed-checker.git
cd typing-speed-checker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the Vite development server
```bash
npm run dev
```

Visit `http://localhost:3000` in your web browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🧮 Mathematical Scoring Standard

The test adheres to internationally accepted standard typing speed benchmarks:

$$\text{Raw WPM} = \frac{\text{Total Keystrokes} / 5}{\text{Time in Minutes}}$$

$$\text{Net / Adjusted WPM} = \max\left(0, \, \frac{(\text{Correct Keystrokes} / 5) - \text{Uncorrected Errors}}{\text{Time in Minutes}}\right)$$

$$\text{Accuracy (\%)} = \left( \frac{\text{Correct Keystrokes}}{\text{Total Typed Keystrokes}} \right) \times 100$$

---

## 🌐 Live Link

Always access the latest deployed version here:
👉 **[https://typing-speed-checker-liard.vercel.app/](https://typing-speed-checker-liard.vercel.app/)**

---

<div align="center">
  <sub>Built with ❤️ for speed typists, developers, and learners worldwide.</sub>
</div>
