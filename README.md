<div align="center">

# 💬 Chat Dynamics Analyzer

### Turn WhatsApp chats into deep, MBTI-style friendship reports — powered by your own LLM API key

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_4-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**🚀 [Live Demo](https://friendsgpt.space-z.ai/)** · 
**📚 [Documentation](#documentation)** · 
**🐛 [Report Bug](https://github.com/Farhan-ux/chat-dynamics-analyzer/issues)** · 
**✨ [Request Feature](https://github.com/Farhan-ux/chat-dynamics-analyzer/issues)**

---

*Privacy-first · No data stored · Works with Groq, Google AI Studio & OpenAI*

</div>

---

## 🎯 What is this?

Ever wondered what your WhatsApp chat history *really* says about your friendship? **Chat Dynamics Analyzer** takes a plain `.txt` export of any WhatsApp conversation and produces a **13-section comprehensive psychological report** — personality profiles, relationship dynamics, humor analysis, emotional intelligence scores, a Love & Romance section, and more.

It's like having a witty friendship analyst read your entire year of messages and tell you what they found.

> ⚠️ **For entertainment and self-reflection only.** This is not a clinical psychological assessment. Don't use it to make serious decisions about relationships.

---

## ✨ Features

### 🔬 Three-Phase Analysis Pipeline
| Phase | What happens | Why it matters |
|-------|-------------|----------------|
| **1. Chunk Processing** | Chat is split into weekly chunks, batched 5-at-a-time into a fast LLM | Cuts API requests 5× — handles 100k+ message chats within free-tier limits |
| **2. Monthly Aggregation** | Weekly summaries compressed into monthly digests | Keeps final report input compact for any model |
| **3. Report Generation** | Capable model synthesizes everything into a 13-section JSON report | Produces rich, specific, evidence-backed analysis |

### 📊 The 13-Section Report
1. **Executive Summary** — Health score, archetype ratings, strengths, growth areas
2. **Personality Profiles** — Big Five traits, MBTI-informed preferences, attachment styles for both people
3. **Relationship Dynamics** — Power dynamics, interdependence, reciprocity scorecard, "glue" analysis
4. **Communication Patterns** — Flow typology, conflict styles, silence analysis, digital body language
5. **Topic Ecosystem** — Distribution chart, depth spectrum, avoided topics, niche interests
6. **Emotional Landscape** — Valence tracking, contagion patterns, vulnerability matrix, EQ scores
7. **Humor Analysis** — 8 humor style dimensions, dark humor boundaries, inside joke ecosystem
8. **Health Assessment** — Green/yellow/red flags with evidence, overall score
9. **Temporal Patterns** — Daily rhythms, weekly flows, evolution over time
10. **Comparative Analysis** — Similarity %, complementarity, friction points, "puzzle factor"
11. **Predictive Insights** — 6-12 month trajectory, "if X happens" scenarios, long-term viability
12. **Recommendations** — Personalized keep/improve/experiment for each person + together
13. **❤️ Love & Romance** — Relationship type classification, chemistry score, flirtation analysis, couple potential

### 🎨 Beautiful UI
- **Dark mode default** with light mode toggle
- **Sticky sidebar** table of contents (hamburger menu on mobile)
- **Collapsible sections** — read what interests you
- **Interactive charts** — radar (Big Five), bar (topics), comparison (A vs B), score meters
- **Color-coded indicators** — green (positive), yellow (concern), red (flag), purple (brand)
- **PDF export** that preserves the dark theme
- **Fully responsive** — works on phone, tablet, desktop

### 🔒 Privacy-First Architecture
- ✅ API key stays in **browser memory only** (Zustand store, never persisted)
- ✅ Chat data goes **directly from browser → LLM provider** (no server proxy)
- ✅ **Nothing is stored on our servers** — no database, no logs, no analytics
- ✅ Pre-upload **consent checkbox** required
- ✅ Suggested (not required) **anonymization** via find-replace before upload

---

## 🚀 Quick Start

### Option A: Use the Live Demo
1. Visit the **[Live Demo](https://friendsgpt.space-z.ai/)**
2. Get a free API key from one of the providers below
3. Export your WhatsApp chat (Without Media) → `.txt` file
4. Upload, validate, analyze!

### Option B: Run Locally

```bash
# Clone the repo
git clone https://github.com/Farhan-ux/chat-dynamics-analyzer.git
cd chat-dynamics-analyzer

# Install dependencies
bun install  # or npm install

# Start the dev server
bun run dev  # or npm run dev

# Open http://localhost:3000
```

---

## 🔑 Getting an API Key

You need **your own** API key from one of these providers. All have free tiers.

| Provider | Free Tier | Get Key | Recommended For |
|----------|-----------|---------|-----------------|
| **Groq** | 30 RPM, 14,400 RPD (fast model), 1,000 RPD (capable model) | [console.groq.com](https://console.groq.com) | ⚡ Fastest processing |
| **Google AI Studio** | 15 RPM, 250K TPM, 500 RPD (Gemini 3.1 Flash Lite) | [aistudio.google.com](https://aistudio.google.com) | 🆓 Most generous free tier for large chats |
| **OpenAI** | Paid only (~$0.20 for 100k messages) | [platform.openai.com](https://platform.openai.com) | 🧠 Most capable models |

### Which provider should I use?

- **Small chat (< 5k messages):** Groq (fastest)
- **Medium chat (5k–50k messages):** Groq or Google (both work great)
- **Large chat (50k–150k messages):** Google Gemini 3.1 Flash Lite (best free-tier for big volumes)
- **Want the best analysis quality:** OpenAI GPT-4o (costs a few cents)

---

## 📖 How to Export Your WhatsApp Chat

### On iPhone/Android:
1. Open the chat in WhatsApp
2. Tap the contact name → **Export Chat**
3. Choose **"Without Media"** (media files aren't analyzed)
4. Save as `.txt` and upload to the app

### Supported formats
The parser handles:
- ✅ US format: `1/13/24, 10:30 AM - Sender: Message`
- ✅ EU format: `13/1/24, 10:30 - Sender: Message`
- ✅ ISO format: `2024-01-13 10:30 - Sender: Message`
- ✅ iOS exports with Unicode NBSP before AM/PM
- ✅ Multi-line messages
- ✅ System messages (encryption notices, group changes — filtered out automatically)
- ✅ `<Media omitted>` placeholders

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client-Side)                     │
│                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  │ Landing Page │ → │ Progress UI  │ → │ Report View  │    │
│  │ (API key +   │   │ (3-phase     │   │ (13 sections │    │
│  │  file upload)│   │  tracker)    │   │  + charts)   │    │
│  └──────────────┘   └──────────────┘   └──────────────┘    │
│         │                   ↑                   ↑            │
│         ↓                   │                   │            │
│  ┌──────────────────────────────────────────────────┐       │
│  │           Zustand Store (in-memory only)         │       │
│  │  API key · Chat data · Progress · Final report   │       │
│  └──────────────────────────────────────────────────┘       │
│         │                                                   │
└─────────┼───────────────────────────────────────────────────┘
          │ Direct fetch() calls (no server proxy)
          ↓
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │    Groq API  │  │  Google AI   │  │   OpenAI     │
   │              │  │  Studio API  │  │    API       │
   └──────────────┘  └──────────────┘  └──────────────┘
```

### Core Libraries

| File | Purpose |
|------|---------|
| `src/lib/whatsapp-parser.ts` | Robust multi-format WhatsApp export parser |
| `src/lib/chunking.ts` | Weekly chunking + multi-chunk batching (5× request reduction) |
| `src/lib/llm-client.ts` | Provider-agnostic client with rate limiting, auto-fallback, JSON repair |
| `src/lib/rate-limiter.ts` | Per-provider RPM/RPD tracking with cooldown timers |
| `src/lib/prompts.ts` | Three structured prompts (chunk, monthly, final 13-section report) |
| `src/lib/analyzer.ts` | Three-phase orchestrator with continuation support |
| `src/lib/report-types.ts` | Full TypeScript types for the 13-section report |
| `src/lib/store.ts` | Zustand state machine (no persistence) |

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (New York style) + [Radix UI](https://www.radix-ui.com/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **State Management** | [Zustand](https://zustand.docs.pmnd.rs/) |
| **Theming** | [next-themes](https://github.com/pacocoursey/next-themes) |
| **Icons** | [lucide-react](https://lucide.dev/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Package Manager** | [Bun](https://bun.sh/) |

---

## 🧠 How the Analysis Works

### Phase 1: Weekly Chunk Processing
Your chat is split into ~7-day chunks (max 400 messages each). Multiple chunks are **batched into a single API call** (up to 6 chunks or 40K chars per batch), and the model returns a JSON array of weekly summaries covering:

- Dominant topics · Emotional tone · Message counts by person
- Average message length · Initiation ratio · Conflict indicators
- Vulnerability moments · Humor instances · Response time patterns
- Notable quotes · Relationship dynamics observed

### Phase 2: Monthly Aggregation
If you have 6+ weekly chunks, the weekly summaries are compressed into monthly digests — keeping the final report input compact enough for any model's context window.

### Phase 3: Comprehensive Report Generation
The capable model receives all aggregated summaries + a structured prompt requesting strict JSON output matching the 13-section schema. If the response is truncated (token limit hit), the app automatically sends **continuation requests** and concatenates the parts before parsing.

### Robustness Features
- 🔄 **Auto model fallback** — if your account lacks access to a model, it tries alternatives
- 🩹 **JSON repair** — truncated JSON is auto-repaired (closes open brackets, trims incomplete keys)
- 🔁 **Continuation mechanism** — large reports that exceed token limits get multi-part generation
- ⏱️ **Rate limiting** — respects RPM/RPD limits with cooldown timers
- 🚦 **Smart error classification** — distinguishes invalid key / rate limit / context overflow / model unavailable

---

## ⚙️ Configuration

### Default Models per Provider

| Provider | Fast Model (Phase 1) | Capable Model (Phase 3) |
|----------|---------------------|------------------------|
| **Groq** | `llama-3.1-8b-instant` | `llama-3.3-70b-versatile` |
| **Google** | `gemini-3.1-flash-lite` | `gemini-3.1-flash-lite` |
| **OpenAI** | `gpt-4o-mini` | `gpt-4o` |

You can override any model in the **Advanced** section of the landing page — both fields are editable text inputs with autocomplete suggestions.

### Rate Limits (Free Tiers)

| Provider | RPM | TPM | RPD |
|----------|-----|-----|-----|
| Groq (llama-3.1-8b) | 30 | — | 14,400 |
| Groq (llama-3.3-70b) | 30 | — | 1,000 |
| Google (gemini-3.1-flash-lite) | 15 | 250K | 500 |
| OpenAI | 60 | — | 10,000 (paid) |

**No limits are imposed by this app** — all rate limits come directly from your chosen API provider. The app batches requests and respects limits automatically.

---

## 📊 Handling Large Chats

The app is designed to handle chats from 100 messages to 150,000+ messages:

| Chat size | Est. chunks | Est. API calls | Time (Groq) | Time (Google) |
|-----------|-------------|----------------|-------------|---------------|
| 1,400 msgs | 11 | ~6 | ~30 sec | ~30 sec |
| 15,000 msgs | ~80 | ~20 | ~2 min | ~2 min |
| 50,000 msgs | ~250 | ~55 | ~5 min | ~4 min |
| 112,000 msgs | ~870 | ~188 | ~13 min | ~13 min |
| 150,000 msgs | ~1,200 | ~245 | ~17 min | ~17 min |

For 112k messages on Google's free tier (500 RPD), you'd use ~38% of your daily quota — comfortable headroom.

---

## 🔐 Privacy & Ethics

### What we DON'T do
- ❌ Store your API key (it lives in browser memory only, cleared on page close)
- ❌ Store your chat data (processed in real-time, never saved)
- ❌ Use analytics or tracking that could identify you
- ❌ Send your data through our servers (direct browser → provider)

### What we DO
- ✅ Require explicit consent before analysis
- ✅ Suggest (not require) anonymizing names via find-replace before upload
- ✅ Include a clear disclaimer in every report footer
- ✅ Make the entire codebase open-source so you can verify these claims

### Ethical use
- Only analyze chats where you have **permission from all parties** (or it's your own chat)
- Don't use the report to make serious relationship decisions
- Remember: the analysis is generated by an LLM and may contain inaccuracies

---

## 🤝 Contributing

Contributions are welcome! This is a great project for:
- 🌍 Adding support for more LLM providers (Anthropic, Mistral, Cohere, etc.)
- 📊 Adding new chart types or report sections
- 🌍 Internationalization (i18n) for non-English chats
- 📱 Building a mobile-friendly PWA version
- 🔍 Adding search/filter within the report

### Steps to contribute
1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Groq](https://groq.com)** for blazing-fast LLM inference
- **[Google AI Studio](https://aistudio.google.com)** for generous free-tier access to Gemini
- **[OpenAI](https://openai.com)** for the models that started it all
- **[shadcn/ui](https://ui.shadcn.com)** for the beautiful component library
- **[Recharts](https://recharts.org)** for the charting library
- Everyone who trusts us with their chat data 💛

---

## 💬 FAQ

<details>
<summary><strong>Can I use this without an API key?</strong></summary>

No — you need your own API key from Groq, Google AI Studio, or OpenAI. This keeps the app free to run (we don't pay for API calls) and ensures your data goes directly to the provider, not through our servers.
</details>

<details>
<summary><strong>Will my chat data be stored?</strong></summary>

No. Your chat is processed in real-time in your browser and sent directly to the LLM provider. Nothing is saved to any database. When you close the tab or click "Analyze Another Chat", everything is cleared.
</details>

<details>
<summary><strong>Can I analyze a chat in a language other than English?</strong></summary>

Yes! The parser handles any WhatsApp export format. The LLM will analyze in whatever language the chat is in, though the report itself will be in English by default. You can ask the model to write the report in your language by modifying the prompt in `src/lib/prompts.ts`.
</details>

<details>
<summary><strong>How accurate is the analysis?</strong></summary>

The analysis is generated by an LLM based on chat patterns. It's insightful and often surprisingly accurate, but it's not a clinical psychological assessment. Use it for fun and self-reflection, not for making serious decisions about relationships.
</details>

<details>
<summary><strong>My chat is really big (100k+ messages). Will it work?</strong></summary>

Yes! The app is designed for large chats. With multi-chunk batching, a 112k-message chat uses only ~38% of Google's free daily quota. See the [Handling Large Chats](#-handling-large-chats) section for details.
</details>

<details>
<summary><strong>I got a "JSON parse failed" error. What do I do?</strong></summary>

This usually means the model's response was truncated. The app has built-in JSON repair and continuation mechanisms, but if it still fails, try:
1. Switching to a different provider (Groq is most reliable for JSON)
2. Using a smaller chat export
3. Retrying — sometimes models produce malformed output randomly
</details>

---

<div align="center">

**Built with 💜 by [Farhan Ch](https://github.com/Farhan-ux)**

**⭐ Star this repo if it helped you!**

[🚀 Try the Live Demo](https://friendsgpt.space-z.ai/) · 
[📚 Read the Docs](#documentation) · 
[🐛 Report a Bug](https://github.com/Farhan-ux/chat-dynamics-analyzer/issues) · 
[💡 Request a Feature](https://github.com/Farhan-ux/chat-dynamics-analyzer/issues)

</div>
