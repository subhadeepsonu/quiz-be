/**
 * Scoring utilities for submissions. Mirrors frontend result-utils logic
 * so that totalScore and correctness match the dashboard/analysis pages.
 */

function parseSelectedOptions(selectedOptions: string[]): unknown {
  if (!selectedOptions || selectedOptions.length === 0) {
    return null;
  }
  const first = selectedOptions[0];
  if (first && (first.startsWith("{") || first.startsWith("["))) {
    try {
      return JSON.parse(first) as unknown;
    } catch {
      return selectedOptions;
    }
  }
  return selectedOptions;
}

function checkFillInBlankCorrectness(
  selectedOptions: string[],
  blankOptions: Record<string, { correct: string; options: string[] }>
): boolean {
  const parsed = parseSelectedOptions(selectedOptions);
  if (!parsed || !blankOptions) return false;
  let answers: string[] = [];
  if (typeof parsed === "object" && !Array.isArray(parsed)) {
    const keys = Object.keys(parsed as Record<string, unknown>);
    if (keys.length > 0 && Array.isArray((parsed as Record<string, unknown>)[keys[0]])) {
      answers = (parsed as Record<string, string[]>)[keys[0]];
    }
  } else if (Array.isArray(parsed)) {
    answers = parsed as string[];
  }
  return Object.entries(blankOptions).every(([, blankData], index) => (answers[index] || "") === blankData.correct);
}

function checkTwoPartAnalysisCorrectness(
  selectedOptions: string[],
  correctPart1Option: number | undefined,
  correctPart2Option: number | undefined
): boolean {
  const parsed = parseSelectedOptions(selectedOptions) as { part1?: number; part2?: number } | null;
  if (!parsed || typeof parsed !== "object") return false;
  const selectedPart1 = parsed.part1 ?? null;
  const selectedPart2 = parsed.part2 ?? null;
  return selectedPart1 === correctPart1Option && selectedPart2 === correctPart2Option;
}

function checkTableWithOptionsCorrectness(selectedOptions: string[], tableData: any): boolean {
  const parsed = parseSelectedOptions(selectedOptions) as Record<string, unknown> | null;
  if (!parsed || !tableData?.questions) return false;
  const questions = tableData.questions as any[];
  return questions.every((q: any, index: number) => {
    const qKey = `q${index}`;
    const selected = parsed[qKey];
    if (q.type === "singleCorrect") return selected === q.correctOption;
    if (q.type === "2PA") {
      const sel = selected as { part1?: number; part2?: number } | undefined;
      return sel?.part1 === q.correctPart1Option && sel?.part2 === q.correctPart2Option;
    }
    if (q.type === "multiBoolean") {
      if (!q.subQuestions || !selected) return false;
      return (q.subQuestions as any[]).every((subQ: any, subIdx: number) => (selected as any)[`sub${subIdx}`] === subQ.correct);
    }
    return false;
  });
}

function checkCaseStudyCorrectness(selectedOptions: string[], caseStudyData: any): boolean {
  const parsed = parseSelectedOptions(selectedOptions) as Record<string, unknown> | null;
  if (!parsed || !caseStudyData?.questions) return false;
  const questions = caseStudyData.questions as any[];
  return questions.every((q: any, index: number) => {
    const qKey = `q${index}`;
    const selected = parsed[qKey];
    if (q.type === "singleCorrect") return selected === q.correctOption;
    if (q.type === "multipleCorrect") {
      const selectedSet = new Set(Array.isArray(selected) ? selected : []);
      const correctSet = new Set(q.correctOptions || []);
      return selectedSet.size === correctSet.size && [...selectedSet].every((opt) => correctSet.has(opt));
    }
    if (q.type === "2PA") {
      const sel = selected as { part1?: number; part2?: number } | undefined;
      return sel?.part1 === q.correctPart1Option && sel?.part2 === q.correctPart2Option;
    }
    if (q.type === "multiBoolean") {
      if (!q.subQuestions || !selected) return false;
      return (q.subQuestions as any[]).every((subQ: any, subIdx: number) => (selected as any)[`sub${subIdx}`] === subQ.correct);
    }
    return false;
  });
}

/** Check if a single answer is correct (same logic as frontend checkAnswerCorrectness). */
export function checkAnswerCorrectness(answer: { question: any; selectedOptions: string[] }): boolean {
  const question = answer.question;
  const selectedOptions = answer.selectedOptions || [];

  switch (question.questionType) {
    case "fillInBlankDropdown":
      return question.blankOptions ? checkFillInBlankCorrectness(selectedOptions, question.blankOptions) : false;

    case "TWO_PART_ANALYSIS":
      return question.twoPartAnalysisData
        ? checkTwoPartAnalysisCorrectness(
            selectedOptions,
            question.twoPartAnalysisData.correctPart1Option,
            question.twoPartAnalysisData.correctPart2Option
          )
        : false;

    case "tableWithOptions":
      if (question.tableData) return checkTableWithOptionsCorrectness(selectedOptions, question.tableData);
      const selected = [...selectedOptions].sort().join(",");
      const correct = [...(question.correctOptions || [])].sort().join(",");
      return selected === correct && selected.length > 0;

    case "caseStudy":
      if (question.caseStudyData) return checkCaseStudyCorrectness(selectedOptions, question.caseStudyData);
      const selectedCS = [...selectedOptions].sort().join(",");
      const correctCS = [...(question.correctOptions || [])].sort().join(",");
      return selectedCS === correctCS && selectedCS.length > 0;

    default: {
      const selectedSorted = [...selectedOptions].sort().join(",");
      const correctSorted = [...(question.correctOptions || [])].sort().join(",");
      return selectedSorted === correctSorted && selectedSorted.length > 0;
    }
  }
}

/** Total score formula: 205 + 20*(avgSectionScore - 60), rounded to nearest 10+5, clamped 205–805. */
export function computeTotalScore(avgSectionScore: number): number {
  const raw = 205 + 20 * (avgSectionScore - 60);
  const rounded = Math.round(raw / 10) * 10 + 5;
  return Math.min(805, Math.max(205, rounded));
}

export interface SubmissionScoreResult {
  totalScore: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpentSec: number;
}

/**
 * Compute totalScore and aggregates from submission answers.
 * Uses same accuracy -> avgSectionScore -> totalScore logic as frontend.
 */
export function computeSubmissionScores(answers: Array<{ question: any; selectedOptions: string[]; timeTakenSec: number | null }>): SubmissionScoreResult | null {
  if (!answers.length) return null;

  let correct = 0;
  let incorrect = 0;
  let timeSpentSec = 0;

  for (const a of answers) {
    const isCorrect = checkAnswerCorrectness({ question: a.question, selectedOptions: a.selectedOptions });
    if (isCorrect) correct += 1;
    else incorrect += 1;
    timeSpentSec += a.timeTakenSec != null ? Number(a.timeTakenSec) : 0;
  }

  const total = correct + incorrect;
  const accuracy = total > 0 ? (correct / total) * 100 : 0;
  const avgSectionScore = 60 + (accuracy / 100) * 30;
  const totalScore = computeTotalScore(avgSectionScore);

  return {
    totalScore,
    correctAnswers: correct,
    incorrectAnswers: incorrect,
    timeSpentSec,
  };
}
