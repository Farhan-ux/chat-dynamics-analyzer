// Test connectivity to multiple providers
async function main() {
  // 1. Google AI (no key needed for connectivity check, will get 400)
  console.log("--- Google AI Studio connectivity ---");
  const r1 = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
    method: "GET",
  });
  console.log("Status:", r1.status);
  console.log("Body (first 200 chars):", (await r1.text()).slice(0, 200));

  // 2. OpenAI (no key, should get 401)
  console.log("\n--- OpenAI connectivity ---");
  const r2 = await fetch("https://api.openai.com/v1/models", {
    method: "GET",
  });
  console.log("Status:", r2.status);
  console.log("Body (first 200 chars):", (await r2.text()).slice(0, 200));

  // 3. Groq (no auth, should get 401 from Groq specifically)
  console.log("\n--- Groq connectivity (no auth) ---");
  const r3 = await fetch("https://api.groq.com/openai/v1/models", {
    method: "GET",
  });
  console.log("Status:", r3.status);
  console.log("Headers server:", r3.headers.get("server"));
  console.log("Body (first 300 chars):", (await r3.text()).slice(0, 300));
}
main().catch(e => { console.error(e); process.exit(1); });
