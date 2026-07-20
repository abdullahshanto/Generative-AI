import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { tavily } from '@tavily/core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const groq = new Groq({ apiKey: process.env.API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

async function web_search({ query }) {
  const response = await tvly.search(query);
  return response.results.map((result) => result.content).join('\n\n');
}

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!process.env.API_KEY) {
      return res.status(500).json({ error: 'Missing API_KEY' });
    }

    const systemMessage = {
      role: 'system',
      content: `You are Shanto's Assistant. You have access to the "web_search" tool.
If the question needs current or external information, call web_search.
After you get search results, answer based on those results. Do not call web_search again if you already have the results.`
    };

    const fullMessages = [systemMessage, ...messages];

    let iterations = 0;
    while (iterations < 5) {
      iterations++;

      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        temperature: 0,
        tools: [
          {
            type: 'function',
            function: {
              name: 'web_search',
              description: 'Search the latest information on the web',
              parameters: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'the search query to perform search on'
                  }
                },
                required: ['query']
              }
            }
          }
        ],
        tool_choice: 'auto',
        messages: fullMessages
      });

      const assistantMessage = completion.choices[0].message;
      fullMessages.push(assistantMessage);

      if (!assistantMessage.tool_calls) {
        return res.json({ reply: assistantMessage.content });
      }

      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.function.name === 'web_search') {
          const args = JSON.parse(toolCall.function.arguments);
          const result = await web_search(args);

          fullMessages.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: toolCall.function.name,
            content: result
          });
        }
      }
    }

    return res.json({ reply: 'I took too many attempts. Please try again.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

