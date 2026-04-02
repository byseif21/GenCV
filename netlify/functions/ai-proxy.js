
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { userMsg, currentCV } = JSON.parse(event.body);
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'AI_API_KEY is not configured on the server.' })
      };
    }

    const sysPrompt = `You are a specialized CV/Resume Optimization Assistant. Your goal is to extract, unify, and enhance CV data for maximum ATS (Applicant Tracking System) compatibility.

CURRENT CV DATABASE:
${JSON.stringify(currentCV, null, 2)}

STRICT OPERATING RULES:
1. DATA INTEGRITY: Do NOT invent, hallucinate, or add any new education, experience, or projects that are not clearly present in the input text. Only enhance what is provided.
2. ATS ENHANCEMENT:
   - Rewrite descriptions and achievements using strong action verbs (e.g., "Spearheaded", "Architected", "Optimized", "Executed").
   - Maintain and highlight any quantitative metrics (%, $, numbers).
   - Use an implicit third-person, professional tone (remove "I", "me", "my", "our", etc.).
   - Ensure "achievements" are formatted as concise, punchy bullet points separated by periods or newlines.
3. OUTPUT FORMAT: 
   - Return ONLY a valid JSON object.
   - Keys: "reply" (a brief, professional summary of what you improved) and "updates" (the modified CV object).
   - For lists (edu, exp, proj, skills), always provide the COMPLETED, updated array for that field.

SCHEMA FOR UPDATES:
- edu: [{ "inst": "Institution", "loc": "Location", "deg": "Degree", "period": "Dates" }]
- exp: [{ "co": "Company", "loc": "Location", "role": "Job Title", "period": "Dates", "desc": "Context/Summary", "ach": "Action-oriented achievements" }]
- proj: [{ "name": "Project", "tech": "Stack", "desc": "Context", "ach": "Impact/Outcome" }]
- skills: { "lang": [], "tech": [], "hard": [], "soft": [] }`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: userMsg }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Groq API Error: ${errorText}` })
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
