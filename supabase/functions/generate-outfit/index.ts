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
    const body = await req.json();
    const { items, occasion } = body;

    // Validate inputs
    if (!items || !Array.isArray(items) || items.length < 3) {
      return new Response(
        JSON.stringify({ error: 'At least 3 items are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!occasion || typeof occasion !== 'string' || occasion.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Valid occasion is required (max 50 characters)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate each item structure
    for (const item of items) {
      if (!item.id || !item.name || !item.category || !item.dress_code) {
        return new Response(
          JSON.stringify({ error: 'Invalid item data structure' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Sanitize inputs by truncating and removing special characters
    const sanitizedOccasion = occasion.trim().substring(0, 50).replace(/[^\w\s-]/g, '');
    
    const itemDescriptions = items.map((item: any) => {
      const name = String(item.name || '').substring(0, 100);
      const category = String(item.category || '').substring(0, 50);
      const dressCode = String(item.dress_code || '').substring(0, 50);
      const color = item.color ? String(item.color).substring(0, 30) : 'no color';
      return `${name} (${category}, ${dressCode}, ${color})`;
    }).join(', ');

    const prompt = `You are a fashion stylist AI. Create a stylish outfit for a ${sanitizedOccasion} occasion.
    
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