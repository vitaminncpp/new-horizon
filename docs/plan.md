# Learning Platform Implementation Plan

Build the platform in phases so the data model, auth, learner experience, and real-time features stay aligned. The current repo already has Next.js, Prisma, auth basics, Monaco, Socket.IO, and Tailwind 4, so the implementation should build on that stack instead of introducing parallel systems.

## 1. Foundation

- Finalize Prisma migrations from `src/infra/prisma/schema.prisma`.
- Add seed data for roles, sample courses, sections, lessons, quizzes, and coding exercises.
- Introduce environment validation for DB, JWT, and any object storage or email settings.
- Define project conventions: API shape, error format, DTO validation, auth guards, and service boundaries.

## 2. Access Control

- Extend the user model with platform roles such as learner, instructor, and admin.
- Implement session and JWT hardening, plus refresh flow if needed, and protect learner, instructor, and admin routes.
- Add ownership checks so only instructors and admins can create and manage course content.

## 3. Backend Domain Modules

- Create services and API routes for courses, sections, lessons, enrollments, progress, assessments, attempts, coding exercises, and submissions.
- Add list and detail endpoints with filters for published courses, enrolled courses, lesson progression, and learner dashboards.
- Add transactional flows for enrollment, marking lessons complete, submitting assessments, and grading attempts.
- Add audit-friendly timestamps and soft-delete strategy where needed.

## 4. Authoring System

- Build instructor CRUD flows for courses, sections, lessons, content blocks, quizzes, and coding exercises.
- Add lesson ordering, draft and publish workflow, preview mode, and slug management.
- Define a structured lesson editor using Tailwind-only UI and typed content block forms.

## 5. Learner Experience

- Build course catalog, course detail, enrollment flow, lesson player, progress sidebar, and continue-learning dashboard.
- Support lesson types already modeled: article, video, quiz, and coding lab.
- Add completion states, next-lesson progression, and certificate-ready completion logic later if needed.

## 6. Assessment Engine

- Implement question rendering for single choice, multiple choice, short text, and code questions.
- Build attempt lifecycle: start, autosave, submit, score, and review.
- Add passing thresholds, max attempts, and per-question feedback.
- Decide early whether grading is synchronous or queued for heavier code evaluation.

## 7. Coding Lab Experience

- Use Monaco for in-browser coding exercises with starter code, language selection constraints, and run and submit actions.
- Define execution architecture for code evaluation. Prefer an isolated runner service or sandboxed worker, not direct app-server execution.
- Store test results, score, and submission history.
- Add anti-abuse constraints: rate limits, execution timeouts, memory limits, and restricted runtimes.

## 8. Real-Time Collaboration

- Scope Socket.IO usage clearly: live classroom sessions, coding presence, collaborative exercises, or instructor monitoring.
- Start with lightweight real-time features first: presence, lesson activity, and attempt status updates.
- Add collaborative editing only if it is a real requirement, since it materially increases complexity.

## 9. Frontend Architecture

- Organize app routes by role and domain: `(public)`, `(auth)`, `(learner)`, `(instructor)`, `(admin)`.
- Build a reusable component system with Tailwind 4 utilities only.
- Add loading, empty, and error states for all dashboard and course pages.
- Keep the visual system consistent with a defined token layer in CSS variables and Tailwind usage.

## 10. Admin Operations

- Add an admin dashboard for users, courses, enrollments, published status, and moderation.
- Add simple platform analytics: active learners, enrollments, completion rates, and assessment performance.
- Add manual controls for hiding courses, resetting attempts, and managing instructors.

## 11. Quality and Security

- Add unit tests for services, integration tests for API routes, and end-to-end coverage for auth, enrollment, lesson progression, quiz submission, and coding submission.
- Add input validation with Zod across DTOs and route handlers.
- Add authorization tests, rate limiting, secure password handling, and secret management.
- Add logging and error monitoring hooks before production deployment.

## 12. Deployment and Delivery

- Add migration workflow for dev, staging, and prod.
- Add CI for lint, typecheck, Prisma validation, tests, and build.
- Prepare production DB, object storage if needed, and a separate execution environment for coding labs.
- Seed demo content for staging and early user testing.

## Recommended Delivery Order

1. Migrations, roles, and auth guards.
2. Course catalog, enrollment, and lesson reading flow.
3. Instructor authoring CRUD.
4. Progress tracking and learner dashboard.
5. Assessments.
6. Coding lab execution.
7. Real-time features.
8. Admin analytics and polish.

## Critical Decisions To Make Early

- Whether coding execution is handled in-house or delegated to an external sandbox service.
- Whether lessons support only structured blocks or also rich freeform authoring.
- Whether assessments are lesson-bound, course-bound, or both.
- Whether real-time collaboration is a core requirement or a later enhancement.
