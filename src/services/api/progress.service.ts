type ProgressRecord = {
  completedCourses: number;
  hoursLearned: number;
  quizAverage: number;
  streakDays: number;
};

const progress: ProgressRecord = {
  completedCourses: 12,
  hoursLearned: 148,
  quizAverage: 92,
  streakDays: 14,
};

export async function getProgressSummary() {
  return new Promise<ProgressRecord>((resolve) => {
    setTimeout(() => resolve(progress), 140);
  });
}
