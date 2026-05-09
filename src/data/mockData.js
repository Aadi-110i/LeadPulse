export const FEATURES = [
  {
    title: "LLM Call Summarization",
    description: "OpenAI-powered transcription and insight extraction from every call.",
    icon: "Brain"
  },
  {
    title: "Auto WhatsApp Follow-up",
    description: "Instant engagement via Twilio/Meta API integration after call ends.",
    icon: "MessageSquare"
  },
  {
    title: "Lead Status Pipeline",
    description: "Visual tracking from new lead to converted customer in real-time.",
    icon: "BarChart3"
  },
  {
    title: "Redis Job Queue",
    description: "Async, reliable delivery architecture for high-volume environments.",
    icon: "Zap"
  },
  {
    title: "Observability Dashboard",
    description: "Track latency, failure rates, and auto-retries with full transparency.",
    icon: "Activity"
  },
  {
    title: "REST API First",
    description: "Clean endpoints and robust JSON responses for developers.",
    icon: "Code2"
  }
];

export const STATS = [
  { label: "Leads Tracked", value: "12,400+" },
  { label: "Delivery Rate", value: "98.2%" },
  { label: "Avg Latency", value: "~340ms" }
];

export const LEADS = [
  { id: 1, name: "Alex Rivera", phone: "+1 555-0102", status: "converted", lastCall: "2m ago", summary: "Interested in premium plan. Needs follow-up on Tuesday." },
  { id: 2, name: "Jordan Smith", phone: "+1 555-0198", status: "contacted", lastCall: "15m ago", summary: "Query about API limits. Re-contact after checking logs." },
  { id: 3, name: "Sarah Chen", phone: "+1 555-0234", status: "new", lastCall: "1h ago", summary: "First-time caller. Inquired about enterprise integrations." },
  { id: 4, name: "Mike Johnson", phone: "+1 555-0456", status: "failed", lastCall: "3h ago", summary: "Call dropped after 5 seconds. Automatic retry queued." }
];

export const ACTIVITY = [
  { id: 1, msg: "Lead #204 follow-up sent", time: "just now" },
  { id: 2, msg: "Call summarized in 1.2s", time: "2m ago" },
  { id: 3, msg: "New lead captured: Alex Rivera", time: "5m ago" },
  { id: 4, msg: "API endpoint /api/calls hit", time: "12m ago" }
];
