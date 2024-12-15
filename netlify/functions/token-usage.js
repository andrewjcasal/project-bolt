import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

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
  return Math.max(0, numTokens);
};

const wouldExceedLimit = (current, newTokens, limit = 5000) => {
  const total = (current?.used || 0) + newTokens;
  return total > limit;
};

exports.handler = async (event, context) => {
  const deviceId = event.path.split('/').pop();
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CONTEXT === 'production' 
      ? 'https://peppy-cassata-b91b8e.netlify.app' 
      : 'http://localhost:8888'
  };

  // Handle GET request
  if (event.httpMethod === 'GET') {
    try {
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
        return {
          statusCode: 200,
          body: JSON.stringify(newToken),
          headers
        };
      }

      if (shouldReset(tokenData.lastReset)) {
        const reset = getDefaultUsage();
        const { error: updateError } = await supabase
          .from('tokens')
          .update(reset)
          .eq('device_id', deviceId);
          
        if (updateError) throw updateError;
        return {
          statusCode: 200,
          body: JSON.stringify(reset),
          headers
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(tokenData),
        headers
      };
    } catch (error) {
      console.error('Error getting token usage:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
        headers
      };
    }
  }

  // Handle POST request
  if (event.httpMethod === 'POST') {
    try {
      const { tokens } = JSON.parse(event.body);
      const validTokens = validateTokens(tokens);
      
      const { data: current, error: getError } = await supabase
        .from('tokens')
        .select('*')
        .eq('device_id', deviceId)
        .maybeSingle();
      
      if (getError && getError.code !== 'PGRST116') throw getError;
      
      if (wouldExceedLimit(current, validTokens)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            error: 'Token limit would be exceeded',
            current: current?.used || 0,
            limit: 5000
          }),
          headers
        };
      }

      if (!current) {
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
        return {
          statusCode: 200,
          body: JSON.stringify(newToken),
          headers
        };
      }

      const updated = {
        ...current,
        used: Math.max(0, current.used + validTokens)
      };

      const { error: updateError } = await supabase
        .from('tokens')
        .update(updated)
        .eq('device_id', deviceId);
        
      if (updateError) throw updateError;

      return {
        statusCode: 200,
        body: JSON.stringify(updated),
        headers
      };
    } catch (error) {
      console.error('Error updating token usage:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
        headers
      };
    }
  }

  // Handle unsupported methods
  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' }),
    headers
  };
}; 