import { z } from "zod";

export const createSectionSchema = z.object({
  title: z.string().trim().min(2).max(255),
  description: z.string().trim().optional(),
  position: z.number().int().positive(),
});

export const updateSectionSchema = createSectionSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, "At least one field must be provided");

export const createLessonSchema = z.object({
  title: z.string().trim().min(2).max(255),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().optional(),
  type: z.enum(["video", "article", "live_session", "quiz", "coding_lab"]).default("article"),
  position: z.number().int().positive(),
  estimated_minutes: z.number().int().positive().max(10000).optional(),
  is_preview: z.boolean().optional(),
});

export const updateLessonSchema = createLessonSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, "At least one field must be provided");

export const contentBlockSchema = z.object({
  type: z.enum(["markdown", "code", "embed", "resource"]),
  title: z.string().trim().max(255).optional(),
  content: z.record(z.string(), z.unknown()),
  position: z.number().int().positive(),
});

export const updateContentBlockSchema = contentBlockSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, "At least one field must be provided");

export const lessonProgressSchema = z.object({
  status: z.enum(["not_started", "in_progress", "completed"]),
  progress_percent: z.number().min(0).max(100).optional(),
});

export const createAssessmentSchema = z.object({
  title: z.string().trim().min(2).max(255),
  description: z.string().trim().optional(),
  lesson_id: z.string().uuid().optional(),
  type: z.enum(["practice", "graded", "final_exam"]).default("practice"),
  passing_score: z.number().int().min(0).max(100).optional(),
  max_attempts: z.number().int().positive().max(100).optional(),
  time_limit_mins: z.number().int().positive().max(10000).optional(),
  is_published: z.boolean().optional(),
});

export const updateAssessmentSchema = createAssessmentSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, "At least one field must be provided");

const questionOptionSchema = z.object({
  label: z.string().trim().max(50).optional(),
  content: z.string().trim().min(1),
  position: z.number().int().positive(),
  is_correct: z.boolean().optional(),
});

export const createQuestionSchema = z.object({
  prompt: z.string().trim().min(2),
  type: z.enum(["single_choice", "multiple_choice", "short_text", "code"]),
  position: z.number().int().positive(),
  points: z.number().int().positive().max(1000).optional(),
  explanation: z.string().trim().optional(),
  correct_text_answer: z.string().trim().optional(),
  code_template: z.string().optional(),
  code_language: z.string().trim().max(50).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  options: z.array(questionOptionSchema).optional(),
});

export const updateQuestionSchema = createQuestionSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, "At least one field must be provided");

const answerSchema = z.object({
  question_id: z.string().uuid(),
  selected_option_ids: z.array(z.string().uuid()).optional(),
  text_answer: z.string().optional(),
  code_answer: z.string().optional(),
});

export const submitAssessmentSchema = z.object({
  answers: z.array(answerSchema).min(1),
});

export const gradeAssessmentAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        question_id: z.string().uuid(),
        is_correct: z.boolean().optional(),
        score_awarded: z.number().min(0).max(1000).optional(),
        feedback: z.string().optional(),
      }),
    )
    .min(1),
});

export const createCodingExerciseSchema = z.object({
  title: z.string().trim().min(2).max(255),
  prompt: z.string().trim().min(5),
  starter_code: z.string().optional(),
  solution_code: z.string().optional(),
  language: z.string().trim().min(1).max(50),
  test_cases: z.array(z.record(z.string(), z.unknown())).optional(),
  max_score: z.number().int().positive().max(1000).optional(),
});

export const updateCodingExerciseSchema = createCodingExerciseSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, "At least one field must be provided");

export const createSubmissionSchema = z.object({
  code: z.string().min(1),
  language: z.string().trim().min(1).max(50),
  status: z.enum(["draft", "submitted", "passed", "failed"]).default("submitted"),
  test_results: z.array(z.record(z.string(), z.unknown())).optional(),
  score: z.number().min(0).max(1000).optional(),
});

export type CreateSectionDto = z.infer<typeof createSectionSchema>;
export type UpdateSectionDto = z.infer<typeof updateSectionSchema>;
export type CreateLessonDto = z.infer<typeof createLessonSchema>;
export type UpdateLessonDto = z.infer<typeof updateLessonSchema>;
export type LessonProgressDto = z.infer<typeof lessonProgressSchema>;
export type CreateContentBlockDto = z.infer<typeof contentBlockSchema>;
export type UpdateContentBlockDto = z.infer<typeof updateContentBlockSchema>;
export type CreateAssessmentDto = z.infer<typeof createAssessmentSchema>;
export type UpdateAssessmentDto = z.infer<typeof updateAssessmentSchema>;
export type CreateQuestionDto = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionDto = z.infer<typeof updateQuestionSchema>;
export type SubmitAssessmentDto = z.infer<typeof submitAssessmentSchema>;
export type GradeAssessmentAttemptDto = z.infer<typeof gradeAssessmentAttemptSchema>;
export type CreateCodingExerciseDto = z.infer<typeof createCodingExerciseSchema>;
export type UpdateCodingExerciseDto = z.infer<typeof updateCodingExerciseSchema>;
export type CreateSubmissionDto = z.infer<typeof createSubmissionSchema>;
