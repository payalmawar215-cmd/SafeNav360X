# 🚀 SafeNav360X

## 📌 Overview

SafeNav360X is a smart safety-focused navigation web app designed to help users find safer routes using real-time data and intelligent insights. Whether you're commuting through busy city streets or exploring unfamiliar areas, SafeNav360X provides real-time safety alerts and risk indicators to help you make informed routing decisions.

---

## ✨ Features

* 🧭 **Smart Route Suggestions** - AI-powered route recommendations based on safety metrics
* 🚨 **Safety Alerts & Risk Indicators** - Real-time alerts for high-risk areas
* 🗺️ **Interactive Maps** - Leaflet integration for intuitive navigation
* ⚡ **Fast UI** - Built with Vite + React for optimal performance
* 🎨 **Modern Design** - Responsive interface using Tailwind CSS
* 📱 **User-Friendly** - Intuitive controls for all experience levels

---

## 🛠️ Tech Stack

* **Frontend Framework**: React
* **Build Tool**: Vite
* **Styling**: Tailwind CSS
* **Mapping**: React Leaflet
* **Additional**: Base44 SDK (Safety data integration)

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v16 or higher)
* npm or yarn package manager
* Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/payalmawar215-cmd/SafeNav360X.git
   cd SafeNav360X
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local` with your API keys and configuration.

### Running Locally

**Development mode:**
```bash
npm run dev
# or
yarn dev
```
The app will be available at `http://localhost:5173`

**Build for production:**
```bash
npm run build
# or
yarn build
```

**Preview production build:**
```bash
npm run preview
# or
yarn preview
```

---

## 📂 Project Structure

```
SafeNav360X/
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API services and utilities
│   ├── styles/          # Global styles
│   ├── App.jsx
│   └── main.jsx
├── public/              # Static assets
├── .env.example         # Example environment variables
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 💻 Usage

1. Open the app in your browser after running `npm run dev`
2. Enter your starting location and destination
3. View smart route suggestions with safety ratings
4. Check real-time safety alerts along your route
5. Select your preferred route based on safety metrics

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Code Style Guidelines
* Follow ESLint configuration
* Use Prettier for code formatting
* Write descriptive commit messages
* Add comments for complex logic

---

## 📝 Environment Variables

Create a `.env.local` file with the following variables:

```
VITE_API_BASE_URL=your_api_url
VITE_MAP_API_KEY=your_map_api_key
VITE_BASE44_SDK_KEY=your_base44_sdk_key
```

---

## 🌍 Live Demo

(Coming soon...)

---

## 🔮 Future Improvements

* 🤖 AI-based safety prediction models
* 👤 User authentication & personalization
* 👥 Real-time crowd data integration
* 📱 Mobile app version (iOS & Android)
* 🔔 Push notifications for safety alerts
* 📊 Safety analytics dashboard
* 🌐 Multi-language support

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤔 Support & Contact

Have questions or suggestions? Feel free to:
* Open an [Issue](https://github.com/payalmawar215-cmd/SafeNav360X/issues)
* Start a [Discussion](https://github.com/payalmawar215-cmd/SafeNav360X/discussions)
* Reach out via GitHub

---

## 🙏 Acknowledgments

* Leaflet team for the excellent mapping library
* Vite for the blazing-fast build tool
* React and Tailwind CSS communities