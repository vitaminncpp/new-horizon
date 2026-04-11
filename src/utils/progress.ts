const widthSteps = [
  "w-[0%]",
  "w-[5%]",
  "w-[10%]",
  "w-[15%]",
  "w-[20%]",
  "w-[25%]",
  "w-[30%]",
  "w-[35%]",
  "w-[40%]",
  "w-[45%]",
  "w-[50%]",
  "w-[55%]",
  "w-[60%]",
  "w-[65%]",
  "w-[68%]",
  "w-[70%]",
  "w-[75%]",
  "w-[80%]",
  "w-[85%]",
  "w-[90%]",
  "w-[95%]",
  "w-full",
];

export function progressWidthClass(value: number) {
  const normalized = Math.max(0, Math.min(100, value));
  const exact = widthSteps.find((step) => step === `w-[${normalized}%]`);
  if (exact) {
    return exact;
  }
  const rounded = Math.round(normalized / 5) * 5;
  return widthSteps.find((step) => step === `w-[${rounded}%]`) ?? "w-full";
}
