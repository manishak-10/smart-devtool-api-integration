import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse
API_DOC_KEYWORDS = [
    "api",
    "endpoint",
    "authentication",
    "authorization",
    "api key",
    "bearer token",
    "oauth",
    "request",
    "response",
    "sdk",
    "rest api",
    "graphql",
    "swagger",
    "openapi",
    "rate limit"
]

def is_api_documentation(text: str) -> bool:
    text = text.lower()

    score = sum(1 for keyword in API_DOC_KEYWORDS if keyword in text)
    api_patterns = ["/api","curl","get ", "post ","put","delete","authorization","bearer","endpoint","openapi","swagger",]
    score += sum(1 for pattern in api_patterns if pattern in text)
    
def scrape_api_docs(url: str) -> dict:
    """
    Scrapes the target URL, extracts text from headlines, paragraphs, lists, and code elements.
    Returns a dictionary with raw extracted content and metadata.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
    }
    
    try:
        # Validate URL structure
        parsed_url = urlparse(url)
        if not parsed_url.scheme or not parsed_url.netloc:
            return {
                "success": False,
                "error": "Invalid URL structure. Ensure it contains http:// or https://",
                "content": "",
                "title": ""
            }
            
        response = requests.get(url, headers=headers, timeout=12)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        url_lower = url.lower()

        api_paths = [
            "/docs",
            "/api",
            "/reference",
            "/developers",
            "/developer",
            "/swagger",
            "/openapi"
        ]

        if not any(path in url_lower for path in api_paths):
            print("Warning: URL does not look like an API documentation path")
        # Remove noisy elements
        for noise in soup(["script", "style", "nav", "footer", "header", "aside", "svg"]):
            noise.decompose()
            
        title = soup.title.string.strip() if soup.title else parsed_url.netloc
        
        # Extract headers, text, and code snippets
        content_parts = []
        
        # Extract headings to maintain structure
        for elem in soup.find_all(["h1", "h2", "h3", "p", "ul", "ol", "pre", "code"]):
            tag = elem.name
            text = elem.get_text(separator=" ", strip=True)
            
            if not text:
                continue
                
            if tag in ["h1", "h2", "h3"]:
                content_parts.append(f"\n--- {tag.upper()}: {text} ---")
            elif tag in ["pre", "code"]:
                # Limit size of long code snippets to avoid flooding prompt
                if len(text) < 1200:
                    content_parts.append(f"[Code Snippet]\n{text}\n[/Code Snippet]")
            else:
                # Standard paragraph or list
                # Clean multiple spaces/newlines
                clean_text = re.sub(r'\s+', ' ', text)
                content_parts.append(clean_text)
                
        # Join content and trim to prevent excessive token count
        raw_text = "\n".join(content_parts)
        trimmed_text = raw_text[:25000] # Limit to 25k chars (~4k-6k tokens)
        trusted_domains = [
            "docs.github.com",
            "fastapi.tiangolo.com",
            "docs.stripe.com",
            "developer.mozilla.org"
        ]
        if parsed_url.netloc not in trusted_domains and not is_api_documentation(trimmed_text):
            return {
                "success": False,
                "error": "This URL does not appear to be API documentation.",
                "content": "",
                "title": title
            }
        return {
            "success": True,
            "title": title,
            "content": trimmed_text,
            "url": url
        }
        
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": f"Failed to connect to page: {str(e)}",
            "content": "",
            "title": ""
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"An unexpected error occurred during scraping: {str(e)}",
            "content": "",
            "title": ""
        }

if __name__ == "__main__":
    # Quick test harness
    test_url = "https://httpbin.org"
    res = scrape_api_docs(test_url)
    print("Scraped Title:", res["title"])
    print("Content preview:\n", res["content"][:300])
