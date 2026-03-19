const fetch = require('node-fetch');

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

    const sysPrompt = `You are a helpful CV editing assistant. You view and update the user's CV data.
CURRENT CV STATE:
${JSON.stringify(currentCV, null, 2)}

INSTRUCTIONS:
1. Look at the requested changes or the imported text.
2. Formulate your response as a valid JSON object ONLY.
3. The JSON must have exactly two keys: "reply" and "updates".
4. For arrays (edu, exp, proj, skills.*), provide the ENTIRE updated array.
5. You MUST strictly use the following object keys for array items:
- edu: [{ "inst": "Institution", "loc": "Location", "deg": "Degree", "period": "Dates" }]
- exp: [{ "co": "Company", "loc": "Location", "role": "Job Title", "period": "Dates", "desc": "Description", "ach": "Achievements" }]
- proj: [{ "name": "Project", "tech": "Tech Stack", "desc": "Description", "ach": "Achievements" }]`;

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
