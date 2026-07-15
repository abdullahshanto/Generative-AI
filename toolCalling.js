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
    "tools": [
    {
      "type": "function",//tool basically is a function
      "function": {
        "name": "web_search",
        "description": "Search the latest information on the web for information",
        "parameters": {
          // JSON Schema object
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "the search query to perform serach on"
            },
            "unit": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"]
            }
          },
          "required": ["query"]
        }
      }
    }
  ],

  "tool_choice" : 'auto',
    messages: [
      {
        //adding behaviour.persona
        role : 'system',
        content : `you are shanto's Assistant,you are built for only for Shanto.
        Return the answer as JSON.

        You have access to following tools
        `

      }
      ,
      {
        role: 'user',
        content: `when was iphone 16 pro max launched?
           
        `
      }
    ]
  });

  console.log(JSON.stringify(completion.choices[0].message, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});




async function web_search({ query }) {

  return "iphone 16 was lauched on 20 sep,2024";
}