import express from 'express';
import { getOpenAIClient, handleOpenAIRequest } from './server/openai/client.js';
import cors from 'cors';

const openai = getOpenAIClient();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your Vite app's origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true // If you're using cookies or sessions
}));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.post('/api/generate-game-prompt', async (req, res) => {
  const { messages, config = {}, max_tokens, temperature, response_format } = req.body;

  try {
    const completion = await handleOpenAIRequest(() => 
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        ...config.parameters,
        max_tokens,
        temperature,
        response_format,
      })
    );
    res.send({completion});
  } catch (error) {
    console.error('Error generating game prompt:', error);
  }
});
