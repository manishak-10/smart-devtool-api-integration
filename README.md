# Smart DevTool with API Integration 🔮

Smart DevTool is an industry-grade, full-stack AI-powered developer platform designed to help engineers understand and integrate third-party APIs in seconds. Simply enter any API documentation URL, and the platform scrapes the page, uses Gemini AI to analyze the content, stores the parsed insights in a SQLite database, and serves a modern, glassmorphic dark-themed developer portal.

## 🚀 Key Features

* **AI-Powered API Analysis**: Detects API Name, description, Authentication details, Complexity ratings (Easy/Medium/Hard), and calculates a custom **Developer Readiness Score**.
* **Automatic Web Scraper**: Built with BeautifulSoup4 and Requests, fetching raw endpoints, headers, and code nodes.
* **Developer SDK skeleton Generator**: Creates clean, object-oriented Python classes to handle HTTP requests against the analyzed documentation structure.
* **Structured Snippets Bank**: Multi-language snippets (Python, JavaScript fetch, and terminal cURL) mapped to discovered endpoints.
* **Interactive README Generator**: Produces complete setup readmes with install directives and quick start code, downloadable in one click.
* **Checklist Roadmap**: Displays vertical interactive integration timelines and developer next steps.
* **Smart History Search & Delete**: Persistence of previous reports in SQLite with instant keyword search and deletions.
* **High-Fidelity Demo Presets**: Ready-to-go selectors for Stripe, GitHub, Twilio, and Slack to demonstrate capabilities without immediate URL inputs or credentials.

---

## 🛠️ Tech Stack & Architecture

```
                       ┌──────────────────────┐
                       │   React + Vite SPA   │ (Vanilla CSS, Glassmorphic UI,
                       │ (localhost:5173/api) │  Neon Shadows, React Router v6)
                       └──────────┬───────────┘
                                  │ (Reverse Proxied via Vite Server)
                                  ▼
                       ┌──────────────────────┐
                       │  FastAPI Web Server  │ (Uvicorn, CORS Middleware)
                       │   (localhost:8000)   │
                       └────┬──────────────┬──┘
                            │              │
                            ▼              ▼
                     ┌────────────┐  ┌───────────┐
                     │ SQLite DB  │  │ BeautifulSoup Scraper
                     │(devtool.db)│  │ & Gemini 1.5 Client
                     └────────────┘  └───────────┘
```

* **Frontend**: React + Vite (Vanilla CSS, custom dark-ambient variables, glassmorphic blur filters, custom SVG indicators).
* **Backend**: FastAPI, Uvicorn, Python.
* **Database**: SQLite with SQLAlchemy ORM.
* **AI Analysis**: Google Gemini 1.5 Flash (via `google-generativeai`).
* **Scraping**: BeautifulSoup4 + Requests.

---

## 📦 Installation & Setup

Follow these steps to configure and run the full-stack application on your system.

### Prerequisites
* **Python 3.10+**
* **Node.js v18+** & **npm**

---

### 1. Backend Setup

1. Navigate to the `/backend` folder.
2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables inside `.env`:
   * Open the `.env` file and set your `GEMINI_API_KEY`:
     ```env
     GEMINI_API_KEY=your_google_gemini_api_key_here
     ```
   * *Note: If `GEMINI_API_KEY` is left blank, the server will automatically activate a high-fidelity local mockup service that generates premium responses for Stripe, Twilio, Slack, GitHub, and generic domains.*

---

### 2. Frontend Setup

1. Navigate to the `/frontend` folder.
2. Install npm dependencies:
   ```bash
   npm install
   ```

---

## 🏃 Running the Application

To run the application, start both the backend and frontend servers in separate terminals.

### Start the FastAPI Server
From the `/backend` folder (ensure virtual environment is active):
```bash
python main.py
# Server starts at http://localhost:8000
```

### Start the React Dev Server
From the `/frontend` folder:
```bash
npm run dev
# App starts at http://localhost:5173
```
Open **`http://localhost:5173`** in your browser to run the platform.

---

## 🧪 Verification & Testing

To run the automated suite verifying the scraping modules and fallback logic:
```bash
cd backend
python test_backend.py
```
This tests example scraping domains and ensures mock analysis objects form correct structures.
