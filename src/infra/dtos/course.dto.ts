import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().trim().min(3).max(255),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: z.string().trim().max(500).optional(),
  description: z.string().trim().optional(),
  thumbnail_url: z.string().url().max(2048).optional(),
  estimated_minutes: z.number().int().positive().max(10000).optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const updateCourseSchema = createCourseSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, "At least one field must be provided");

export type CreateCourseDto = z.infer<typeof createCourseSchema>;
export type UpdateCourseDto = z.infer<typeof updateCourseSchema>;
