import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.API_KEY });

async function main() {
  if (!process.env.API_KEY) {
    throw new Error('Missing API_KEY in environment. Add it to .env file.');
  }

  const completion = await groq.chat.completions.create({

    reasoning_format : {type: 'json_object'},//latest one is json schema 
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        //adding behaviour.persona
        role : 'system',
        content : `you are shanto's Assistant,you are built for only for Shanto .Your task is to generate candiadte eveluation score of an ineterview for shanto.Output must be followung json structure
        {
           "confidence" : number (1-10 scale),
           "accuracy" : number (1-10 scale),
            "pass" : boolean(true/false)
        }

        this formate must :
          1.include confidence score of the candidate based on their answers.
          2.include accuracy score of the candidate based on their answers.
          3.include pass/fail status based on the scores.
          4. The output must be in JSON format only, no other text or explanation should be included.
          5. The output must be a valid JSON object with the specified keys and value types.
        `

      }
      ,
      {
        role: 'user',
        content: `Evaluate the candidate based on their interview performance.
          validate the candidate's answers and provide a score for confidence and accuracy on a scale of 1 to 10.
           
        `
      }
    ]
  });

  console.log(completion.choices[0].message.content);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});