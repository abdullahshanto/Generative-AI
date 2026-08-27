const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const messages = [];

function addMessage(role, content) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.innerHTML = `
    <div class="avatar">${role === "assistant" ? "A" : "U"}</div>
    <div class="bubble">${content}</div>
  `;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function setLoading(loading) {
  sendBtn.disabled = loading;
  userInput.disabled = loading;
  if (loading) {
    userInput.placeholder = "Waiting for response...";
  } else {
    userInput.placeholder = "Type your message...";
    userInput.focus();
  }
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  userInput.value = "";
  addMessage("user", text);
  messages.push({ role: "user", content: text });
  setLoading(true);

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

  