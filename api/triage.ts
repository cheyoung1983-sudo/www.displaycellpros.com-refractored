import type { VercelRequest, VercelResponse } from '@vercel/node';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

function detectSpecsFromText(text: string, currentDetails?: any) {
  const specs = {
    brand: currentDetails?.brand || null,
    model: currentDetails?.model || null,
    tier: currentDetails?.tier || null,
    issue: currentDetails?.issue || null,
    pricingTier: currentDetails?.pricingTier || null,
    step: currentDetails?.step || 1
  };
  const textLower = text.toLowerCase();
  if (textLower.includes("apple") || textLower.includes("iphone")) specs.brand = "Apple";
  else if (textLower.includes("samsung") || textLower.includes("galaxy")) specs.brand = "Samsung";

  if (textLower.includes("screen") || textLower.includes("crack")) {
    specs.issue = "screen";
    specs.pricingTier = "Tier 2";
    specs.step = 3;
  } else if (textLower.includes("battery")) {
    specs.issue = "battery";
    specs.pricingTier = "Tier 1";
    specs.step = 3;
  }
  return specs;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages, deviceDetails } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array required" });
  }

  const systemInstruction = `You are the Display & Cell Pros Intelligent AI Hardware Diagnostics assistant.
  Follow a 3-step triage: 1. Welcome, 2. Identify Device, 3. Triage Damage.
  Return valid JSON with 'text' and 'detectedSpecs'.`;

  try {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: systemInstruction,
      messages: messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text
      })),
    });

    try {
      return res.status(200).json(JSON.parse(text));
    } catch (parseErr) {
      // If AI returns markdown or non-JSON, attempt extraction or return as text
      return res.status(200).json({
        text,
        detectedSpecs: detectSpecsFromText(messages[messages.length - 1]?.text || "", deviceDetails)
      });
    }

  } catch (err: any) {
    console.warn("Vercel AI SDK fallback active:", err.message);
    const lastMsg = messages[messages.length - 1]?.text || "";
    const specs = detectSpecsFromText(lastMsg, deviceDetails);
    return res.status(200).json({
      text: "I'm having trouble connecting to my brain, but I've noted your issue. Let's continue in the lab.",
      detectedSpecs: specs
    });
  }
}
