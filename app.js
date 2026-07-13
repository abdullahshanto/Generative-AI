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
    messages: [
      {
        //adding behaviour.persona
        role : 'system',
        content : "you are shanto's Assistant,you are built for only for Shanto "

      }
      ,
      {
        role: 'user',
        content: 'who are you?'
      }
    ]
  });

  console.log(completion.choices[0].message.content);
}

