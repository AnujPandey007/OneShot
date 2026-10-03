from contextlib import asynccontextmanager
import os
from pathlib import Path
from typing import Optional
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from common import blog_text


@asynccontextmanager
async def lifespan(app):
    # Load only this application's locally trained artifact; never accept model uploads.
    path = Path(os.environ.get("MODEL_PATH", Path(__file__).with_name("model.joblib")))
    app.state.artifact = joblib.load(path)
    yield


app = FastAPI(title="Aatmagyan Blog Tag API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware,
    allow_origins=[x.strip() for x in os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",") if x.strip()],
    allow_methods=["GET", "POST"], allow_headers=["Content-Type"], allow_credentials=False)


class BlogInput(BaseModel):
    blogTitle: str = Field(default="", max_length=500)
    blogText: str = Field(min_length=20, max_length=30000)


class Candidate(BaseModel):
    blogTag: str
    score: float


class Prediction(BaseModel):
    blogTag: Optional[str]
    confidence: float
    needsReview: bool
    demo: bool
    suggestions: list[Candidate]


@app.get("/health")
def health():
    return {"status": "ok", "demo": app.state.artifact["metadata"]["demo"]}


@app.post("/predict", response_model=Prediction)
def predict(blog: BlogInput):
    if len(blog.blogText.strip()) < 20:
        raise HTTPException(422, "Write at least 20 non-padding characters of blog text.")
    artifact = app.state.artifact
    model = artifact["model"]
    text = blog_text(blog.blogTitle, blog.blogText)
    features = model.named_steps["tfidf"].transform([text])
    demo = artifact["metadata"]["demo"]
    if features.nnz == 0:
        return dict(blogTag=None, confidence=0, needsReview=True, demo=demo, suggestions=[])
    classifier = model.named_steps["classifier"]
    scores = classifier.predict_proba(features)[0]
    ranked = sorted(zip(classifier.classes_, scores), key=lambda item: item[1], reverse=True)
    best, score = ranked[0]
    return dict(blogTag=best, confidence=float(score),
        needsReview=demo or float(score) < .55 or float(score-ranked[1][1]) < .15,
        demo=demo, suggestions=[dict(blogTag=tag, score=float(s)) for tag, s in ranked[:3]])
