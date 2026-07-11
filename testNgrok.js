async function run() {
  try {
    const response = await fetch("https://thermal-anchovy-commerce.ngrok-free.dev/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify({
        model: "llama3.2:3b",
        prompt: "hi",
        stream: false
      })
    });
    const data = await response.text();
    console.log("Status:", response.status);
    console.log("Data:", data);
  } catch (e) {
    console.log("Error:", e);
  }
}
run();
