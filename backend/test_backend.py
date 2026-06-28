import json
from scraper import scrape_api_docs
from gemini_service import analyze_docs_with_gemini

def run_tests():
    print("=== Testing Documentation Scraper ===")
    res = scrape_api_docs("https://example.com")
    assert res["success"] == True, f"Scraper failed: {res.get('error')}"
    print("Scraper verified successfully! Title:", res["title"])

    print("\n=== Testing Gemini Analyzer fallback ===")
    analysis = analyze_docs_with_gemini("https://stripe.com/docs/api", "Stripe API page context")
    assert analysis["api_name"] == "Stripe API", "Fallback failed"
    print("Gemini analyzer verified successfully! API Name:", analysis["api_name"])
    
    print("\nAll automated integration unit checks completed successfully!")

if __name__ == "__main__":
    run_tests()
