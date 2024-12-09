import { getOpenAIClient, handleOpenAIRequest } from '../../server/openai/client.js';

const openai = getOpenAIClient();

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { messages, config = {}, max_tokens, temperature, response_format } = JSON.parse(event.body);

    const completion = await handleOpenAIRequest(() => 
      openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages,
        ...config.parameters,
        max_tokens,
        temperature,
        response_format,
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ completion }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.CONTEXT === 'production' 
          ? 'https://peppy-cassata-b91b8e.netlify.app' 
          : 'http://localhost:8888'
      }
    };
  } catch (error) {
    console.error('Error generating game prompt:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 