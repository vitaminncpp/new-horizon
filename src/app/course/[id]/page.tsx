"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader } from "@/src/components/common/loader";
import { PageWrapper } from "@/src/components/layout/page-wrapper";
import { LessonPlayer } from "@/src/components/features/lesson-player";
import { useLearning } from "@/src/context/learning.context";
import { useAuthRedirect } from "@/src/hooks/use-auth-redirect";
import type { Course, CourseLessons } from "@/src/services/mock/types";

export default function CoursePlayerPage() {
  const auth = useAuthRedirect("private");
  const { id } = useParams<{ id: string }>();
  const { getCourse, getLessons } = useLearning();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<CourseLessons | null>(null);

  useEffect(() => {
    void Promise.all([getCourse(id), getLessons(id)]).then(([nextCourse, nextLessons]) => {
      setCourse(nextCourse);
      setLessons(nextLessons);
    });
  }, [getCourse, getLessons, id]);

  if (auth.isLoading || !course || !lessons) {
    return <Loader label="Loading learning workspace" />;
  }

  return (
    <PageWrapper searchPlaceholder="Search lessons...">
      <LessonPlayer course={course} lessons={lessons} />
    </PageWrapper>
  );
}
