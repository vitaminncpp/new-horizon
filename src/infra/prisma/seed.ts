import * as tokenService from "@/src/services/token.service";
import { prisma } from "@/src/infra/prisma/prisma.client";

async function main() {
  const instructorPassword = await tokenService.hash("Instructor@123");
  const learnerPassword = await tokenService.hash("Learner@123");

  const instructor = await prisma.user.upsert({
    where: { email: "instructor@newhorizon.dev" },
    update: {
      name: "New Horizon Instructor",
      password: instructorPassword,
      role: "instructor",
      is_deleted: false,
      deleted_at: null,
    },
    create: {
      email: "instructor@newhorizon.dev",
      name: "New Horizon Instructor",
      password: instructorPassword,
      role: "instructor",
    },
  });

  const learner = await prisma.user.upsert({
    where: { email: "learner@newhorizon.dev" },
    update: {
      name: "New Horizon Learner",
      password: learnerPassword,
      role: "learner",
      is_deleted: false,
      deleted_at: null,
    },
    create: {
      email: "learner@newhorizon.dev",
      name: "New Horizon Learner",
      password: learnerPassword,
      role: "learner",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@newhorizon.dev" },
    update: {
      name: "New Horizon Admin",
      password: instructorPassword,
      role: "admin",
      is_deleted: false,
      deleted_at: null,
    },
    create: {
      email: "admin@newhorizon.dev",
      name: "New Horizon Admin",
      password: instructorPassword,
      role: "admin",
    },
  });

  const course = await prisma.course.upsert({
    where: { slug: "interactive-typescript-foundations" },
    update: {
      creator_id: instructor.id,
      title: "Interactive TypeScript Foundations",
      summary: "Learn TypeScript through guided lessons, quizzes, and coding labs.",
      description:
        "A starter path for learners who want to move from JavaScript basics into strongly typed application development.",
      estimated_minutes: 180,
      level: "beginner",
      status: "published",
      published_at: new Date(),
      sections: {
        deleteMany: {},
        create: [
          {
            title: "Getting Started",
            description: "Set expectations and learn the basic type system.",
            position: 1,
            lessons: {
              create: [
                {
                  title: "Why TypeScript",
                  slug: "why-typescript",
                  description: "Understand where types improve developer experience.",
                  type: "article",
                  position: 1,
                  estimated_minutes: 15,
                  is_preview: true,
                  content_blocks: {
                    create: [
                      {
                        type: "markdown",
                        title: "Overview",
                        position: 1,
                        content: {
                          body: "TypeScript helps teams move faster by catching mistakes earlier and making APIs easier to understand.",
                        },
                      },
                      {
                        type: "code",
                        title: "Example",
                        position: 2,
                        content: {
                          language: "typescript",
                          snippet:
                            "type Learner = { id: string; progress: number };\nconst learner: Learner = { id: '1', progress: 42 };",
                        },
                      },
                    ],
                  },
                },
                {
                  title: "Basic Type Quiz",
                  slug: "basic-type-quiz",
                  description: "Check understanding of primitive and object types.",
                  type: "quiz",
                  position: 2,
                  estimated_minutes: 10,
                },
              ],
            },
          },
          {
            title: "Hands-On Practice",
            description: "Practice type annotations and function signatures.",
            position: 2,
            lessons: {
              create: [
                {
                  title: "Function Typing Lab",
                  slug: "function-typing-lab",
                  description: "Complete a simple coding lab using typed functions.",
                  type: "coding_lab",
                  position: 1,
                  estimated_minutes: 25,
                },
              ],
            },
          },
        ],
      },
      assessments: {
        deleteMany: {},
      },
      enrollments: {
        deleteMany: {
          user_id: learner.id,
        },
      },
    },
    create: {
      creator_id: instructor.id,
      title: "Interactive TypeScript Foundations",
      slug: "interactive-typescript-foundations",
      summary: "Learn TypeScript through guided lessons, quizzes, and coding labs.",
      description:
        "A starter path for learners who want to move from JavaScript basics into strongly typed application development.",
      estimated_minutes: 180,
      level: "beginner",
      status: "published",
      published_at: new Date(),
      sections: {
        create: [
          {
            title: "Getting Started",
            description: "Set expectations and learn the basic type system.",
            position: 1,
            lessons: {
              create: [
                {
                  title: "Why TypeScript",
                  slug: "why-typescript",
                  description: "Understand where types improve developer experience.",
                  type: "article",
                  position: 1,
                  estimated_minutes: 15,
                  is_preview: true,
                  content_blocks: {
                    create: [
                      {
                        type: "markdown",
                        title: "Overview",
                        position: 1,
                        content: {
                          body: "TypeScript helps teams move faster by catching mistakes earlier and making APIs easier to understand.",
                        },
                      },
                      {
                        type: "code",
                        title: "Example",
                        position: 2,
                        content: {
                          language: "typescript",
                          snippet:
                            "type Learner = { id: string; progress: number };\nconst learner: Learner = { id: '1', progress: 42 };",
                        },
                      },
                    ],
                  },
                },
                {
                  title: "Basic Type Quiz",
                  slug: "basic-type-quiz",
                  description: "Check understanding of primitive and object types.",
                  type: "quiz",
                  position: 2,
                  estimated_minutes: 10,
                },
              ],
            },
          },
          {
            title: "Hands-On Practice",
            description: "Practice type annotations and function signatures.",
            position: 2,
            lessons: {
              create: [
                {
                  title: "Function Typing Lab",
                  slug: "function-typing-lab",
                  description: "Complete a simple coding lab using typed functions.",
                  type: "coding_lab",
                  position: 1,
                  estimated_minutes: 25,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const quizLesson = await prisma.lesson.findFirstOrThrow({
    where: {
      slug: "basic-type-quiz",
      section: {
        course_id: course.id,
      },
    },
  });

  const codingLesson = await prisma.lesson.findFirstOrThrow({
    where: {
      slug: "function-typing-lab",
      section: {
        course_id: course.id,
      },
    },
  });

  await prisma.assessment.create({
    data: {
      course_id: course.id,
      lesson_id: quizLesson.id,
      title: "Basic Type Quiz",
      description: "A short formative assessment on primitives, arrays, and object typing.",
      type: "practice",
      passing_score: 70,
      max_attempts: 3,
      is_published: true,
      questions: {
        create: [
          {
            prompt: "Which TypeScript type best represents a list of strings?",
            type: "single_choice",
            position: 1,
            points: 1,
            explanation: "Arrays of strings are represented with string[] or Array<string>.",
            options: {
              create: [
                { label: "A", content: "string[]", position: 1, is_correct: true },
                { label: "B", content: "string", position: 2, is_correct: false },
                { label: "C", content: "{ string }", position: 3, is_correct: false },
              ],
            },
          },
          {
            prompt: "Why does TypeScript help teams in larger codebases?",
            type: "short_text",
            position: 2,
            points: 2,
            explanation:
              "Good answers mention early error detection, clearer contracts, or safer refactoring.",
            correct_text_answer:
              "It catches mistakes earlier and makes contracts easier to understand during development.",
          },
        ],
      },
    },
  });

  await prisma.coding_exercise.create({
    data: {
      lesson_id: codingLesson.id,
      title: "Type a Greeter Function",
      prompt: "Complete the function so it accepts a name string and returns a greeting string.",
      starter_code: "export function greet(name: unknown) {\n  return `Hello, ${name}`;\n}\n",
      solution_code:
        "export function greet(name: string): string {\n  return `Hello, ${name}`;\n}\n",
      language: "typescript",
      max_score: 100,
      test_cases: [
        {
          input: "Ada",
          expected: "Hello, Ada",
          description: "Returns a greeting for a valid string input.",
        },
      ],
    },
  });

  await prisma.course_enrollment.upsert({
    where: {
      course_id_user_id: {
        course_id: course.id,
        user_id: learner.id,
      },
    },
    update: {
      status: "active",
      progress_percent: 0,
      completed_at: null,
      last_accessed_at: new Date(),
    },
    create: {
      course_id: course.id,
      user_id: learner.id,
      status: "active",
      progress_percent: 0,
      last_accessed_at: new Date(),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
