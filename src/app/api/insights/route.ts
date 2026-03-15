import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('adminToken');

    if (process.env.ADMIN_PASSWORD && password !== process.env.ADMIN_PASSWORD) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all friction feedback
    const stmt = db.prepare(`SELECT friction_feedback FROM AssessmentResults WHERE friction_feedback IS NOT NULL AND friction_feedback != ''`);
    const rows = stmt.all() as { friction_feedback: string }[];
    
    if (rows.length === 0) {
      return NextResponse.json({ insight: "No friction feedback recorded yet." });
    }

    const feedbacks = rows.map(r => r.friction_feedback).join('\n---\n');

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ insight: "OpenAI API Key is required to synthesize feedback." });
    }

    const systemPrompt = `
      You are an expert AI Adoption Analyst. Review the following "Friction Point" feedback entries from the engineering team regarding their AI-Enabled SDLC workflow.
      Synthesize this feedback into a concise 1-2 paragraph executive summary. Highlight the most common struggles (e.g., "30% of the team is struggling with X") and provide a quick recommendation on how leadership can address it.
      
      Feedback:
      ${feedbacks}
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      temperature: 0.3,
    });

    const insight = response.choices[0].message.content || 'Failed to generate insights.';

    return NextResponse.json({
        success: true,
        insight,
    });
  } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}
