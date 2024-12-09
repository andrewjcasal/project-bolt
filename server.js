import express from 'express';
import { getOpenAIClient, handleOpenAIRequest } from './server/openai/client.js';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const openai = getOpenAIClient();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
  origin: process.env.CONTEXT === 'production' ? 'https://peppy-cassata-b91b8e.netlify.app' : 'http://localhost:8888',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
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
        model: "gpt-4-turbo-preview",
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
    res.status(500).json({ error: error.message });
  }
});

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

const getDefaultUsage = () => {
  const now = new Date().toISOString();
  return {
    used: 0,
    limit: 5000,
    lastReset: now
  };
};

const shouldReset = (lastReset) => {
  const resetDate = new Date(lastReset);
  const now = new Date();
  
  if (now.getTime() - resetDate.getTime() > 24 * 60 * 60 * 1000) {
    return true;
  }
  
  return resetDate.getUTCDate() !== now.getUTCDate();
};

const validateTokens = (tokens) => {
  const numTokens = Number(tokens);
  if (isNaN(numTokens) || numTokens < 0) {
    throw new Error('Invalid token count');
  }
  return numTokens;
};

app.get('/api/tokens/usage/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    // Get token usage from Supabase
    const { data: tokenData, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    if (!tokenData) {
      const initial = getDefaultUsage();
      const { data: newToken, error: insertError } = await supabase
        .from('tokens')
        .upsert([{ device_id: deviceId, ...initial }])
        .select()
        .single();
        
      if (insertError) throw insertError;
      return res.json(newToken);
    }

    if (shouldReset(tokenData.lastReset)) {
      const reset = getDefaultUsage();
      const { error: updateError } = await supabase
        .from('tokens')
        .update(reset)
        .eq('device_id', deviceId);
        
      if (updateError) throw updateError;
      return res.json(reset);
    }

    return res.json(tokenData);
  } catch (error) {
    console.error('Error getting token usage:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tokens/usage/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { tokens } = req.body;
    
    const validTokens = validateTokens(tokens);
    
    // Get current usage
    const { data: current, error: getError } = await supabase
      .from('tokens')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle();
    
    if (getError && getError.code !== 'PGRST116') throw getError;
    
    if (!current) {
      // Create new record using upsert
      const initial = getDefaultUsage();
      const { data: newToken, error: upsertError } = await supabase
        .from('tokens')
        .upsert([{ 
          device_id: deviceId, 
          ...initial,
          used: validTokens 
        }])
        .select()
        .single();
        
      if (upsertError) throw upsertError;
      return res.json(newToken);
    }

    const updated = {
      ...current,
      used: current.used + validTokens
    };

    const { error: updateError } = await supabase
      .from('tokens')
      .update(updated)
      .eq('device_id', deviceId);
      
    if (updateError) throw updateError;

    res.json(updated);
  } catch (error) {
    console.error('Error updating token usage:', error);
    res.status(500).json({ error: error.message });
  }
});