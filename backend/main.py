import json
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
import models
from database import engine, Base, get_db
from scraper import scrape_api_docs
from gemini_service import analyze_docs_with_gemini

# Initialize SQLite database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart DevTool with API Integration - Backend")

# Setup CORS to allow Vite frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify front-end domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic schemas
class LoginRequest(BaseModel):
    username: str
from typing import Optional
class AnalyzeRequest(BaseModel):
    url: str
    intended_use_case: Optional[str] = ""
    programming_language: Optional[str] = "Python"
# Helper to transform database model to structured API response
def transform_analysis_model(analysis: models.APIAnalysis) -> dict:
    try:
        endpoints = json.loads(analysis.endpoints_json) if analysis.endpoints_json else []
    except Exception:
        endpoints = []
        
    try:
        roadmap = json.loads(analysis.roadmap_json) if analysis.roadmap_json else []
    except Exception:
        roadmap = []
        
    try:
        best_practices = json.loads(analysis.best_practices_json) if analysis.best_practices_json else []
    except Exception:
        best_practices = []
        
    try:
        security = json.loads(analysis.security_json) if analysis.security_json else []
    except Exception:
        security = []
        
    try:
        pitfalls = json.loads(analysis.pitfalls_json) if analysis.pitfalls_json else []
    except Exception:
        pitfalls = []
        
    try:
        snippets = json.loads(analysis.snippets_json) if analysis.snippets_json else []
    except Exception:
        snippets = []
    try:
        authentication = json.loads(
            analysis.authentication_json
        ) if analysis.authentication_json else {}
    except Exception:
        authentication = {}
    try:
        integration_recommendation = json.loads(
            analysis.integration_recommendation_json
        ) if analysis.integration_recommendation_json else {}
    except Exception:
        integration_recommendation = {}   
    try:
        suggested_steps = json.loads(analysis.suggested_steps_json) if analysis.suggested_steps_json else []
    except Exception:
        suggested_steps = []

    return {
        "id": analysis.id,
        "url": analysis.url,
        "api_name": analysis.api_name,
        "description": analysis.description,
        "complexity": analysis.complexity,
        "readiness_score": analysis.readiness_score,
        "auth_method": analysis.auth_method,
        "authentication": authentication,
        "integration_recommendation": integration_recommendation,
        "sdk_language": analysis.sdk_language,
        "endpoints": endpoints,
        "roadmap": roadmap,
        "best_practices": best_practices,
        "security_recommendations": security,
        "common_pitfalls": pitfalls,
        "readme_md": analysis.readme_md,
        "sdk_code": analysis.sdk_code,
        "snippets": snippets,
        "health_summary": analysis.health_summary,
        "suggested_steps": suggested_steps,
        "created_at": analysis.created_at
    }

# FastAPI endpoints

@app.post("/api/auth/login")
def login(request: LoginRequest):
    """Simple mock login endpoint for developers and guests."""
    username = request.username.strip()
    if not username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Username cannot be blank"
        )
    return {"status": "success", "username": username}

@app.post("/api/analyze")
def analyze_endpoint(request: AnalyzeRequest, db: Session = Depends(get_db)):
    """Scrapes, analyzes and stores API documentation insights from a URL."""
    url = str(request.url).strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")
        
    # Step 1: Scrape
    scrape_res = scrape_api_docs(url)
    if not scrape_res["success"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=scrape_res.get("error", "Failed to scrape the specified URL.")
        )
        
    
    # Step 2: Analyze with Gemini (or Mock)
    analysis = analyze_docs_with_gemini(
        url=url,
        scraped_text=scrape_res["content"],
        intended_use_case=request.intended_use_case,
        programming_language=request.programming_language
    )

    if analysis.get("api_name") == "INVALID_API_DOCUMENTATION":
        raise HTTPException(
            status_code=400,
            detail="Provided URL is not API documentation."
        )
    # Step 3: Write to SQLite database
    db_analysis = models.APIAnalysis(
        url=url,
        api_name=analysis.get("api_name", "Unknown API"),
        description=analysis.get("description", ""),
        complexity=analysis.get("complexity", "Medium"),
        readiness_score=analysis.get("readiness_score", 70),
        auth_method=analysis.get("auth_method", "None"),
        authentication_json=json.dumps(analysis.get("authentication", {})),
        integration_recommendation_json=json.dumps(analysis.get("integration_recommendation", {})),
        sdk_language=analysis.get("sdk_language", request.programming_language),
        endpoints_json=json.dumps(analysis.get("endpoints", [])),
        roadmap_json=json.dumps(analysis.get("roadmap", [])),
        best_practices_json=json.dumps(analysis.get("best_practices", [])),
        security_json=json.dumps(analysis.get("security_recommendations", [])),
        pitfalls_json=json.dumps(analysis.get("common_pitfalls", [])),
        readme_md=analysis.get("readme_md", ""),
        sdk_code=analysis.get("sdk_code", ""),
        snippets_json=json.dumps(analysis.get("snippets", [])),
        health_summary=analysis.get("health_summary", ""),
        suggested_steps_json=json.dumps(analysis.get("suggested_steps", [])),
        
    )
    
    try:
        db.add(db_analysis)
        db.commit()
        db.refresh(db_analysis)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database save operation failed: {str(e)}")
        
    return transform_analysis_model(db_analysis)

@app.get("/api/history")
def get_history(
    search: Optional[str] = Query(None, description="Search by API name or URL"),
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Retrieve all analysis history, with optional search filtering."""
    query = db.query(models.APIAnalysis)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            models.APIAnalysis.api_name.like(search_filter) | 
            models.APIAnalysis.url.like(search_filter)
        )
        
    analyses = query.order_by(models.APIAnalysis.created_at.desc()).limit(limit).all()
    return [transform_analysis_model(a) for a in analyses]

@app.get("/api/history/{analysis_id}")
def get_analysis_by_id(analysis_id: int, db: Session = Depends(get_db)):
    """Retrieve a single API analysis by its primary database ID."""
    analysis = db.query(models.APIAnalysis).filter(models.APIAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis record not found")
    return transform_analysis_model(analysis)

@app.delete("/api/history/{analysis_id}")
def delete_analysis(analysis_id: int, db: Session = Depends(get_db)):
    """Delete an API analysis from history."""
    analysis = db.query(models.APIAnalysis).filter(models.APIAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis record not found")
        
    try:
        db.delete(analysis)
        db.commit()
        return {"status": "success", "message": f"Successfully deleted analysis {analysis_id}"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database delete operation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
