import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import { prisma } from "@/src/infra/prisma/prisma.client";

export async function GET(_req: Request, { params }: { params: Promise<{ sectionId: string }> }) {
  try {
    const { sectionId } = await params;
    const item = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        lessons: {
          where: { status: "published" },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!item) {
      throw new Error("Section not found");
    }

    return apiSuccess({ item });
  } catch (error) {
    return apiError(error, 404);
  }
}
