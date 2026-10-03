"""Train from a JSON array of blogs, using blogTag as the target label."""
import argparse
from collections import Counter
import json
from pathlib import Path
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from common import TAGS, blog_text


def train(source, output, demo=False):
    rows = json.loads(Path(source).read_text())
    if not isinstance(rows, list):
        raise ValueError("Expected a JSON array of blogs.")
    unique = {}
    for i, row in enumerate(rows):
        if not isinstance(row, dict) or any(not isinstance(row.get(k), str) for k in ("blogTitle", "blogText", "blogTag")):
            raise ValueError(f"Blog {i}: blogTitle, blogText and blogTag must be strings.")
        text = blog_text(row["blogTitle"], row["blogText"])
        tag = row["blogTag"].strip()
        if not text.strip() or tag not in TAGS:
            raise ValueError(f"Blog {i}: empty content or unsupported blogTag.")
        key = " ".join(text.lower().split())
        if key in unique and unique[key][1] != tag:
            raise ValueError(f"Blog {i}: duplicate content has conflicting tags.")
        unique[key] = (text, tag)
    texts = [r[0] for r in unique.values()]
    labels = [r[1] for r in unique.values()]
    counts = Counter(labels)
    if any(counts[tag] < 2 for tag in TAGS):
        raise ValueError("Supply at least two distinct blogs per tag for all seven tags.")
    model = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=30000, sublinear_tf=True)),
        ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)),
    ])
    report = None
    if not demo and min(counts.values()) >= 5:
        x_train, x_test, y_train, y_test = train_test_split(texts, labels, test_size=max(len(TAGS), round(len(texts)*.2)), stratify=labels, random_state=42)
        model.fit(x_train, y_train)
        report = classification_report(y_test, model.predict(x_test), output_dict=True, zero_division=0)
        print(json.dumps(report, indent=2))
    else:
        print("No holdout evaluation: demo data or fewer than five blogs per tag. Quality is unverified.")
    model.fit(texts, labels)
    output = Path(output)
    output.parent.mkdir(parents=True, exist_ok=True)
    metadata = {"demo": demo, "counts": dict(counts), "evaluation": report}
    joblib.dump({"model": model, "metadata": metadata}, output)
    output.with_suffix(".json").write_text(json.dumps(metadata, indent=2))
    print(f"Saved {output}; demo={demo}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", required=True)
    parser.add_argument("--output", default="model.joblib")
    parser.add_argument("--demo", action="store_true")
    args = parser.parse_args()
    train(args.data, args.output, args.demo)
