// StudyStride V2.4 Vision Worker
// Bind Workers AI with variable name: AI
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "POST") return Response.json({ error: "POST requests only" }, { status: 405, headers: CORS });

    try {
      const body = await request.json();
      const message = String(body.message || "Help the student.");
      const history = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
      const image = typeof body.image === "string" && body.image.startsWith("data:image/") ? body.image : null;

      const messages = [
        {
          role: "system",
          content: "You are StudyStride AI, a helpful Grade 10 study assistant. Be accurate, explain clearly, and when an image is provided analyze diagrams, graphs, equations, handwriting and visual context instead of only transcribing text."
        },
        ...history.filter(m => m && m.content).map(m => ({
          role: m.role === "bot" ? "assistant" : m.role,
          content: String(m.content)
        })),
        { role: "user", content: message }
      ];

      let response;
      if (image) {
        response = await env.AI.run("@cf/meta/llama-3.2-11b-vision-instruct", { messages, image });
      } else {
        response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", { messages });
      }

      const answer = response?.response || response?.result || response?.answer || String(response);
      return Response.json({ answer }, { headers: { ...CORS, "Content-Type": "application/json" } });
    } catch (error) {
      return Response.json({ error: error?.message || "AI request failed" }, { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
    }
  }
};
