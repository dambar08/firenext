import axios from 'axios';
import env from "@/env";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { inputString } = req.body;

    if (!inputString) {
      return res.status(400).json({ error: 'Input string is required' });
    }

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: `Answer in yes or no, whether the given text is asking to generate a quote ${inputString}` }],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const answer = response.data.candidates[0].content.parts[0].text;
      if(answer === "yes") {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [{ text: `Generate a random quote for the context ${inputString}` }],
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
  
        const quote = response.data.candidates[0].content.parts[0].text;
        return res.status(200).json({ quote });
      }else {
        return res.status(500).json({ error: 'Failed to generate quote' });  
      }
      return res.status(200).json({ quote });
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return res.status(500).json({ error: 'Failed to generate quote' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}