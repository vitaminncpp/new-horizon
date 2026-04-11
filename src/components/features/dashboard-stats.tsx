import { Icon } from "@/src/components/common/icon";

type Props = {
  summary: {
    completedCourses: number;
    hoursLearned: number;
    quizAverage: number;
    streakDays: number;
  };
};

const cards = (summary: Props["summary"]) => [
  {
    label: "Courses Completed",
    value: summary.completedCourses,
    icon: "task_alt",
    tone: "bg-primary/10 text-primary",
  },
  {
    label: "Hours Learned",
    value: summary.hoursLearned,
    icon: "schedule",
    tone: "bg-secondary/10 text-secondary",
  },
  {
    label: "Quiz Average",
    value: `${summary.quizAverage}%`,
    icon: "analytics",
    tone: "bg-tertiary/10 text-tertiary",
  },
  {
    label: "Learning Streak",
    value: `${summary.streakDays} Days`,
    icon: "local_fire_department",
    tone: "bg-orange-500/10 text-orange-600",
  },
];

export function DashboardStats({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards(summary).map((card) => (
        <div
          key={card.label}
          className="rounded-xl bg-surface-lowest p-6 transition-transform hover:scale-[1.02] card-shadow dark:card-shadow-dark"
        >
          <div
            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${card.tone}`}
          >
            <Icon name={card.icon} filled className="text-xl" />
          </div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-[0.08em] text-text-secondary">
            {card.label}
          </p>
          <h3 className="text-3xl font-extrabold text-text-primary">{card.value}</h3>
        </div>
      ))}
    </div>
  );
}
