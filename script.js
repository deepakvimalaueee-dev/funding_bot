const API_URL =
  "https://bluecoast-sk-eqe8f4e7e8gyfyds.eastus2-01.azurewebsites.net/api/iGenticAutonomousAgent/Executor/788ae33e-9bb1-4e89-b88c-7350cbb8966b";

const chatEl = document.getElementById("chat");
const composerEl = document.getElementById("composer");
const inputEl = document.getElementById("messageInput");

let sessionId = "";
let isSending = false;

function addMessage(author, text, isUser = false) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${isUser ? "message--user" : "message--assistant"}`;

  const avatar = document.createElement("div");
  avatar.className = "message__avatar";
  avatar.textContent = isUser ? "You" : "Bot";

  const bubble = document.createElement("div");
  bubble.className = "message__bubble";
  bubble.textContent = text;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatEl.appendChild(wrapper);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function setStatus(text) {
  let statusEl = document.querySelector(".status");
  if (!statusEl) {
    statusEl = document.createElement("div");
    statusEl.className = "status";
    const form = document.getElementById("composer");
    chatEl.parentElement.insertBefore(statusEl, form);
  }
  statusEl.textContent = text;
}

function toggleInput(disabled) {
  inputEl.disabled = disabled;
  composerEl.querySelector("button").disabled = disabled;
}

function extractReply(data) {
  if (data.result) return data.result;

  const agentResponses = data.agentResponses;
  if (typeof agentResponses === "string" && agentResponses.trim()) {
    try {
      const parsed = JSON.parse(agentResponses);
      const welcomeMessage = parsed?.[0]?.Content;
      if (welcomeMessage) return welcomeMessage;
    } catch (error) {
      console.warn("Could not parse agentResponses", error);
    }
  }

  return "No response received.";
}

async function sendToApi(userInput) {
  isSending = true;
  setStatus("Sending to Funding Assistant API...");
  toggleInput(true);

  const payload = {
    userInput,
    sessionId,
    executionId: "",
    connectionID: "",
    isImage: false,
    base64string: "",
    evalId: "",
    userInputType: "",
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    sessionId = data.session_id || sessionId || "";
    const reply = extractReply(data);

    addMessage("Assistant", reply, false);
    setStatus(
      sessionId
        ? `Connected. Session ID: ${sessionId}`
        : "Connected. No session ID returned yet."
    );
  } catch (error) {
    console.error(error);
    addMessage("Assistant", `There was a problem contacting the API: ${error.message}`, false);
    setStatus("Unable to reach the Funding Assistant API. Please try again.");
  } finally {
    isSending = false;
    toggleInput(false);
  }
}

function bootstrap() {
  addMessage("Assistant", "Welcome to the funding assistant", false);
  sendToApi("Hi");
}

composerEl.addEventListener("submit", (event) => {
  event.preventDefault();
  if (isSending) return;

  const message = inputEl.value.trim();
  if (!message) return;

  inputEl.value = "";
  addMessage("You", message, true);
  sendToApi(message);
});

window.addEventListener("DOMContentLoaded", bootstrap);
