import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import {tavily} from '@tavily/core'
import readline from 'readline';

dotenv.config();

const groq = new Groq({ apiKey: process.env.API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  if (!process.env.API_KEY) {
    throw new Error('Missing API_KEY in environment. Add it to .env file.');
  }

  const messages = [
    {
      role: 'system',
      content: `you are shanto's Assistant, built only for Shanto.
      You have access to the "web_search" tool.
      If the question needs current or external information, call web_search.
      After you get search results, answer the user's question based on those results. Do not call web_search again if you already have the results.`
    }
  ];

  function ask() {
    rl.question('You: ', async (input) => {
      messages.push({ role: 'user', content: input });

      let iterations = 0;
      while (iterations < 5) {
        iterations++;
        const completion = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          temperature: 0,
          tools: [
            {
              type: "function",
              function: {
                name: "web_search",
                description: "Search the latest information on the web for information",
                parameters: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      description: "the search query to perform search on"
                    }
                  },
                  required: ["query"]
                }
              }
            }
          ],
          tool_choice: 'auto',
          messages: messages
        });

        const assistantMessage = completion.choices[0].message;
        messages.push(assistantMessage);

        if (!assistantMessage.tool_calls) {
          console.log(`\nAssistant: ${assistantMessage.content}\n`);
          ask();
          break;
        }

        console.log(`\n[Iteration ${iterations}] Tool called, searching...`);

        for (const toolCall of assistantMessage.tool_calls) {
          if (toolCall.function.name === 'web_search') {
            const args = JSON.parse(toolCall.function.arguments);
            const result = await web_search(args);

            messages.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolCall.function.name,
              content: result
            });
          }
        }
      }
    });
  }

  ask();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

async function web_search({ query }) {
  console.log("calling........")
  const response = await tvly.search(query);
  const finalResult = response.results.map((result) => result.content).join('\n\n');
  return finalResult;
}
