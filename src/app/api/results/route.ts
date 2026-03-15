import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('adminToken');

    if (process.env.ADMIN_PASSWORD && password !== process.env.ADMIN_PASSWORD) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get individual scores with user names
    const stmt = db.prepare(`
      SELECT 
        u.name,
        ar.phase_1_score,
        ar.phase_2_score,
        ar.phase_3_score,
        ar.phase_4_score,
        ar.phase_5_score,
        ar.timestamp
      FROM AssessmentResults ar
      JOIN Users u ON ar.user_id = u.id
      ORDER BY ar.timestamp DESC
    `);
    
    const rows = stmt.all() as { phase_1_score: number; phase_2_score: number; phase_3_score: number; phase_4_score: number; phase_5_score: number }[];

    // Calculate group averages
    const averages = {
      phase1: 0, phase2: 0, phase3: 0, phase4: 0, phase5: 0
    };

    if (rows.length > 0) {
      const sum = rows.reduce((acc, curr) => {
        acc.phase1 += curr.phase_1_score;
        acc.phase2 += curr.phase_2_score;
        acc.phase3 += curr.phase_3_score;
        acc.phase4 += curr.phase_4_score;
        acc.phase5 += curr.phase_5_score;
        return acc;
      }, { phase1: 0, phase2: 0, phase3: 0, phase4: 0, phase5: 0 });

      averages.phase1 = Math.round((sum.phase1 / rows.length) * 10) / 10;
      averages.phase2 = Math.round((sum.phase2 / rows.length) * 10) / 10;
      averages.phase3 = Math.round((sum.phase3 / rows.length) * 10) / 10;
      averages.phase4 = Math.round((sum.phase4 / rows.length) * 10) / 10;
      averages.phase5 = Math.round((sum.phase5 / rows.length) * 10) / 10;
    }

    return NextResponse.json({
        success: true,
        individuals: rows,
        averages,
    });
  } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
