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
    const { items, occasion } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const itemDescriptions = items.map((item: any) => 
      `${item.name} (${item.category}, ${item.dress_code}, ${item.color || 'no color'})`
    ).join(', ');

    const prompt = `You are a fashion stylist AI. Create a stylish outfit for a ${occasion} occasion.
    
Available items: ${itemDescriptions}

Provide a response in this exact JSON format:
{
  "outfit": [list of item IDs that work together],
  "reasoning": "Why this combination works",
  "styling_tips": "How to wear and accessorize this outfit"
}

Select 3-5 items that complement each other based on color, style, and the occasion.`;

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
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    // Try to parse JSON from the response
    let outfitData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      outfitData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        outfit: items.slice(0, 3).map((i: any) => i.id),
        reasoning: aiResponse,
        styling_tips: "Mix and match these pieces for a great look!"
      };
    } catch (e) {
      outfitData = {
        outfit: items.slice(0, 3).map((i: any) => i.id),
        reasoning: aiResponse,
        styling_tips: "Mix and match these pieces for a great look!"
      };
    }

    return new Response(
      JSON.stringify(outfitData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});