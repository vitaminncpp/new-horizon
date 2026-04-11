import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import { prisma } from "@/src/infra/prisma/prisma.client";

export async function GET(_req: Request, { params }: { params: Promise<{ sectionId: string }> }) {
  try {
    const { sectionId } = await params;
    const items = await prisma.lesson.findMany({
      where: {
        section_id: sectionId,
        status: "published",
      },
      orderBy: { position: "asc" },
    });

    return apiSuccess({ items });
  } catch (error) {
    return apiError(error, 404);
  }
}
