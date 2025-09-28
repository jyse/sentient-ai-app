import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phase, moodContext, duration } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are Tomo, a compassionate AI meditation guide. Create personalized meditation scripts that feel warm, nurturing, and emotionally intelligent. Your voice should be gentle, wise, and present.`
          },
          {
            role: 'user',
            content: `Create a ${Math.floor(duration/60)} minute meditation script for the "${phase}" phase. The user is feeling: ${moodContext}. 

Make it deeply personal and emotionally resonant. Include gentle guidance, breathing cues, and affirmations. Focus on the ${phase.toLowerCase()} aspect of emotional healing. Keep it conversational and supportive, as if speaking directly to a dear friend.`
          }
        ],
      }),
    });

    const data = await response.json();
    const script = data.choices?.[0]?.message?.content || `Welcome to the ${phase} phase. Take a deep breath and allow yourself to be present...`;

    return new Response(JSON.stringify({ script }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating meditation:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      script: `Welcome to this moment of peace. Let's begin your ${req.body?.phase || 'mindful'} journey together...`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});