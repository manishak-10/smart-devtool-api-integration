import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base

class APIAnalysis(Base):
    __tablename__ = "api_analyses"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True, nullable=False)
    api_name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    complexity = Column(String, nullable=True)  # Easy, Medium, Hard
    readiness_score = Column(Integer, nullable=True)  # 0 to 100
    auth_method = Column(String, nullable=True)
    authentication_json = Column(Text, nullable=True)
    integration_recommendation_json = Column(Text, nullable=True)
    sdk_language = Column(String, nullable=True)

    # Store structured lists and complex trees as JSON strings
    endpoints_json = Column(Text, nullable=True)
    roadmap_json = Column(Text, nullable=True)
    best_practices_json = Column(Text, nullable=True)
    security_json = Column(Text, nullable=True)
    pitfalls_json = Column(Text, nullable=True)
    
    # Developer Tooling Outputs
    readme_md = Column(Text, nullable=True)
    sdk_code = Column(Text, nullable=True)
    snippets_json = Column(Text, nullable=True)
    health_summary = Column(Text, nullable=True)
    suggested_steps_json = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
