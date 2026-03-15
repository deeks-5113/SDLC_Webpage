import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import db from '@/lib/db';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the shape of incoming assessment submission
const assessmentSchema = z.object({
  userName: z.string().min(1),
  answers: z.object({
    phase1: z.object({ mcq1: z.string(), mcq2: z.string(), mcq3: z.string(), openEnded: z.string() }),
    phase2: z.object({ mcq1: z.string(), mcq2: z.string(), mcq3: z.string(), openEnded: z.string() }),
    phase3: z.object({ mcq1: z.string(), mcq2: z.string(), mcq3: z.string(), openEnded: z.string() }),
    phase4: z.object({ mcq1: z.string(), mcq2: z.string(), mcq3: z.string(), openEnded: z.string() }),
    phase5: z.object({ mcq1: z.string(), mcq2: z.string(), mcq3: z.string(), openEnded: z.string() }),
  }),
  frictionFeedback: z.string().optional().default(''),
});

// Hardcoded Correct Answers for MCQs
const correctAnswers = {
  phase1: { mcq1: "B", mcq2: "B", mcq3: "C" },
  phase2: { mcq1: "B", mcq2: "B", mcq3: "A" },
  phase3: { mcq1: "B", mcq2: "B", mcq3: "C" },
  phase4: { mcq1: "A", mcq2: "B", mcq3: "D" },
  phase5: { mcq1: "A", mcq2: "B", mcq3: "C" },
};

// Evaluation criteria for AI prompt (Scored 0-15)
const openEndedCriteria = {
  phase1: `
    Scenario: "Your Product Manager hands you a 2-sentence Slack message saying: 'Build a login page for the new dashboard.' It seems simple enough. Instead of taking that straight to the AI to write code, what steps must you take to turn this into a proper spec.md?"
    Criteria (Total 15 pts):
    - 5 pts: Mentions actively asking clarifying/gap questions to the PM or AI.
    - 5 pts: Mentions the need to explicitly define edge cases and failure modes (e.g., wrong password, API timeout).
    - 5 pts: Mentions getting human sign-off/approval on the written spec before moving to code.
  `,
  phase2: `
    Scenario: "The requirements for a new API endpoint are crystal clear, and you feel completely confident you know how to build it. Why shouldn't you just ask Gemini to write the code immediately? Describe the design steps you need to complete first."
    Criteria (Total 15 pts):
    - 5 pts: Mentions using AI to brainstorm and compare multiple technical approaches/trade-offs.
    - 5 pts: Mentions creating a visual architecture diagram (Mermaid/PlantUML).
    - 5 pts: Mentions breaking the plan into small, numbered, testable steps to prevent the AI from hallucinating later.
  `,
  phase3: `
    Scenario: "You are working on Step 2 of your plan. You ask Gemini to write the tests and the implementation code all at once. It gives you 400 lines of code. What principles of our AI-SDLC did you just violate, and how should you fix your workflow?"
    Criteria (Total 15 pts):
    - 5 pts: Identifies the violation of strict TDD (must write failing tests first, commit, then write code).
    - 5 pts: Identifies the violation of chunk size (changes should be small, usually ~200 LOC or less).
    - 5 pts: Mentions the need to pass the code through the Reviewer Agent (Opus) for a >=95 score before committing.
  `,
  phase4: `
    Scenario: "The AI generated a massive test suite for your feature with 90% coverage. All the tests are green in the CI pipeline. You are about to merge the PR. What crucial, human-led testing step is missing, and why can't we just trust the green AI tests?"
    Criteria (Total 15 pts):
    - 5 pts: Identifies that AI can write tests that simply validate its own flawed logic (the "AI testing AI" blind spot).
    - 5 pts: Mentions the absolute need for human exploratory testing.
    - 5 pts: Mentions validating actual business-risk and UX feel, which deterministic tests cannot catch.
  `,
  phase5: `
    Scenario: "A critical bug is reported in production. You use AI to generate a fix, it passes the Opus review, and all unit tests are green. The PM asks you to push it straight to 100% of users immediately so the customer stops complaining. How do you handle this deployment safely according to our rules?"
    Criteria (Total 15 pts):
    - 5 pts: Pushes back on the 100% immediate rollout.
    - 5 pts: Insists on a progressive/canary rollout (e.g., 5-10% of traffic first) and using feature flags.
    - 5 pts: Mentions monitoring metrics/SLOs during the canary phase to ensure no error spikes before full promotion.
  `,
};

// Function to call OpenAI and get a score for an open-ended answer
async function gradeOpenEnded(phaseName: string, answer: string): Promise<number> {
  if (!answer || answer.trim() === '') return 0;
  if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY is not set. Falling back to default grading (10 pts).");
      return 10;
  }
  
  const systemPrompt = `
    You are an expert strict SWE Appraiser grading a developer's response for an internal SDLC assessment. 
    Evaluate the user's response to the scenario based ONLY on the provided criteria.
    Award points for each criterion they meet.
    Sum the points to a final integer score between 0 and 15.
    Respond ONLY with a JSON object in this exact format: {"score": <integer>}
    
    ${openEndedCriteria[phaseName as keyof typeof openEndedCriteria]}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // or gpt-3.5-turbo if you prefer cost efficiency
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Developer's Answer: "${answer}"` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const body = response.choices[0].message.content;
    const parsed = JSON.parse(body || '{"score": 0}');
    return Math.min(15, Math.max(0, parsed.score || 0));
  } catch (err) {
    console.error(`Failed to grade ${phaseName}:`, err);
    return 0;
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const result = assessmentSchema.safeParse(json);
    
    if (!result.success) {
      return NextResponse.json({ error: "Invalid payload format", details: result.error.flatten() }, { status: 400 });
    }

    const data = result.data;
    const { userName, answers, frictionFeedback } = data;

    // We grade MCQs synchronously (5 pts each, max 15 per phase)
    const mcqScores = {
      phase1: 0, phase2: 0, phase3: 0, phase4: 0, phase5: 0
    };

    const runMcqGrading = (phase: keyof typeof correctAnswers) => {
      let score = 0;
      if (answers[phase].mcq1 === correctAnswers[phase].mcq1) score += 5;
      if (answers[phase].mcq2 === correctAnswers[phase].mcq2) score += 5;
      if (answers[phase].mcq3 === correctAnswers[phase].mcq3) score += 5;
      mcqScores[phase] = score;
    };

    (["phase1", "phase2", "phase3", "phase4", "phase5"] as const).forEach(runMcqGrading);

    // Grade Open Ended synchronously via Promise.all (Max 15 per phase)
    const [
      phase1OpenScore, 
      phase2OpenScore, 
      phase3OpenScore, 
      phase4OpenScore, 
      phase5OpenScore
    ] = await Promise.all([
      gradeOpenEnded('phase1', answers.phase1.openEnded),
      gradeOpenEnded('phase2', answers.phase2.openEnded),
      gradeOpenEnded('phase3', answers.phase3.openEnded),
      gradeOpenEnded('phase4', answers.phase4.openEnded),
      gradeOpenEnded('phase5', answers.phase5.openEnded),
    ]);

    // Calculate final totals per phase
    const p1Total = mcqScores.phase1 + phase1OpenScore;
    const p2Total = mcqScores.phase2 + phase2OpenScore;
    const p3Total = mcqScores.phase3 + phase3OpenScore;
    const p4Total = mcqScores.phase4 + phase4OpenScore;
    const p5Total = mcqScores.phase5 + phase5OpenScore;

    // Database operation to ensure User exists then insert/update Assessment result
    let userId = null;
    try {
        const stmtGet = db.prepare('SELECT id FROM Users WHERE name = ?');
        const userResult = stmtGet.get(userName) as { id: number } | undefined;
        
        if (!userResult) {
            const stmtInsert = db.prepare('INSERT INTO Users (name) VALUES (?)');
            const info = stmtInsert.run(userName);
            userId = info.lastInsertRowid;
        } else {
            userId = userResult.id;
        }

        const stmtSaveScore = db.prepare(`
            INSERT INTO AssessmentResults (
                user_id, phase_1_score, phase_2_score, phase_3_score, phase_4_score, phase_5_score, friction_feedback
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        stmtSaveScore.run(userId, p1Total, p2Total, p3Total, p4Total, p5Total, frictionFeedback);

    } catch (dbErr: unknown) {
        console.error("DB error", dbErr);
        return NextResponse.json({ error: "Failed to save results" }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        scores: {
            phase1: p1Total,
            phase2: p2Total,
            phase3: p3Total,
            phase4: p4Total,
            phase5: p5Total
        }
    });

  } catch (error: unknown) {
    console.error("Evaluation Error:", error);
    return NextResponse.json({ error: "Something went wrong during evaluation" }, { status: 500 });
  }
}
