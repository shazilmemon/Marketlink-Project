# MarketLink AI Marketplace Intelligence (Phase 6)

## AI Architecture
We introduced an AI abstraction layer containing:
- `IAIProvider` interface defining `generateResponse`, `generateEmbedding`, etc.
- `GeminiProvider` implementing `IAIProvider` using Google Generative AI (Gemini).
- `AIRequestService` acting as the main interface between the backend logic and the AI provider.

## AI Tools & Capabilities
### AI Shopping Assistant
- Provides an interactive customer-facing assistant.
- Accessible via `/api/v1/ai/chat` POST endpoint.

### Semantic / Natural Language Product Search
- Embeddings are planned to be handled via vector similarity.

### Personalized Product Recommendations
- Handled through user profiling algorithms powered by the AI.

### AI Review Summarization
- Generates product review summaries using `ReviewSummary` model.

### AI Farmer Assistant
- Provides farmers with tailored insights about their produce and sales.

## Security & Privacy
- Ensures that PII and sensitive market data are handled securely without exposing them arbitrarily to models.
- Uses strict prompt formulation to defend against injection attacks.

## Fallback Behavior
- If AI or Semantic Search is offline, standard keyword/text-based queries process the request seamlessly.
