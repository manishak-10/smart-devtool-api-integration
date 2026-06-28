import os
import json
import re
from urllib.parse import urlparse
import google.generativeai as genai
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Configure genai if key exists
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Define mock databases for popular endpoints to serve as fallbacks or demo triggers
MOCK_APIS = {
    "stripe": {
        "api_name": "Stripe API",
        "description": "A suite of APIs powering online payment processing and commerce solutions for internet businesses of all sizes.",
        "auth_method": "API Keys (Bearer Token in Authorization header)",
        "authentication": {
            "type": "API Key",
            "required_headers": ["Authorization"],
            "token_location": "Authorization Header (Bearer Token)",
            "example_authorization_header": "Authorization: Bearer sk_test_...",
            "notes": "Stripe uses secret API keys to authenticate requests. Never expose these keys in client-side code."
        },

        "integration_recommendation": {
            "rest_integration_path": "Stripe provides a direct REST API for all endpoints, which is useful for custom HTTP client setups.",
            "sdk_recommendation": "We strongly recommend using Stripe's official SDKs (e.g., Stripe Python, stripe-node) for security, automatic retries, and helper functions."
        },

        "sdk_language": "",
        "complexity": "Medium",
        "readiness_score": 96,
        "endpoints": [
            {"method": "POST", "path": "/v1/payment_intents", "description": "Create a PaymentIntent to track and guide a customer payment flow."},
            {"method": "POST", "path": "/v1/refunds", "description": "Initiate a partial or full refund for a processed charge."},
            {"method": "GET", "path": "/v1/customers", "description": "Retrieve list of customers or specific customer profiles."},
            {"method": "POST", "path": "/v1/subscriptions", "description": "Create a recurring billing subscription for a customer."}
        ],
        "roadmap": [
            "Register for a Stripe Developer Account and retrieve test keys.",
            "Install the Stripe official SDK for your preferred language.",
            "Initialize the client with your secret API Key.",
            "Create a PaymentIntent on the backend and return the client_secret to the frontend.",
            "Use Stripe.js on the client-side to securely capture card details and confirm payment.",
            "Set up Webhooks to handle payment state changes (payment_intent.succeeded)."
        ],
        "best_practices": [
            "Always store secret API keys securely in backend env files. Never expose them on client frontends.",
            "Use Idempotency Keys on POST requests to prevent double-charging users during network retry events.",
            "Track API versions in request headers to prevent service disruptions when Stripe updates its schemas."
        ],
        "security_recommendations": [
            "Configure restricted API keys in the dashboard with minimal scopes required for production.",
            "Enable HTTPS/TLS 1.2+ for all server-to-server and server-to-client transactions.",
            "Verify Webhook signatures using the endpoint secret to prevent spoofing attacks."
        ],
        "common_pitfalls": [
            "Hardcoding API keys in source control.",
            "Assuming payment intents succeed immediately without verifying webhook callbacks.",
            "Failing to handle card authorization errors (e.g. insufficient funds) gracefully in UX."
        ],
        "health_summary": "Highly Stable. 99.99% historical uptime. Comprehensive status page and detailed developer changelogs.",
        "suggested_steps": [
            "Set up a local webhook testing relay using the Stripe CLI.",
            "Create a mock checkout page using React Stripe Elements.",
            "Run test transactions using Stripe's dummy card numbers (4242 4242...)."
        ],
        "readme_md": """# Stripe API Integration Guide

This guide provides setup instructions for integrating payments with Stripe.

## Installation
```bash
pip install stripe
```

## Quick Start
```python
import stripe
stripe.api_key = "sk_test_..."

# Create a PaymentIntent
intent = stripe.PaymentIntent.create(
  amount=2000, # $20.00
  currency="usd",
  automatic_payment_methods={"enabled": True},
)
print(f"Created intent: {intent.id}")
```
""",
        "sdk_code": """# Custom Stripe SDK wrapper skeleton
import requests

class StripeSDK:
    def __init__(self, api_key: str, base_url: str = "https://api.stripe.com/v1"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/x-www-form-urlencoded"
        }

    def create_customer(self, email: str, name: str = None) -> dict:
        data = {"email": email}
        if name:
            data["name"] = name
        response = requests.post(f"{self.base_url}/customers", headers=self.headers, data=data)
        response.raise_for_status()
        return response.json()

    def create_payment_intent(self, amount: int, currency: str = "usd") -> dict:
        data = {"amount": amount, "currency": currency}
        response = requests.post(f"{self.base_url}/payment_intents", headers=self.headers, data=data)
        response.raise_for_status()
        return response.json()
""",
        "snippets": [
            {"language": "Python", "code":  "# Sample Python wrapper code"},
            {"language": "curl", "code": "curl -H \"Authorization: Bearer YOUR_TOKEN\" https://api.example.com/v1/resources"}
        ]
    },
    "github": {
        "api_name": "GitHub REST API",
        "description": "Interact with repositories, user profiles, pull requests, issues, and organizations programmatically.",
        "auth_method": "Personal Access Tokens (PAT) or GitHub Apps (OAuth 2.0 Client credentials)",
        "authentication": {
            "type": "Bearer Token",
            "required_headers": [
                "Authorization",
                "Accept",
                "X-GitHub-Api-Version"
            ],
            "token_location": "Authorization Header",
            "example_authorization_header": "Authorization: Bearer YOUR_GITHUB_PAT",
            "notes": "Requires a Personal Access Token or GitHub App token."
        },

        "integration_recommendation": {
            "rest_integration_path": "REST API is recommended for repository automation.",
            "sdk_recommendation": "Use PyGithub (Python) or Octokit (JavaScript)."
        },

        "sdk_language": "",
        "complexity": "Easy",
        "readiness_score": 94,
        "endpoints": [
            {"method": "GET", "path": "/repos/{owner}/{repo}", "description": "Get detailed statistics and settings of a repository."},
            {"method": "POST", "path": "/repos/{owner}/{repo}/issues", "description": "Create an issue in the designated repository."},
            {"method": "GET", "path": "/users/{username}", "description": "Retrieve profile information for a GitHub user."},
            {"method": "POST", "path": "/repos/{owner}/{repo}/pulls", "description": "Draft a Pull Request to merge branches."}
        ],
        "roadmap": [
            "Generate a GitHub Personal Access Token (PAT) with needed scopes (e.g. repo, user).",
            "Set up request headers including the authorization header and 'Accept: application/vnd.github+json'.",
            "Handle pagination when fetching lists of items (repositories, issues) using the Link response header.",
            "Integrate webhook events if you require real-time updates for pushes or issues."
        ],
        "best_practices": [
            "Include a descriptive User-Agent header in every request. Anonymous requests without a User-Agent are rejected.",
            "Respect rate limits (5,000 requests/hr authenticated, 60/hr unauthenticated) by checking the X-RateLimit headers.",
            "Utilize conditional requests using ETag headers to save API quota."
        ],
        "security_recommendations": [
            "Adopt GitHub Apps instead of fine-grained PATs for organizational deployments to gain security auditing features.",
            "Rotate active access tokens frequently and restrict scopes to only the minimum required."
        ],
        "common_pitfalls": [
            "Forgetting to specify the API version header (X-GitHub-Api-Version: 2022-11-28).",
            "Exceeding rate limits during bulk data scraping.",
            "Improper URL encoding for usernames or repo titles containing special characters."
        ],
        "health_summary": "Highly reliable with occasional delays during massive platform outages. Status details accessible via public endpoints.",
        "suggested_steps": [
            "Test basic repository fetches using simple Curl commands.",
            "Write a script using PyGithub to automate issue tracking.",
            "Configure a local node server to process webhook payload triggers."
        ],
        "readme_md": """# GitHub REST API Integration Guide

This guide helps you connect your app to the GitHub REST API.

## Authenticated Fetch Example
```python
import requests

headers = {
    "Authorization": "Bearer YOUR_GITHUB_PAT",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
}

response = requests.get("https://api.github.com/user", headers=headers)
print(response.json())
```
""",
        "sdk_code": """# Custom GitHub API client skeleton
import requests

class GitHubSDK:
    def __init__(self, token: str = None):
        self.token = token
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
        if token:
            self.headers["Authorization"] = f"Bearer {token}"

    def get_user_profile(self, username: str) -> dict:
        res = requests.get(f"{self.base_url}/users/{username}", headers=self.headers)
        res.raise_for_status()
        return res.json()

    def create_issue(self, owner: str, repo: str, title: str, body: str) -> dict:
        payload = {"title": title, "body": body}
        res = requests.post(f"{self.base_url}/repos/{owner}/{repo}/issues", headers=self.headers, json=payload)
        res.raise_for_status()
        return res.json()
""",
        "snippets": [
            {"language": "python", "code": "import requests\nres = requests.get('https://api.github.com/user', headers={'Authorization': 'Bearer YOUR_PAT'})"},
            {"language": "javascript", "code": "const res = await fetch('https://api.github.com/user', {\n  headers: { Authorization: 'Bearer YOUR_PAT' }\n});"},
            {"language": "curl", "code": "curl -H \"Authorization: Bearer YOUR_PAT\" https://api.github.com/user"}
        ]
    },
    "twilio": {
        "api_name": "Twilio SMS & Voice API",
        "description": "Send and receive SMS messages, initiate phone calls, verify logins, and handle routing.",
        "auth_method": "HTTP Basic Auth (Account SID and Auth Token)",
        "authentication": {
            "type": "HTTP Basic Auth",
            "required_headers": [],
            "token_location": "Username = Account SID, Password = Auth Token",
            "example_authorization_header": "Authorization: Basic QUN4eHg6eXl5",
            "notes": "Uses HTTP Basic Authentication."
        },

        "integration_recommendation": {
            "rest_integration_path": "REST API is recommended.",
            "sdk_recommendation": "Use Twilio official SDK."
        },

        "sdk_language": "",
        "complexity": "Easy",
        "readiness_score": 92,
        "endpoints": [
            {"method": "POST", "path": "/2010-04-01/Accounts/{AccountSid}/Messages.json", "description": "Send an SMS message to a mobile number."},
            {"method": "POST", "path": "/2010-04-01/Accounts/{AccountSid}/Calls.json", "description": "Trigger an outbound phone call with voice instructions."}
        ],
        "roadmap": [
            "Sign up on Twilio and purchase a virtual Twilio Phone Number.",
            "Record your Account SID and Auth Token from the console dashboard.",
            "Install the official Twilio helper library.",
            "Write code to post credentials via basic authorization header to SMS endpoint.",
            "Validate incoming message webhooks using Twilio's XML markup format (TwiML)."
        ],
        "best_practices": [
            "Use Twilio's Messaging Services co-pilot features to automatically select sender IDs.",
            "Queue and batch outgoing message requests to avoid blocking threads on network operations.",
            "Store Twilio auth credentials in secure environment variables, never hardcode."
        ],
        "security_recommendations": [
            "Audit webhook endpoints to verify signatures generated with Twilio secrets.",
            "Limit permitted outbound countries in the console settings to prevent toll fraud."
        ],
        "common_pitfalls": [
            "Sending SMS to unverified numbers in trial mode (will throw error 21608).",
            "Leaking Auth Token in client-side code.",
            "Failing to handle E.164 phone number formatting requirements (e.g. prefixing with +)."
        ],
        "health_summary": "Highly stable, active status dashboards with SMS gateway delivery status channels.",
        "suggested_steps": [
            "Send a test SMS to your own phone number.",
            "Configure a webhook to reply to incoming SMS with TwiML responses.",
            "Set up geo-permissions for Twilio outbound calls."
        ],
        "readme_md": """# Twilio SMS API Integration Guide

This guide describes how to start sending SMS using Twilio.

## Quick Start Example
```python
from twilio.rest import Client

# Find your Account SID and Auth Token at twilio.com/console
account_sid = "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
auth_token = "your_auth_token"
client = Client(account_sid, auth_token)

message = client.messages.create(
  to="+15558675310",
  from_="+15017122661",
  body="Hello from Smart DevTool!"
)

print(message.sid)
```
""",
        "sdk_code": """# Custom Twilio Wrapper SDK skeleton
import requests

class TwilioSMSClient:
    def __init__(self, account_sid: str, auth_token: str):
        self.account_sid = account_sid
        self.auth_token = auth_token
        self.base_url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}"
        self.auth = (self.account_sid, self.auth_token)

    def send_sms(self, to_num: str, from_num: str, body: str) -> dict:
        payload = {
            "To": to_num,
            "From": from_num,
            "Body": body
        }
        res = requests.post(f"{self.base_url}/Messages.json", auth=self.auth, data=payload)
        res.raise_for_status()
        return res.json()
""",
        "snippets": [
            {"language": "python", "code": "import requests\nrequests.post('https://api.twilio.com/2010-04-01/Accounts/AC.../Messages.json', auth=('AC...', 'token'), data={'To': '+1234', 'From': '+5678', 'Body': 'Hello'})"},
            {"language": "javascript", "code": "const auth = btoa('AC...:token');\nawait fetch('https://api.twilio.com/2010-04-01/Accounts/AC.../Messages.json', {\n  method: 'POST',\n  headers: { Authorization: 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded' },\n  body: new URLSearchParams({ To: '+1234', From: '+5678', Body: 'Hello' })\n});"},
            {"language": "curl", "code": "curl -X POST https://api.twilio.com/2010-04-01/Accounts/AC.../Messages.json \\\n  --data-urlencode \"To=+1234\" \\\n  --data-urlencode \"From=+5678\" \\\n  --data-urlencode \"Body=Hello\" \\\n  -u AC...:token"}
        ]
    },
    "slack": {
        "api_name": "Slack Web API",
        "description": "A programmatic layer containing methods to build Slack Apps, send rich messages, query channel histories, and manage workspaces.",
        "auth_method": "OAuth 2.0 (Bearer token prefix `xoxb-` or `xoxp-`)",
        "authentication": {
            "type": "OAuth 2.0",
            "required_headers": [
                "Authorization"
            ],
            "token_location": "Authorization Header",
            "example_authorization_header": "Authorization: Bearer xoxb-xxxxxxxx",
            "notes": "Requires bot or user OAuth token generated from the Slack Developer App console."
        },

        "integration_recommendation": {
            "rest_integration_path": "REST API is recommended.",
            "sdk_recommendation": "Use Slack Bolt SDK if building Slack Apps."
        },

        "sdk_language": "",
        "complexity": "Medium",
        "readiness_score": 90,
        "endpoints": [
            {"method": "POST", "path": "/chat.postMessage", "description": "Post a message or Block Kit interactive card to a Slack channel."},
            {"method": "GET", "path": "/conversations.list", "description": "Fetch a list of public and private channels in the workspace."},
            {"method": "GET", "path": "/users.info", "description": "Retrieve user profile details including display names and emails."}
        ],
        "roadmap": [
            "Create a Slack App at api.slack.com/apps in your developer workspace.",
            "Select requested scopes under OAuth & Permissions (e.g. chat:write, channels:read).",
            "Install the app to your workspace and copy the generated Bot User OAuth Token.",
            "Ensure the Bot is added to target channels before sending messages.",
            "Post messages to the JSON API using rich layout fields (Block Kit)."
        ],
        "best_practices": [
            "Design highly interactive card flows using Slack's Block Kit Builder instead of plain text.",
            "Store user configuration variables securely, adhering to enterprise security baselines.",
            "Prefer standard Web API methods over Webhooks for increased control over message formatting."
        ],
        "security_recommendations": [
            "Validate Slack signature headers (X-Slack-Signature) using the signing secret to verify slash command webhooks.",
            "Enforce token rotations and scope minimization."
        ],
        "common_pitfalls": [
            "Failing to invite the bot user to private/public channels (returns channel_not_found error).",
            "Sending massive block counts exceeding Slack payload size limitations.",
            "Forgetting to parse user inputs, leading to broken message formatting."
        ],
        "health_summary": "Highly reliable. Uptime dashboards and robust changelogs are published at Slack status.",
        "suggested_steps": [
            "Post a basic 'Hello World' message to a channel using Curl.",
            "Build a interactive block card with buttons in the Slack Block Kit Builder.",
            "Configure interactive webhooks to process user actions inside Slack."
        ],
        "readme_md": """# Slack API Integration Guide

This guide details how to post messages to channels using Slack Web API.

## Quick Start Example
```python
import requests

token = "xoxb-your-token"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json; charset=utf-8"
}

payload = {
    "channel": "#general",
    "text": "Hello, Slack! Sent via Smart DevTool."
}

res = requests.post("https://slack.com/api/chat.postMessage", headers=headers, json=payload)
print(res.json())
```
""",
        "sdk_code": """# Custom Slack API Client Wrapper SDK skeleton
import requests

class SlackWebClient:
    def __init__(self, token: str):
        self.token = token
        self.base_url = "https://slack.com/api"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json; charset=utf-8"
        }

    def post_message(self, channel: str, text: str, blocks: list = None) -> dict:
        payload = {"channel": channel, "text": text}
        if blocks:
            payload["blocks"] = blocks
        res = requests.post(f"{self.base_url}/chat.postMessage", headers=self.headers, json=payload)
        res.raise_for_status()
        return res.json()

    def list_channels(self, types: str = "public_channel") -> dict:
        params = {"types": types}
        res = requests.get(f"{self.base_url}/conversations.list", headers=self.headers, params=params)
        res.raise_for_status()
        return res.json()
""",
        "snippets": [
            {"language": "python", "code": "import requests\nrequests.post('https://slack.com/api/chat.postMessage', headers={'Authorization': 'Bearer xoxb-...'}, json={'channel': '#general', 'text': 'Hello'})"},
            {"language": "javascript", "code": "await fetch('https://slack.com/api/chat.postMessage', {\n  method: 'POST',\n  headers: { Authorization: 'Bearer xoxb-...', 'Content-Type': 'application/json' },\n  body: JSON.stringify({ channel: '#general', text: 'Hello' })\n});"},
            {"language": "curl", "code": "curl -X POST -H \"Authorization: Bearer xoxb-...\" \\\n  -H \"Content-type: application/json\" \\\n  --data '{\"channel\":\"#general\",\"text\":\"Hello\"}' \\\n  https://slack.com/api/chat.postMessage"}
        ]
    }
}

def generate_generic_mock(url: str, programming_language: str = "Python") -> dict:
    """Generates realistic structured mock data for any domain."""
    parsed = urlparse(url)
    domain = parsed.netloc.replace("www.", "")
    api_name = domain.split(".")[0].capitalize() + " API"
    
    return {
        "api_name": api_name,
        "description": f"Custom developer API suite provided by {domain} to orchestrate core backend features and access documentation points.",
        "auth_method": "API Keys or Bearer Token Authorization",
        "authentication": {
            "type": "Bearer Token",
            "required_headers": [
                "Authorization"
            ],
            "token_location": "Authorization Header",
            "example_authorization_header": "Authorization: Bearer YOUR_API_KEY",
            "notes": ""
        },

        "integration_recommendation": {
            "rest_integration_path": "REST API is recommended.",
            "sdk_recommendation": "Use official SDK if available."
        },

        "sdk_language": programming_language,
        "complexity": "Medium",
        "readiness_score": 88,
        "endpoints": [
            {"method": "GET", "path": "/api/v1/resources", "description": f"Query list of objects on the {api_name} dashboard."},
            {"method": "POST", "path": "/api/v1/resources", "description": "Create a new resource item."},
            {"method": "GET", "path": "/api/v1/resources/{id}", "description": "Retrieve specific detail summary of a resource."},
            {"method": "DELETE", "path": "/api/v1/resources/{id}", "description": "Remove resources dynamically."}
        ],
        "roadmap": [
            f"Navigate to {domain} and create a developer profile.",
            "Go to settings to generate an API authentication key.",
            "Initialize headers with the secret credentials.",
            "Make outbound test requests to endpoint check routes."
        ],
        "best_practices": [
            "Use secure environments and config models to prevent credential exposures.",
            "Implement exponential backoffs to mitigate rate limitations."
        ],
        "security_recommendations": [
            "Enforce HTTPS across all networks.",
            "Configure API access controls with minimal read/write scopes."
        ],
        "common_pitfalls": [
            "Uploading api key credentials to public source code storage.",
            "Failing to handle 4xx client and 5xx server status codes dynamically."
        ],
        "health_summary": "Stable. Service registers active network responses and responsive documentation endpoints.",
        "suggested_steps": [
            "Run a test GET request inside your code terminal.",
            "Check network payloads mapping responses to models."
        ],
        "readme_md": f"""
        # {api_name} Integration Guide

        Quick Start ({programming_language})

        Generate a {programming_language} integration using the extracted API endpoints.
        """,

        "sdk_code": f"""
        Generate a {programming_language} client wrapper for {api_name}.

        """,
        "snippets": [
            {"language": programming_language, "code": f"Sample {programming_language} request code"},
            {"language": "curl", "code": f'curl -H "Authorization: Bearer KEY" https://{domain}/api/v1/resources'}
        ]
    }

def analyze_docs_with_gemini(
    url: str,
    scraped_text: str,
    intended_use_case: str = "",
    programming_language: str = "Python"
) -> dict:
    """
    Passes scraped documentation text to Gemini API, requesting a structured JSON response.
    Falls back to high-quality mock data if API Key is not set or request fails.
    """
    # 1. Determine mock fallback if API KEY is missing or for demo purposes
    url_lower = url.lower()
    fallback_data = None
    for keyword, mock_obj in MOCK_APIS.items():
        if keyword in url_lower:
            fallback_data = json.loads(json.dumps(mock_obj))
            break
            
    if not fallback_data:
        fallback_data = generate_generic_mock(url, programming_language)
        
    fallback_data["sdk_language"] = programming_language
    
    if not fallback_data.get("authentication"):
        fallback_data["authentication"] = {}
    auth = fallback_data["authentication"]
    auth.setdefault("type", fallback_data.get("auth_method") or "Bearer Token")
    auth.setdefault("required_headers", ["Authorization"])
    auth.setdefault("token_location", "Authorization Header")
    auth.setdefault("example_authorization_header", "Authorization: Bearer YOUR_API_KEY")
    auth.setdefault("notes", "")
    
    for k, v in auth.items():
        if not v:
            if k == "type":
                auth[k] = fallback_data.get("auth_method") or "Bearer Token"
            elif k == "required_headers":
                auth[k] = ["Authorization"]
            elif k == "token_location":
                auth[k] = "Authorization Header"
            elif k == "example_authorization_header":
                auth[k] = "Authorization: Bearer YOUR_API_KEY"
                
    if not fallback_data.get("integration_recommendation"):
        fallback_data["integration_recommendation"] = {}
    rec = fallback_data["integration_recommendation"]
    rec.setdefault("rest_integration_path", "REST API integration is recommended.")
    rec.setdefault("sdk_recommendation", f"Use the official {programming_language} SDK if available.")
    
    if not rec.get("rest_integration_path"):
        rec["rest_integration_path"] = "REST API integration is recommended."
    if not rec.get("sdk_recommendation"):
        rec["sdk_recommendation"] = f"Use the official {programming_language} SDK if available."
        
    # Dynamically adapt mock code to non-Python languages if selected
    if programming_language.lower() != "python":
        api_name = fallback_data.get("api_name", "API")
        fallback_data["sdk_code"] = f"""// Custom {api_name} SDK wrapper client skeleton
// Language: {programming_language}

class {api_name.replace(' ', '')}Client {{
    constructor(config) {{
        this.apiKey = config.apiKey || null;
        this.baseUrl = config.baseUrl || "";
    }}

    async request(endpoint, options = {{}}) {{
        // Basic request handler
        console.log(`Sending request to ${{this.baseUrl}}${{endpoint}} in {programming_language}`);
        return {{ status: "mocked", message: "Success" }};
    }}
}}
"""
        fallback_data["snippets"] = [
            {
                "language": programming_language,
                "code": f"// Quick start snippet in {programming_language}\nconst client = new {api_name.replace(' ', '')}Client({{ apiKey: 'your_token' }});\nawait client.request('/v1/resources');"
            },
            {
                "language": "curl",
                "code": f"curl -H \"Authorization: Bearer YOUR_KEY\" {url}"
            }
        ]
        fallback_data["readme_md"] = f"""# {api_name} Integration Guide ({programming_language})

This generated guide provides configuration templates for integrating {api_name} inside a {programming_language} environment.

## Installation

Install relevant HTTP client libraries for {programming_language}.

## Usage

```javascript
const client = new {api_name.replace(' ', '')}Client({{
  apiKey: "YOUR_API_KEY"
}});
```
"""

    if not GEMINI_API_KEY:
        print("Gemini API key not found. Using local mockup service.")
        return fallback_data

    # 2. If Gemini API Key exists, configure and call the API
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
You are an API Documentation Analyzer.

The developer's intended use case is:
{intended_use_case if intended_use_case else "Not provided"}

The preferred programming language for wrapper generation is:
{programming_language}

Use the intended use case to tailor:
- endpoint recommendations
- wrapper class
- SDK recommendation
- integration advice

If no intended use case is provided, perform a normal API analysis.

Analyze ONLY API documentation.

Your task is to extract:

- API Name
- API Description
- Authentication Method
- API Endpoints
- SDK Information
- Request Examples
- Response Examples
- Security Recommendations
- Integration Best Practices
- Wrapper SDK Code

If the provided content is not API documentation and does not contain API references, endpoints, authentication methods, request/response examples, SDK information, or developer API details, return:

{{
  "api_name": "INVALID_API_DOCUMENTATION"
}}

Documentation:
{scraped_text}
We crawled this URL: {url}
And extracted the following text body:
----------------------------------------
{scraped_text}
----------------------------------------

Analyze this text and output a JSON dictionary following this schema precisely:
{{
  "api_name": "Official API Name",
  "description": "Short summary of the API purpose",
  "auth_method": "Specific auth pattern (e.g. Bearer Token, Client Secret, OAuth 2.0, HTTP Basic, No Auth)",
  "authentication": {{
    "type": "",
    "required_headers": [],
    "token_location": "",
    "example_authorization_header": "",
    "notes": ""
   }},

  "integration_recommendation": {{
    "rest_integration_path": "",
    "sdk_recommendation": ""
   }},

  "sdk_language": "Python",
  "complexity": "Easy" | "Medium" | "Hard",
  "readiness_score": integer (0 to 100 representing how developer-friendly, clear, and easy to integrate it is),
  "endpoints": [
    {{
      "method": "GET" | "POST" | "PUT" | "DELETE",
      "path": "/endpoint/path",
      "description": "Short explanation of endpoint purpose"
    }}
  ],
  "roadmap": [
    "Step 1 text", "Step 2 text", "..."
  ],
  "best_practices": [
    "Best practice 1", "Best practice 2", "..."
  ],
  "security_recommendations": [
    "Security item 1", "Security item 2", "..."
  ],
  "common_pitfalls": [
    "Pitfall 1", "Pitfall 2", "..."
  ],
  "health_summary": "Short 2-3 sentence overview of historical API uptime, support reliability and status channels based on docs.",
  "suggested_steps": [
    "Next actionable developer step 1", "Next step 2", "..."
  ],
  "readme_md": "Markdown guide text for setting up integration, running dependencies, and quick start copy-paste snippet.",
  "sdk_code": "Code block representing an integration client class skeleton wrapper in {programming_language} with helper methods to fetch the endpoints described above.",
  "snippets": [
    {{
      "language": "{programming_language}",
      "code": "Sample request code"
    }},
    
    {{
      "language": "curl",
      "code": "Curl terminal command sample"
    }}
  ]
}}

Guidelines for generation:
1. Ensure the JSON is completely valid, syntactically clean, and contains valid escaped characters.
2. The value of "sdk_code" MUST be generated entirely in the selected programming language: {programming_language}.
Examples:

If Python -> generate Python wrapper.

If JavaScript -> generate JavaScript class.

If TypeScript -> generate TypeScript client.

If Java -> generate Java wrapper.

If C# -> generate C# client.

If Go -> generate Go client.

If PHP -> generate PHP wrapper.

Do NOT always generate Python.
3. Provide realistic code snippets matching the endpoints discovered.
4. If the text does not contain all details, synthesize realistic values based on standard industry practices for {url}.
5. Always return the "authentication" object.

6. Always return the "integration_recommendation" object.

7. Always return "sdk_language" equal to the selected programming language.

8. Generate snippets using the selected programming language whenever possible.

9. Never omit any field from the schema. If information is unavailable, return an empty string, empty array, or reasonable default value.
Respond ONLY with the JSON object. Do not include markdown code block formatting (like ```json). Just return raw JSON.
"""

        # Set up generation configurations for JSON response
        generation_config = {
            "response_mime_type": "application/json",
            "temperature": 0.2
        }

        response = model.generate_content(prompt, generation_config=generation_config)
        
        # Clean text wrap if Gemini wraps in markdown blocks
        raw_output = response.text.strip()
        if raw_output.startswith("```"):
            # strip markdown wraps
            raw_output = re.sub(r"^```(?:json)?\n", "", raw_output)
            raw_output = re.sub(r"\n```$", "", raw_output)
            
        parsed_json = json.loads(raw_output)
        parsed_json["sdk_language"] = programming_language
        # Standard validation of critical keys
        required_keys = ["api_name","description","auth_method","authentication","integration_recommendation","sdk_language","complexity","readiness_score","endpoints","roadmap","best_practices","security_recommendations","common_pitfalls","readme_md","sdk_code","snippets","health_summary","suggested_steps"]
        for key in required_keys:
            if key not in parsed_json:
                # Add default from fallback if missing
                parsed_json[key] = fallback_data.get(key)
                
        return parsed_json

    except Exception as e:
        print(f"Gemini API analysis failed: {str(e)}. Falling back to local mockup service.")
        return fallback_data

if __name__ == "__main__":
    # Test harness
    print("Testing stripe mock:")
    res = analyze_docs_with_gemini("https://stripe.com/docs/api", "Stripe payment API")
    print(res["api_name"])
    print(res["auth_method"])
    print(res["complexity"])