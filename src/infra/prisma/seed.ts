import { prisma } from "@/src/infra/prisma/prisma.client";
import courses from "@/src/services/mock/courses.json";
import lessons from "@/src/services/mock/lessons.json";
import users from "@/src/services/mock/users.json";
import { hash } from "@/src/services/token.service";

async function main() {
  await prisma.assessment_answer.deleteMany();
  await prisma.assessment_attempt.deleteMany();
  await prisma.assessment_question.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.coding_submission.deleteMany();
  await prisma.coding_exercise.deleteMany();
  await prisma.lesson_progress.deleteMany();
  await prisma.content_block.deleteMany();
  await prisma.lesson_note.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.section.deleteMany();
  await prisma.course_review.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course_instructor.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user_profile.deleteMany();
  await prisma.user.deleteMany();

  const learner = await prisma.user.create({
    data: {
      name: users[0].name,
      email: users[0].email,
      password: await hash(users[0].password),
      role: "learner",
      profile: {
        create: {
          avatar_url: users[0].avatar,
          major: users[0].major,
          plan: users[0].plan,
          headline: users[0].plan,
        },
      },
    },
  });

  const instructor = await prisma.user.create({
    data: {
      name: "Julian Sterling",
      email: "julian@learnsphere.app",
      password: await hash("Password123!"),
      role: "instructor",
      profile: {
        create: {
          avatar_url:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
          major: "Design Principal",
          plan: "Instructor",
          headline: "Design Principal at Curator Labs & Former Apple Lead",
        },
      },
    },
  });

  for (const course of courses) {
    const createdCourse = await prisma.course.create({
      data: {
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        description: course.description,
        category: course.category,
        level: course.difficulty.toLowerCase() as "beginner" | "intermediate" | "advanced",
        status: "published",
        language: course.language,
        thumbnail_url: course.thumbnail,
        hero_image_url: course.heroImage,
        accent_gradient: course.accent,
        estimated_hours: course.durationHours,
        estimated_minutes: course.durationHours * 60,
        is_featured: course.featured,
        created_by_id: instructor.id,
        published_at: new Date(),
      },
    });

    await prisma.course_instructor.create({
      data: {
        course_id: createdCourse.id,
        instructor_id: instructor.id,
        title: course.instructorTitle,
        is_primary: true,
      },
    });

    if (course.enrolled) {
      await prisma.enrollment.create({
        data: {
          course_id: createdCourse.id,
          user_id: learner.id,
          status: course.progress >= 100 ? "completed" : "active",
          progress_percent: course.progress,
          started_at: new Date(),
          last_accessed_at: new Date(),
        },
      });
    }

    const source = lessons.find((item) => item.courseId === course.id)?.modules ?? [];

    for (const [sectionIndex, module] of source.entries()) {
      const createdSection = await prisma.section.create({
        data: {
          course_id: createdCourse.id,
          title: module.title,
          slug: module.title.toLowerCase().replace(/\s+/g, "-"),
          description: `${module.title} module`,
          position: sectionIndex + 1,
          estimated_minutes: module.total * 15,
        },
      });

      for (const [lessonIndex, item] of module.items.entries()) {
        const createdLesson = await prisma.lesson.create({
          data: {
            section_id: createdSection.id,
            slug: item.title.toLowerCase().replace(/\s+/g, "-"),
            title: item.title,
            summary: `${item.title} summary`,
            lesson_type: item.type === "quiz" ? "quiz" : "video",
            status: "published",
            position: lessonIndex + 1,
            estimated_minutes: 10 + lessonIndex * 5,
            is_preview: lessonIndex === 0,
            video_url: course.heroImage,
            cover_image_url: course.thumbnail,
            transcript: `Transcript for ${item.title}`,
          },
        });

        await prisma.content_block.createMany({
          data: [
            {
              lesson_id: createdLesson.id,
              block_type: "markdown",
              title: "Overview",
              position: 1,
              markdown_content: `# ${item.title}\n\nSeeded lesson content.`,
            },
            {
              lesson_id: createdLesson.id,
              block_type: "callout",
              title: "Key Insight",
              position: 2,
              markdown_content: "This content was generated from the existing UI mock source.",
            },
          ],
        });

        if (course.enrolled) {
          await prisma.lesson_progress.create({
            data: {
              lesson_id: createdLesson.id,
              user_id: learner.id,
              status:
                item.status === "complete"
                  ? "completed"
                  : item.status === "current"
                    ? "in_progress"
                    : "not_started",
              progress_percent:
                item.status === "complete" ? 100 : item.status === "current" ? 45 : 0,
              watch_position_seconds: item.status === "current" ? 320 : 0,
              started_at: new Date(),
              last_viewed_at: new Date(),
              completed_at: item.status === "complete" ? new Date() : null,
            },
          });
        }

        const assessment = await prisma.assessment.create({
          data: {
            course_id: createdCourse.id,
            section_id: createdSection.id,
            lesson_id: createdLesson.id,
            title: `${item.title} Checkpoint`,
            description: `Assessment for ${item.title}`,
            assessment_type: "quiz",
            position: lessonIndex + 1,
            passing_score: 70,
            max_attempts: 3,
            is_published: true,
          },
        });

        await prisma.assessment_question.create({
          data: {
            assessment_id: assessment.id,
            prompt: `What is the main outcome of ${item.title}?`,
            explanation: "Seeded sample question.",
            question_type: "multiple_choice",
            position: 1,
            points: 1,
            options_json: ["Understand the concept", "Ignore the lesson", "Skip the course"],
            correct_answer_json: ["Understand the concept"],
          },
        });

        await prisma.coding_exercise.create({
          data: {
            lesson_id: createdLesson.id,
            title: `${item.title} Practice`,
            slug: `${item.title.toLowerCase().replace(/\s+/g, "-")}-practice`,
            instructions: `Practice exercise for ${item.title}.`,
            language: "typescript",
            difficulty: course.difficulty.toLowerCase(),
            position: 1,
            starter_code: "export function solve() {\n  return true;\n}\n",
            solution_code: "export function solve() {\n  return true;\n}\n",
            test_cases_json: [{ input: [], expected: true }],
          },
        });
      }
    }

    await prisma.course_review.create({
      data: {
        course_id: createdCourse.id,
        user_id: learner.id,
        rating: Math.round(course.rating),
        review: `${course.title} is a strong seeded course.`,
      },
    });
  }
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
