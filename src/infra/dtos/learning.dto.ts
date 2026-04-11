export interface SectionDto {
  id: string;
  courseId: string;
  title: string;
  slug: string | null;
  description: string | null;
  position: number;
  estimatedMinutes: number | null;
  lessonCount: number;
}

export interface LessonProgressDto {
  id: string;
  lessonId: string;
  userId: string;
  status: "not_started" | "in_progress" | "completed";
  progressPercent: number;
  watchPositionSeconds: number;
  startedAt: string | null;
  completedAt: string | null;
  lastViewedAt: string | null;
}

export interface ContentBlockDto {
  id: string;
  lessonId: string;
  type: string;
  title: string | null;
  position: number;
  markdownContent: string | null;
  richTextJson: unknown;
  codeLanguage: string | null;
  codeContent: string | null;
  assetUrl: string | null;
  metadataJson: unknown;
}

export interface AssessmentQuestionDto {
  id: string;
  assessmentId: string;
  prompt: string;
  explanation: string | null;
  type: string;
  position: number;
  points: number;
  optionsJson: unknown;
}

export interface AssessmentDto {
  id: string;
  courseId: string;
  sectionId: string | null;
  lessonId: string | null;
  title: string;
  description: string | null;
  type: string;
  position: number;
  passingScore: number;
  maxAttempts: number | null;
  isPublished: boolean;
  questions: AssessmentQuestionDto[];
}

export interface AssessmentAttemptDto {
  id: string;
  assessmentId: string;
  userId: string;
  status: string;
  score: number | null;
  maxScore: number | null;
  startedAt: string;
  submittedAt: string | null;
  gradedAt: string | null;
  feedback: string | null;
  answersJson: unknown;
}

export interface CodingExerciseDto {
  id: string;
  lessonId: string | null;
  title: string;
  slug: string | null;
  instructions: string;
  language: string;
  difficulty: string | null;
  position: number;
  starterCode: string | null;
  testCasesJson: unknown;
}

export interface EnrollmentDto {
  id: string;
  courseId: string;
  userId: string;
  status: string;
  progressPercent: number;
  enrolledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  lastAccessedAt: string | null;
  courseTitle: string;
}

export interface LessonDetailDto {
  id: string;
  sectionId: string;
  courseId: string;
  slug: string | null;
  title: string;
  summary: string | null;
  lessonType: string;
  status: string;
  position: number;
  estimatedMinutes: number | null;
  isPreview: boolean;
  videoUrl: string | null;
  coverImageUrl: string | null;
  transcript: string | null;
  resourcesJson: unknown;
  progress?: LessonProgressDto;
  contentBlocks: ContentBlockDto[];
  assessments: AssessmentDto[];
  codingExercises: CodingExerciseDto[];
}
