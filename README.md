# 🤖 WADI - AI Conversational Assistant

<div align="center">

![WADI Logo](https://via.placeholder.com/150x150/09090B/FAFAFA?text=WADI)

**Your intelligent conversational AI assistant**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/status-production--ready-success)](/)

[Features](#-features) •
[Quick Start](#-quick-start) •
[Documentation](#-documentation) •
[Deployment](#-deployment) •
[Contributing](#-contributing)

</div>

---

## 🎯 What is WADI?

WADI is a modern, open-source AI conversational assistant built with a **dual-brain architecture** (Kivo + Wadi) that provides intelligent, context-aware conversations. It features a **guest mode** for immediate use without registration, beautiful dark UI, and seamless local storage persistence.

### Key Highlights:

- 🧠 **Dual-Brain Architecture**: Kivo (reasoning) + Wadi (execution)
- 🎨 **Modern Dark UI**: Beautiful, accessible design
- 🔓 **Guest Mode**: No registration required
- 💾 **Local Persistence**: Chat history saved in browser
- ⚡ **Optimized Performance**: Fast, responsive, scalable
- 🚀 **Production Ready**: Complete deployment guides

---

## ✨ Features

### Core Features:
- ✅ Intelligent conversational AI powered by OpenAI GPT
- ✅ Guest mode with localStorage persistence
- ✅ User authentication with Supabase
- ✅ Real-time WebSocket communication (for authenticated users)
- ✅ Dark theme with accessible colors
- ✅ Mobile-responsi view
- ✅ Health check system
- ✅ Rate limiting and security headers

### Coming Soon:
- 🔄 Streaming responses
- 🎤 Voice interface
- 📸 Image analysis (GPT-4 Vision)
- 🔌 Plugin system
- 📱 Mobile apps (iOS/Android)
- 👥 Team collaboration
- 📊 Analytics dashboard

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm (or npm/yarn)
- OpenAI API Key
- Supabase account (optional for auth users)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/wadi.git
cd wadi

# Install dependencies
pnpm install

# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/frontend/.env.example apps/frontend/.env

# Edit .env files with your keys
# - Add your OPENAI_API_KEY
# - Add your SUPABASE_URL and keys (if using auth)
```

### Development

```bash
# Terminal 1 - Start backend
pnpm dev:api

# Terminal 2 - Start frontend
pnpm dev:front

# Or both at once
pnpm dev:all
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [📖 DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | **Start here** - Complete documentation index |
| [🚀 README_GUEST_MODE.md](README_GUEST_MODE.md) | Quick start for guest mode |
| [🧪 TESTING_GUIDE.md](TESTING_GUIDE.md) | Step-by-step testing guide |
| [🎨 COLOR_GUIDE.md](COLOR_GUIDE.md) | Visual color reference |
| [🧠 ARCHITECTURE_DEEP_DIVE.md](ARCHITECTURE_DEEP_DIVE.md) | Deep architecture explanation |
| [🔧 DEBUGGING_GUIDE.md](DEBUGGING_GUIDE.md) | Debugging & troubleshooting |
| [⚡ PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) | Performance & scalability |
| [🚀 DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Production deployment guide |
| [🗺️ ROADMAP.md](ROADMAP.md) | Future features roadmap |

---

## 🏗️ Project Structure

```
wadi/
├── apps/
│   ├── api/              # Backend (Node.js + Express)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   │   └── brain/  # Kivo + Wadi
│   │   │   ├── middleware/
│   │   │   └── routes/
│   │   └── .env
│   │
│   └── frontend/         # Frontend (React + Vite)
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── store/    # Zustand state
│       │   └── styles/
│       └── .env
│
├── packages/             # Shared packages
│   └── chat-core/
│
└── docs/                 # Documentation (all MD files)
```

---

## 🛠️ Tech Stack

### Backend:
- **Runtime**: Node.js 20+
- **Framework**: Express
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-3.5/4
- **WebSocket**: ws
- **Auth**: Supabase Auth

### Frontend:
- **Framework**: React 18
- **Build Tool**: Vite
- **State**: Zustand
- **Routing**: React Router
- **Animations**: Framer Motion
- **Styling**: Inline styles with theme system

### DevOps:
- **Package Manager**: pnpm
- **Monorepo**: pnpm workspaces
- **Deployment**: Vercel (frontend) + Railway (backend)
- **CI/CD**: GitHub Actions (optional)

---

## 🚀 Deployment

### Quick Deploy (Recommended):

**Backend** → [Railway](https://railway.app)
**Frontend** → [Vercel](https://vercel.com)

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions including:
- Docker deployment
- Custom domains
- Environment variables
- CI/CD setup
- Monitoring

---

## 🧪 Testing

```bash
# Health check
pnpm health

# Run all tests
pnpm test

# Build production
pnpm build

# Preview production build
pnpm preview:frontend
```

Manual testing:
1. Follow [TESTING_GUIDE.md](TESTING_GUIDE.md)
2. Complete Tests 1-9
3. Verify all checkboxes

---

## 🎨 Screenshots

### Guest Mode
![Guest Chat]()
*Clean, modern chat interface*

### Nickname Modal
![Nickname Modal]()
*First-time user experience*

### Message Bubbles
![Messages]()
*User messages in blue, AI responses in dark gray*

---

## 🤝 Contributing

Contributions are welcome! Please check our [Contributing Guide](CONTRIBUTING.md) (coming soon).

### Development Workflow:

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📊 Performance

- **First Contentful Paint**: < 1.0s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: ~95 KB gzipped
- **API Response**: < 3s (including OpenAI)

See [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) for details.

---

## 🔐 Security

- ✅ HTTPS only in production
- ✅ Environment variables for secrets
- ✅ Rate limiting (10 req/min for guests)
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Input sanitization

Report security issues to: security@wadi.ai

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- OpenAI for GPT API
- Supabase for backend infrastructure
- Vercel for hosting
- The React and Node.js communities

---

## 📞 Support

- 📖 [Documentation](DOCUMENTATION_INDEX.md)
- 🐛 [Issue Tracker](https://github.com/yourusername/wadi/issues)
- 💬 [Discussions](https://github.com/yourusername/wadi/discussions)
- 📧 Email: support@wadi.ai

---

## 🗺️ Roadmap

See [ROADMAP.md](ROADMAP.md) for detailed future plans including:
- Streaming responses
- Voice interface
- Multi-modal support
- Plugin system
- Mobile apps
- Enterprise features

---

<div align="center">

**Built with ❤️ by the WADI team**

[Website](https://wadi.ai) • [Documentation](DOCUMENTATION_INDEX.md) • [Twitter](https://twitter.com/wadi_ai)

</div>
