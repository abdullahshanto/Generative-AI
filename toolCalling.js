import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.API_KEY });

async function main() {
  if (!process.env.API_KEY) {
    throw new Error('Missing API_KEY in environment. Add it to .env file.');
  }

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
              },
              unit: {
                type: "string",
                enum: ["celsius", "fahrenheit"]
              }
            },
            required: ["query"]
          }
        }
      }
    ],
    tool_choice: 'auto',
    messages: [
      {
        role: 'system',
        content: `you are shanto's Assistant,you are built for only for Shanto.
        Return the answer as JSON.

        You have access to following tools
        `
      },
      {
        role: 'user',
        content: `when was iphone 16 pro max launched?`
      }
    ]
  });

  const message = completion.choices[0].message;
  const toolCalls = message.tool_calls;

  if (!toolCalls) {
    console.log(`assistant: ${message.content}`);
    return;
  }

  for (const toolCall of toolCalls) {
    if (toolCall.function.name === 'web_search') {
      const args = JSON.parse(toolCall.function.arguments);
      const result = await web_search(args);

      const secondCompletion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: `you are shanto's Assistant,you are built for only for Shanto.
            Return the answer as JSON.
            You have access to following tools
            `
          },
          {
            role: 'user',
            content: `when was iphone 16 pro max launched?`
          },
          message,
          {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: result
          }
        ]
      });

      console.log(JSON.stringify(secondCompletion.choices[0].message, null, 2));
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

async function web_search({ query }) {
  //console.log("calling");
  return "iphone 16 was launched on 20 sep,2024";
}
