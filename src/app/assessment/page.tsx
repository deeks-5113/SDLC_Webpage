'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const PHASES = [
  {
    id: 'phase1',
    title: 'Phase 1: Requirements',
    mcqs: [
      {
        id: 'mcq1',
        question: 'Why is a versioned `spec.md` strictly required before you write any code prompts?',
        options: [
          { value: 'A', label: 'To provide a structured format that the CI/CD pipeline uses to autogenerate test stubs.' },
          { value: 'B', label: 'To act as the single source of truth that keeps the AI from hallucinating missing details.' },
          { value: 'C', label: 'To ensure all downstream prompts have a standardized token limit to reduce API costs.' },
          { value: 'D', label: 'To create a paper trail so the product team can sign off on the exact tech stack being used.' }
        ]
      },
      {
        id: 'mcq2',
        question: 'When writing acceptance criteria, why do we heavily prioritize listing edge cases and failure modes?',
        options: [
          { value: 'A', label: 'Because AI code generators typically default to defensive programming and need strict failure parameters.' },
          { value: 'B', label: 'They are used directly by the AI later to generate our test prompts.' },
          { value: 'C', label: 'To define the exact HTTP status codes the backend must return for every endpoint.' },
          { value: 'D', label: 'To ensure the PM understands the technical limitations of the chosen LLM.' }
        ]
      },
      {
        id: 'mcq3',
        question: 'What is the human\'s most critical responsibility during the Requirements phase?',
        options: [
          { value: 'A', label: 'Breaking the feature down into 200-line code chunks for the builder agent.' },
          { value: 'B', label: 'Selecting the exact prompt engineering techniques the AI will use to write the code.' },
          { value: 'C', label: 'Validating business alignment, domain correctness, and trade-offs.' },
          { value: 'D', label: 'Translating the PM\'s requests into database schemas and architecture diagrams.' }
        ]
      }
    ],
    scenario: "Your Product Manager hands you a 2-sentence Slack message saying: 'Build a login page for the new dashboard.' It seems simple enough. Instead of taking that straight to the AI to write code, what steps must you take to turn this into a proper spec.md?"
  },
  {
    id: 'phase2',
    title: 'Phase 2: Planning & Design',
    mcqs: [
      {
        id: 'mcq1',
        question: 'Why does the workflow ask you to use AI to brainstorm multiple technical approaches instead of just jumping into the first idea?',
        options: [
          { value: 'A', label: 'To bypass context window limits by breaking the architecture into smaller, isolated microservices.' },
          { value: 'B', label: 'To compare trade-offs (complexity, performance, security) before committing to an architecture.' },
          { value: 'C', label: 'To let the Reviewer Agent (Opus) vote on which language is most optimal for the task.' },
          { value: 'D', label: 'To ensure we always select the architecture that requires the least amount of custom code.' }
        ]
      },
      {
        id: 'mcq2',
        question: 'What is the primary purpose of including a Mermaid or PlantUML diagram in your `plan.md`?',
        options: [
          { value: 'A', label: 'To auto-generate the database migration scripts using Antigravity hooks.' },
          { value: 'B', label: 'To explicitly map out architecture so the AI context window understands component relationships.' },
          { value: 'C', label: 'To provide a visual artifact that the PM can use for stakeholder presentations.' },
          { value: 'D', label: 'To strictly define the order in which the AI will execute the TDD loops.' }
        ]
      },
      {
        id: 'mcq3',
        question: 'Why do we break down the implementation into discrete, numbered steps?',
        options: [
          { value: 'A', label: 'To ensure each step is small enough to be independently testable and verifiable by the AI reviewer.' },
          { value: 'B', label: 'To allow the CI pipeline to deploy each step to production independently.' },
          { value: 'C', label: 'To prioritize which steps the Builder Agent should execute asynchronously.' },
          { value: 'D', label: 'To map each step directly to a separate Jira sub-task for velocity tracking.' }
        ]
      }
    ],
    scenario: "The requirements for a new API endpoint are crystal clear, and you feel completely confident you know how to build it. Why shouldn't you just ask Gemini to write the code immediately? Describe the design steps you need to complete first."
  },
  {
    id: 'phase3',
    title: 'Phase 3: Build Plan',
    mcqs: [
      {
        id: 'mcq1',
        question: 'In our TDD approach, what is the strict order of operations?',
        options: [
          { value: 'A', label: 'Write minimal code -> Have Opus review it -> Generate tests to cover the approved code.' },
          { value: 'B', label: 'Generate tests -> Ensure they fail -> Write minimal code to pass -> Refactor.' },
          { value: 'C', label: 'Generate tests and code simultaneously -> Run CI pipeline -> Refactor based on test output.' },
          { value: 'D', label: 'Write failing tests -> Refactor existing code -> Write new code -> Commit.' }
        ]
      },
      {
        id: 'mcq2',
        question: 'Why do we strictly limit AI-generated code chunks to smaller sizes (e.g., ~200 lines)?',
        options: [
          { value: 'A', label: 'Because larger chunks exceed the token output limit of Gemini 3 Pro.' },
          { value: 'B', label: 'It keeps the changes verifiable and prevents the AI reviewer from missing subtle logic/security flaws.' },
          { value: 'C', label: 'To ensure the tests run in under 5 seconds during the TDD loop.' },
          { value: 'D', label: 'Because it forces the developer to write more modular, object-oriented code.' }
        ]
      },
      {
        id: 'mcq3',
        question: 'What is the purpose of the "Dual-Agent Verification" loop (e.g., using Gemini to build, and Opus to review)?',
        options: [
          { value: 'A', label: 'To ensure the code is cross-compatible by having one model write tests and the other write code.' },
          { value: 'B', label: 'To automatically resolve merge conflicts when multiple agents are committing code.' },
          { value: 'C', label: 'To use a stronger reasoning model as an adversarial check against the builder\'s output before a human sees it.' },
          { value: 'D', label: 'To satisfy the minimum two-approver rule required by SOC2 compliance without needing a second human.' }
        ]
      }
    ],
    scenario: "You are working on Step 2 of your plan. You ask Gemini to write the tests and the implementation code all at once. It gives you 400 lines of code. What principles of our AI-SDLC did you just violate, and how should you fix your workflow?"
  },
  {
    id: 'phase4',
    title: 'Phase 4: Code Testing & Validation',
    mcqs: [
      {
        id: 'mcq1',
        question: 'Why do we prefer "deterministic assertions" (checking exact values) over fuzzy matching in our AI-generated tests?',
        options: [
          { value: 'A', label: 'To prevent the test suite from passing false-positives or becoming flaky over time.' },
          { value: 'B', label: 'Because deterministic assertions consume fewer context tokens when fed back to the Reviewer Agent.' },
          { value: 'C', label: 'Because fuzzy matching requires external libraries that violate our AGENTS.md dependencies rule.' },
          { value: 'D', label: 'Because AI models cannot reliably generate Regex patterns required for fuzzy matching.' }
        ]
      },
      {
        id: 'mcq2',
        question: 'When the AI generates a test suite for you, what is the immediate next required step?',
        options: [
          { value: 'A', label: 'Run it against the production database to ensure the mock data is realistic.' },
          { value: 'B', label: 'Have the Reviewer AI (Opus) score it >=95 for coverage and traceability before integrating it.' },
          { value: 'C', label: 'Manually refactor the AI-generated tests to ensure they don\'t contain hardcoded secrets.' },
          { value: 'D', label: 'Use the Builder agent to immediately fix any existing code that the new tests cause to fail.' }
        ]
      },
      {
        id: 'mcq3',
        question: 'With AI writing most of the unit/integration tests, where should human engineers focus their testing time?',
        options: [
          { value: 'A', label: 'Writing End-to-End (E2E) Cypress tests, since AI can only handle unit testing.' },
          { value: 'B', label: 'Tuning the AI prompts to increase unit test coverage from 85% to 100%.' },
          { value: 'C', label: 'Manually verifying that the generated test data matches the OpenAPI schemas.' },
          { value: 'D', label: 'Exploratory testing, UI/UX feel, and complex business-risk validation that AI might miss.' }
        ]
      }
    ],
    scenario: "The AI generated a massive test suite for your feature with 90% coverage. All the tests are green in the CI pipeline. You are about to merge the PR. What crucial, human-led testing step is missing, and why can't we just trust the green AI tests?"
  },
  {
    id: 'phase5',
    title: 'Phase 5: Deployment',
    mcqs: [
      {
        id: 'mcq1',
        question: 'Why is a progressive/canary rollout (e.g., starting with 5% traffic) mandatory for our deployments?',
        options: [
          { value: 'A', label: 'It allows us to monitor for error spikes and SLO breaches safely before impacting all users.' },
          { value: 'B', label: 'It gives the AI anomaly detection agent time to train on the new logs before full traffic hits.' },
          { value: 'C', label: 'It ensures that any database migrations are strictly backwards compatible.' },
          { value: 'D', label: 'It allows the PM to perform a final UI/UX check on production data before clients see it.' }
        ]
      },
      {
        id: 'mcq2',
        question: 'What is the primary reason we use Feature Flags for all new code paths?',
        options: [
          { value: 'A', label: 'To allow the Builder Agent to deploy code to production before the tests are fully written.' },
          { value: 'B', label: 'So we can instantly toggle the feature off in production if something breaks, without doing a full code rollback.' },
          { value: 'C', label: 'So we can run A/B tests to see if the AI-generated UX performs better than the legacy UX.' },
          { value: 'D', label: 'To prevent the AI from accidentally deleting legacy code during refactoring phases.' }
        ]
      },
      {
        id: 'mcq3',
        question: 'Even with AI risk analysis and automated pipelines, what step absolutely requires a human gate?',
        options: [
          { value: 'A', label: 'Writing the rollback script if the canary deployment fails.' },
          { value: 'B', label: 'Merging the final PR from the staging branch into the main branch.' },
          { value: 'C', label: 'The final approval to promote the release to the production environment.' },
          { value: 'D', label: 'Classifying the severity of any post-deployment anomalies detected by the AI.' }
        ]
      }
    ],
    scenario: "A critical bug is reported in production. You use AI to generate a fix, it passes the Opus review, and all unit tests are green. The PM asks you to push it straight to 100% of users immediately so the customer stops complaining. How do you handle this deployment safely according to our rules?"
  }
];

export default function Assessment() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');

  const [currentStep, setCurrentStep] = useState(0); // 0-4 for phases, 5 for friction feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<Record<string, number> | null>(null);

  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({
    phase1: { mcq1: '', mcq2: '', mcq3: '', openEnded: '' },
    phase2: { mcq1: '', mcq2: '', mcq3: '', openEnded: '' },
    phase3: { mcq1: '', mcq2: '', mcq3: '', openEnded: '' },
    phase4: { mcq1: '', mcq2: '', mcq3: '', openEnded: '' },
    phase5: { mcq1: '', mcq2: '', mcq3: '', openEnded: '' }
  });
  const [frictionFeedback, setFrictionFeedback] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('sdlc_user_name');
    if (!name) router.push('/');
    else setUserName(name);
  }, [router]);

  const handleMcqChange = (phaseId: string, mcqId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [phaseId]: { ...prev[phaseId], [mcqId]: value }
    }));
  };

  const handleOpenEndedChange = (phaseId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [phaseId]: { ...prev[phaseId], openEnded: value }
    }));
  };

  const currentPhase = PHASES[currentStep];
  const isLastPhase = currentStep === PHASES.length - 1;
  const isFeedbackStep = currentStep === PHASES.length;

  const canProceedPhase = currentPhase && answers[currentPhase.id].mcq1 && answers[currentPhase.id].mcq2 && answers[currentPhase.id].mcq3 && answers[currentPhase.id].openEnded.trim().length > 10;
  const canSubmit = isFeedbackStep && frictionFeedback.trim().length > 5;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, answers, frictionFeedback })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.scores);
      } else {
        alert("Failed to submit assessment: " + JSON.stringify(data.error));
      }
    } catch (err) {
      console.error(err);
      alert("Submission error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------
  // Render Completed State
  // -------------------------
  if (results) {
    const total = Object.values(results).reduce((a: number, b: number) => a + b, 0);
    const maxScore = 150; 

    return (
      <div className="relative min-h-[100dvh] bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans flex items-center justify-center">
        {/* Abstract dark mode background blur */}
        <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[20%] w-[30%] h-[30%] rounded-full bg-violet-600/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600/50 to-violet-600/50 p-10 text-center border-b border-white/10">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-5 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Assessment Complete!</h1>
            <p className="text-indigo-200">Thank you for completing the SDLC audit, <span className="text-white font-medium">{userName}</span>.</p>
          </div>

          <div className="p-10">
            <div className="flex flex-col items-center justify-center mb-8">
               <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Your Total Score</h2>
               <div className="flex items-baseline text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
                  {total} <span className="text-2xl text-slate-500 ml-2 font-medium">/ {maxScore}</span>
               </div>
            </div>

            <div className="space-y-4">
              {['phase1', 'phase2', 'phase3', 'phase4', 'phase5'].map((phaseKey, idx) => (
                <div key={phaseKey} className="flex justify-between items-center bg-white/5 p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <span className="font-medium text-slate-300">Phase {idx + 1} Score</span>
                  <span className="text-xl font-bold text-indigo-400">{results[phaseKey]} <span className="text-sm font-normal text-slate-500">/ 30</span></span>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <button 
                onClick={() => router.push('/')} 
                className="group inline-flex items-center text-indigo-400 hover:text-indigo-300 font-medium tracking-wide transition-colors"
              >
                Return Home <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------
  // Render Assessment Form
  // -------------------------
  return (
    <div className="relative min-h-[100dvh] bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none fixed" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none fixed" />

      <div className="relative z-10 max-w-3xl mx-auto bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden mb-12">
        {/* Progress header */}
        <div className="bg-white/5 px-8 py-5 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {isFeedbackStep ? 'Final Step' : `Step ${currentStep + 1} of ${PHASES.length}`}
          </span>
          <div className="flex gap-2">
            {[...Array(PHASES.length + 1)].map((_, i) => (
              <div 
                 key={i} 
                 className={`w-10 h-1.5 rounded-full transition-all duration-500 ${i < currentStep ? 'bg-indigo-500/50' : i === currentStep ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]' : 'bg-white/10'}`} 
              />
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-10">
          {!isFeedbackStep ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight border-b border-white/5 pb-6">
                 {currentPhase.title}
              </h2>

              <div className="space-y-8">
                {currentPhase.mcqs.map((mcq, idx) => (
                  <div key={mcq.id} className="bg-slate-800/40 p-6 sm:p-8 rounded-2xl border border-white/5 shadow-inner">
                    <h3 className="text-lg font-medium text-slate-200 mb-6 leading-relaxed">
                       <span className="text-indigo-400 font-bold mr-2">{idx + 1}.</span> 
                       {mcq.question}
                    </h3>
                    <div className="space-y-3">
                      {mcq.options.map((opt) => {
                        const isSelected = answers[currentPhase.id][mcq.id] === opt.value;
                        return (
                          <label 
                            key={opt.value} 
                            className={`flex items-start p-4 sm:p-5 rounded-xl cursor-pointer transition-all duration-200 border ${
                               isSelected 
                               ? 'bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                               : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-center h-5">
                               <input
                                 type="radio"
                                 name={`${currentPhase.id}-${mcq.id}`}
                                 value={opt.value}
                                 checked={isSelected}
                                 onChange={(e) => handleMcqChange(currentPhase.id, mcq.id, e.target.value)}
                                 className="w-4 h-4 text-indigo-500 bg-slate-900 border-white/20 focus:ring-indigo-500 focus:ring-offset-slate-900"
                               />
                            </div>
                            <span className={`ml-4 text-sm sm:text-base leading-snug ${isSelected ? 'text-indigo-200' : 'text-slate-300'}`}>
                               {opt.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Scenario Phase */}
                <div className="bg-amber-900/10 p-6 sm:p-8 rounded-2xl border border-amber-500/20 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                       <AlertCircle className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-amber-400 tracking-tight">Scenario Evaluation</h3>
                  </div>
                  <p className="text-amber-200/80 font-medium mb-6 leading-relaxed text-sm sm:text-base">{currentPhase.scenario}</p>
                  
                  <textarea
                    rows={5}
                    placeholder="Describe your steps and reasoning clearly..."
                    value={answers[currentPhase.id].openEnded}
                    onChange={(e) => handleOpenEndedChange(currentPhase.id, e.target.value)}
                    className="w-full p-5 rounded-xl bg-slate-950/50 border border-white/10 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none text-slate-200 placeholder-slate-500/70 transition-all resize-y"
                  />
                  <div className="mt-3 text-right">
                     <span className={`text-xs font-semibold ${answers[currentPhase.id].openEnded.trim().length > 10 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {answers[currentPhase.id].openEnded.trim().length > 10 ? 'Ready' : 'Requires descriptive answer'}
                     </span>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-end border-t border-white/5">
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!canProceedPhase}
                  className="group relative overflow-hidden bg-indigo-600 disabled:bg-slate-800 text-white px-8 py-4 rounded-xl font-semibold flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)]"
                >
                  <span className="relative z-10 flex items-center">
                     {isLastPhase ? "Proceed to Final Step" : "Next Phase"} 
                     <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {!(!canProceedPhase) && <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />}
                </button>
              </div>
            </div>
          ) : (
            // Feedback Step
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-indigo-500/5 p-8 sm:p-10 rounded-2xl border border-indigo-500/20 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                
                <h2 className="relative z-10 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-200 mb-4 tracking-tight">Qualitative Feedback</h2>
                <p className="relative z-10 text-indigo-300/80 mb-8 max-w-lg mx-auto leading-relaxed text-sm sm:text-base">
                   Before you submit, please share your honest friction points below. This exact feedback is analyzed by AI to help leadership adapt the workflow.
                </p>
                
                <div className="relative z-10 text-left bg-slate-900/80 p-6 sm:p-8 rounded-2xl border border-white/5 shadow-inner">
                  <h3 className="text-lg font-medium text-slate-200 mb-4">What is slowing you down the most with these AI agents right now?</h3>
                  <textarea
                    rows={6}
                    placeholder="e.g. Claude Opus takes too long to review, or the strict 200 LOC chunk size feels arbitrary for pure boilerplate..."
                    value={frictionFeedback}
                    onChange={(e) => setFrictionFeedback(e.target.value)}
                    className="w-full p-5 rounded-xl bg-slate-950/80 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-200 placeholder-slate-500/70 transition-all resize-y"
                  />
                </div>
              </div>

              <div className="pt-8 flex justify-between items-center border-t border-white/5">
                <button 
                  onClick={() => setCurrentStep(4)} 
                  className="text-slate-400 hover:text-white font-medium px-4 py-2 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="group relative overflow-hidden bg-emerald-600 disabled:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold flex items-center min-w-[220px] justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-3" /> Grading with AI...</>
                  ) : (
                    <span className="relative z-10 flex items-center">
                       Submit Assessment
                       <CheckCircle2 className="w-5 h-5 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </span>
                  )}
                  {(!(!canSubmit || isSubmitting)) && <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
