import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, ArrowRight, ChevronLeft, ChevronRight, CheckCircle2, Cpu, Database, ShieldCheck, Sparkles, Terminal } from 'lucide-react';

export const PIPELINE_PROJECTS = [
  {
    id: 'sms-rag',
    short: 'Financial RAG Engine',
    tag: 'LIVE ARCHITECTURE SIMULATOR',
    title: 'Financial RAG & Fraud Detection Engine',
    subtitle: 'Privacy-first SMS transaction analyzer with sub-2s Gemini 2.5 & ChromaDB RAG verification',
    totalLatency: '502ms',
    accentColor: '#16a34a',
    stages: [
      {
        id: 1,
        title: 'Input Ingestion',
        tag: 'SMS / Transaction stream',
        time: '0.8ms',
        color: '#16a34a',
        code: `def ingest_event(payload: dict) -> dict:
    raw_text = payload.get("body", "")
    metadata = extract_timestamps(payload)
    normalized = sanitize_and_normalize(raw_text)
    return {"text": normalized, "meta": metadata}`,
        summary: 'Stream ingestion with timestamp validation and unicode character normalization.'
      },
      {
        id: 2,
        title: 'PII Masking',
        tag: 'Privacy-First Anonymizer',
        time: '1.4ms',
        color: '#2563eb',
        code: `def mask_pii_entities(text: str) -> str:
    # Redact credit card numbers & PAN identifiers
    text = re.sub(r'\\b\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b', '[CARD_REDACTED]', text)
    # Mask monetary balances and account suffixes
    text = re.sub(r'Rs\\.?\\s*(\\d+)', '[AMT_DETECTED]', text)
    return text`,
        summary: 'Regex entity redaction removing PAN, account numbers, and transaction values before embedding.'
      },
      {
        id: 3,
        title: 'ChromaDB Retrieval',
        tag: '200+ Term Knowledge Base',
        time: '18ms',
        color: '#7c3aed',
        code: `results = collection.query(
    query_texts=[masked_sms],
    n_results=5,
    where={"category": "financial_fraud"},
    include=["documents", "distances"]
)
context_docs = [doc for doc in results["documents"][0]]`,
        summary: 'Cosine vector search querying top-5 domain guidelines and fraud taxonomy vectors.'
      },
      {
        id: 4,
        title: 'Gemini 2.5 Inference',
        tag: 'RAG Prompt Synthesis',
        time: '480ms',
        color: '#0284c7',
        code: `response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[context_prompt, masked_sms],
    config=GenerateContentConfig(
        temperature=0.2, max_output_tokens=512
    )
)`,
        summary: 'Low-temperature generation analyzing semantic discrepancy against verified fraud patterns.'
      },
      {
        id: 5,
        title: 'Fraud Output',
        tag: 'Sub-2s Total Latency',
        time: '< 2.0s',
        color: '#d97706',
        code: `return {
    "fraud_probability": 0.02,
    "classification": "Legitimate Bank Alert",
    "latency_ms": 502,
    "status": "APPROVED",
    "tokens_used": 1248
}`,
        summary: 'Structured JSON response dispatched with sub-second verified telemetry.'
      }
    ]
  },
  {
    id: 'finbert-nlp',
    short: 'FinBERT Market NLP',
    tag: 'TRANSFORMER NLP PIPELINE',
    title: 'FinBERT Financial Sentiment Classifier',
    subtitle: 'Fine-tuned Hugging Face transformer pipeline analyzing 20,000+ financial market news articles at 87% accuracy',
    totalLatency: '142ms',
    accentColor: '#7c3aed',
    stages: [
      {
        id: 1,
        title: 'News Feed Stream',
        tag: 'Bloomberg / Reuters RSS',
        time: '2.1ms',
        color: '#7c3aed',
        code: `async def stream_earnings_feed(source_url: str):
    async with aiohttp.ClientSession() as session:
        async with session.get(source_url) as resp:
            raw_html = await resp.text()
            articles = parse_rss_items(raw_html)
            return [clean_article_text(a) for a in articles]`,
        summary: 'Async ingestion of real-time earnings call transcripts and financial wire feeds.'
      },
      {
        id: 2,
        title: 'FinBERT Tokenizer',
        tag: 'WordPiece Vocab · 512 Max',
        time: '4.8ms',
        color: '#2563eb',
        code: `inputs = tokenizer(
    article_text,
    padding="max_length",
    truncation=True,
    max_length=512,
    return_tensors="pt"
).to(device)`,
        summary: 'Financial-domain vocabulary tokenization with attention masking for variable sentence lengths.'
      },
      {
        id: 3,
        title: 'Self-Attention Layers',
        tag: '12-Head Multi-Head Attention',
        time: '95ms',
        color: '#0284c7',
        code: `with torch.no_grad():
    outputs = model(
        input_ids=inputs["input_ids"],
        attention_mask=inputs["attention_mask"]
    )
    logits = outputs.logits
    probs = F.softmax(logits, dim=-1)`,
        summary: 'Bidirectional multi-head attention computing context embeddings across market terms.'
      },
      {
        id: 4,
        title: 'Sentiment Classifier',
        tag: 'Positive / Neutral / Negative',
        time: '18ms',
        color: '#16a34a',
        code: `pred_class = torch.argmax(probs, dim=1).item()
confidence = probs[0][pred_class].item()
labels = {0: "BEARISH", 1: "NEUTRAL", 2: "BULLISH"}
sentiment_label = labels[pred_class]`,
        summary: 'Softmax probability classification mapping fine-tuned weights to institutional sentiment tags.'
      },
      {
        id: 5,
        title: 'Market Signal Output',
        tag: 'Confidence: 87.4%',
        time: '22ms',
        color: '#d97706',
        code: `return {
    "sentiment": "BULLISH",
    "confidence_score": 0.874,
    "market_impact_vector": [0.12, 0.88, 0.00],
    "inference_latency_ms": 142
}`,
        summary: 'Aggregated trading desk signal packet ready for algorithmic execution engines.'
      }
    ]
  },
  {
    id: 'resnet-mri',
    short: 'ResNet-50 MRI Vision',
    tag: 'COMPUTER VISION CNN',
    title: 'Brain Tumor MRI Vision Classification',
    subtitle: 'Deep Convolutional Neural Network with ResNet-50 transfer learning & Grad-CAM visual interpretability at 98.2% accuracy',
    totalLatency: '86ms',
    accentColor: '#059669',
    stages: [
      {
        id: 1,
        title: 'DICOM Ingestion',
        tag: 'Medical Imaging Preload',
        time: '3.2ms',
        color: '#059669',
        code: `def load_dicom_scan(path: str) -> np.ndarray:
    ds = pydicom.dcmread(path)
    pixel_array = ds.pixel_array.astype(np.float32)
    # Standardize Hounsfield Units
    return normalize_hu_units(pixel_array)`,
        summary: 'High-precision medical scan ingestion with radiometric Hounsfield unit calibration.'
      },
      {
        id: 2,
        title: 'Preprocessing & Augment',
        tag: '224x224 RGB Normalization',
        time: '6.5ms',
        color: '#2563eb',
        code: `transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])
tensor = transform(pixel_array).unsqueeze(0).to(device)`,
        summary: 'CLAHE contrast equalization and ImageNet standard tensor normalization.'
      },
      {
        id: 3,
        title: 'ResNet Feature Map',
        tag: 'Residual Bottleneck Blocks',
        time: '52ms',
        color: '#7c3aed',
        code: `features = resnet50_backbone.conv1(tensor)
features = resnet50_backbone.layer1(features)
features = resnet50_backbone.layer2(features)
features = resnet50_backbone.layer3(features)
feature_maps = resnet50_backbone.layer4(features)`,
        summary: 'Deep 50-layer convolutional residual extraction capturing micro-calcifications and edges.'
      },
      {
        id: 4,
        title: 'Grad-CAM Heatmap',
        tag: 'Explainable AI Attention',
        time: '14ms',
        color: '#0284c7',
        code: `cam_generator = GradCAM(model=model, target_layer=model.layer4[-1])
grayscale_cam = cam_generator(input_tensor=tensor)
heatmap = cv2.applyColorMap(np.uint8(255 * grayscale_cam[0, :]), cv2.COLORMAP_JET)`,
        summary: 'Gradient-weighted class activation mapping highlighting focal lesion areas for clinicians.'
      },
      {
        id: 5,
        title: 'Diagnostic Class',
        tag: '98.2% Accuracy',
        time: '10ms',
        code: `return {
    "diagnosis": "Meningioma Detected",
    "confidence": 0.982,
    "focal_region": {"x": 112, "y": 88, "radius": 24},
    "model": "ResNet-50 Transfer Learning"
}`,
        summary: 'Final classification output with bounding coordinates and multi-class confidence metrics.'
      }
    ]
  }
];

export default function ProjectPipelineSimulator({ sound, onInspect }) {
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const currentProject = PIPELINE_PROJECTS[activeProjectIdx];

  const [activeStep, setActiveStep] = useState(currentProject.stages[2]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStageIdx, setActiveStageIdx] = useState(-1);

  // Tab indicator position ref
  const tabsContainerRef = useRef(null);
  const [tabIndicatorStyle, setTabIndicatorStyle] = useState({ left: 0, width: 0 });

  // When project changes, reset state
  useEffect(() => {
    setActiveStep(currentProject.stages[2]);
    setIsRunning(false);
    setProgress(0);
    setActiveStageIdx(-1);
  }, [activeProjectIdx, currentProject]);

  // Update sliding pill position
  useEffect(() => {
    if (!tabsContainerRef.current) return;
    const tabElements = tabsContainerRef.current.querySelectorAll('.ls-project-tab-btn');
    const activeEl = tabElements[activeProjectIdx];
    if (activeEl) {
      setTabIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeProjectIdx]);

  const selectProject = (idx) => {
    if (isRunning) return;
    sound?.click?.();
    setActiveProjectIdx(idx);
  };

  const handlePrev = () => {
    if (isRunning) return;
    sound?.hover?.();
    setActiveProjectIdx((prev) => (prev > 0 ? prev - 1 : PIPELINE_PROJECTS.length - 1));
  };

  const handleNext = () => {
    if (isRunning) return;
    sound?.hover?.();
    setActiveProjectIdx((prev) => (prev < PIPELINE_PROJECTS.length - 1 ? prev + 1 : 0));
  };

  const runSimulation = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setProgress(0);
    sound?.click?.();

    for (let i = 0; i < currentProject.stages.length; i++) {
      setActiveStageIdx(i);
      setActiveStep(currentProject.stages[i]);
      await new Promise((r) => setTimeout(r, i < 2 ? 300 : i < 3 ? 650 : i < 4 ? 900 : 500));
      setProgress(((i + 1) / currentProject.stages.length) * 100);
    }

    await new Promise((r) => setTimeout(r, 300));
    sound?.success?.();
    setIsRunning(false);
    setActiveStageIdx(-1);
  }, [isRunning, currentProject, sound]);

  return (
    <section className="ls-section" id="pipeline">
      <div className="ls-sec-head">
        <div className="ls-eyebrow">{currentProject.tag}</div>
        <h2>{currentProject.title}</h2>
        <p>{currentProject.subtitle}</p>
      </div>

      {/* ─── Project Slider / Capsule Tab Switcher ─── */}
      <div className="ls-slider-controls-wrap">
        <button
          className="ls-slider-arrow"
          onClick={handlePrev}
          disabled={isRunning}
          title="Previous Project Architecture"
          aria-label="Previous Project"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="ls-project-tabs-capsule" ref={tabsContainerRef}>
          <div
            className="ls-project-tab-indicator"
            style={{
              transform: `translateX(${tabIndicatorStyle.left}px)`,
              width: `${tabIndicatorStyle.width}px`,
            }}
          />
          {PIPELINE_PROJECTS.map((proj, idx) => (
            <button
              key={proj.id}
              className={`ls-project-tab-btn ${activeProjectIdx === idx ? 'active' : ''}`}
              onClick={() => selectProject(idx)}
              disabled={isRunning}
            >
              <span className="ls-tab-dot" style={{ background: proj.accentColor }} />
              {proj.short}
            </button>
          ))}
        </div>

        <button
          className="ls-slider-arrow"
          onClick={handleNext}
          disabled={isRunning}
          title="Next Project Architecture"
          aria-label="Next Project"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ─── Pipeline Card Simulator ─── */}
      <div className="ls-pipeline-card">
        {/* Stage Nodes Row */}
        <div className="ls-pipeline-nodes">
          {currentProject.stages.map((step, idx) => {
            const isCurrentActive = activeStep.id === step.id;
            const isSimulatingActive = isRunning && activeStageIdx === idx;
            return (
              <React.Fragment key={step.id}>
                <div
                  className={`ls-pnode ${isCurrentActive ? 'active' : ''} ${isSimulatingActive ? 'active' : ''}`}
                  onClick={() => !isRunning && setActiveStep(step)}
                  style={{
                    cursor: isRunning ? 'default' : 'pointer',
                    borderColor: isSimulatingActive ? step.color : undefined,
                  }}
                >
                  <div
                    className="ls-pnode-num"
                    style={{ color: isSimulatingActive ? step.color : undefined }}
                  >
                    STAGE 0{step.id}
                  </div>
                  <div className="ls-pnode-title">{step.title}</div>
                  <div className="ls-pnode-tag">{step.tag}</div>
                </div>
                {idx < currentProject.stages.length - 1 && <div className="ls-pnode-arrow">→</div>}
              </React.Fragment>
            );
          })}
        </div>

        {/* Live Simulation Controls & Progress */}
        <div className="ls-pipeline-run">
          <button
            className="ls-pipeline-run-btn"
            onClick={runSimulation}
            disabled={isRunning}
            onMouseEnter={sound?.hover}
            style={{ background: currentProject.accentColor }}
          >
            <Play size={12} fill="currentColor" /> {isRunning ? 'Running Simulation...' : 'Simulate Live Pipeline'}
          </button>
          <div className="ls-pipeline-progress">
            <div
              className="ls-pipeline-progress-fill"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${currentProject.accentColor}, #2563eb)`,
              }}
            />
          </div>
          <div className={`ls-pipeline-status ${isRunning ? 'running' : progress === 100 ? 'done' : ''}`}>
            {isRunning
              ? `Stage ${activeStageIdx + 1}/${currentProject.stages.length}…`
              : progress === 100
              ? `✓ Done · ${currentProject.totalLatency}`
              : 'Ready'}
          </div>
        </div>

        {/* Execution Logic & Telemetry Detail */}
        <div className="ls-pnode-detail">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ls-text)', letterSpacing: '-0.01em' }}>
                Execution Logic · {activeStep.title}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--ls-mono-font)',
                  color: activeStep.color,
                  fontWeight: 700,
                  padding: '2px 8px',
                  background: `${activeStep.color}18`,
                  borderRadius: '6px',
                  border: `1px solid ${activeStep.color}30`,
                }}
              >
                {activeStep.time}
              </span>
            </div>
            <pre className="ls-pcode">{activeStep.code}</pre>
            <p style={{ fontSize: '11.5px', color: 'var(--ls-text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
              {activeStep.summary}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--ls-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '10px',
                }}
              >
                Pipeline Telemetry · Total: {currentProject.totalLatency}
              </div>
              {currentProject.stages.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    marginBottom: '8px',
                    padding: '4px 6px',
                    borderRadius: '6px',
                    background: activeStep.id === s.id ? 'var(--ls-card-hover)' : 'transparent',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: activeStep.id >= s.id ? s.color : 'var(--ls-border)',
                      transition: 'background 0.3s',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: activeStep.id >= s.id ? 'var(--ls-text)' : 'var(--ls-text-muted)',
                      fontWeight: activeStep.id === s.id ? 700 : 400,
                    }}
                  >
                    {s.title}
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontFamily: 'var(--ls-mono-font)',
                      fontSize: '10px',
                      color: 'var(--ls-text-muted)',
                    }}
                  >
                    {s.time}
                  </span>
                </div>
              ))}
            </div>

            <button
              className="ls-btn-primary"
              style={{
                padding: '10px 18px',
                fontSize: '12px',
                marginTop: '20px',
                width: 'max-content',
              }}
              onClick={onInspect}
              onMouseEnter={sound?.hover}
            >
              Inspect in Portfolio <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
