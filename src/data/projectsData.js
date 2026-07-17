export const projectsData = [
  {
    id: "sms-finance",
    title: "SMS Finance Analyzer",
    description: "Built a privacy-first RAG pipeline using Gemini 2.5 Flash and ChromaDB to analyze financial SMS patterns. Features a 200+ term knowledge base, multi-factor fraud detection with automatic PII masking, and a Streamlit/FastAPI web app processing 600+ requests/hour with sub-2s latency.",
    image: null, 
    tags: ["Python", "ChromaDB", "Gemini API", "Streamlit", "FastAPI", "RAG"],
    githubUrl: "#",
    liveUrl: "#",
    featured: true,
    stats: [
      { label: "Requests/hr", value: 600, suffix: "+" },
      { label: "Latency", value: 2, prefix: "<", suffix: "s" }
    ],
    architecture: ["SMS", "PII mask", "ChromaDB", "Gemini"],
    code: `results = collection.query(\n    query_texts=[sms_text],\n    n_results=5\n)`
  },
  {
    id: "financial-sentiment",
    title: "Financial Sentiment Analysis",
    description: "Fine-tuned a pre-trained FinBERT model on 20,000+ financial news articles to achieve 87% accuracy in sentiment classification. Implemented advanced NLP preprocessing, attention masking, and a comprehensive evaluation framework to identify key financial indicators.",
    image: null,
    tags: ["Python", "TensorFlow", "FinBERT", "NLP", "Machine Learning"],
    githubUrl: "#",
    liveUrl: null,
    featured: true,
    stats: [
      { label: "Accuracy", value: 87, suffix: "%" },
      { label: "Articles", value: 20, suffix: "k+" }
    ],
    architecture: ["News text", "Tokenize", "FinBERT", "Sentiment"],
    code: `inputs = tokenizer(text, return_tensors="pt")\noutputs = model(**inputs)`
  },
  {
    id: "retail-spend-prediction",
    title: "Online Retail Spend Prediction",
    description: "Engineered an end-to-end ML pipeline on a massive UCI dataset (397k+ transactions) to predict 30-day customer spend, achieving an R2 of 0.883. Developed robust RFM-based temporal features and dual prediction pipelines, benchmarked against XGBoost and LightGBM.",
    image: null,
    tags: ["Python", "Scikit-learn", "XGBoost", "LightGBM", "Random Forest"],
    githubUrl: "#",
    liveUrl: "#",
    featured: true,
    stats: [
      { label: "R2 score", value: 0.883, decimals: 3 },
      { label: "Transactions", value: 397, suffix: "k+" }
    ],
    architecture: ["Transactions", "RFM features", "XGBoost/LightGBM", "30-day spend"],
    code: `model = xgb.XGBRegressor()\nmodel.fit(X_train, y_train)`
  }
];
