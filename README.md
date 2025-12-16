# Funding Assistant

Simple web chatbot that greets users, calls the Funding Assistant API on load with the provided payload, and reuses the returned session ID for follow-up questions.

The UI greets visitors with **“Welcome to the funding assistant”** and automatically sends a `Hi` payload to the Funding Assistant API. Replies are shown in the chat (parsing either `result` or the first `agentResponses` entry), and the returned `session_id` is reused for follow-up questions. Input controls temporarily disable while requests are in-flight to avoid duplicate sends.

## Running locally
Open `index.html` in a browser, or serve the directory locally:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.
