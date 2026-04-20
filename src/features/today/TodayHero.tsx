interface TodayHeroProps {
  cycleDay: number | null;
  phaseSentence: string;
  learningNote: string | null;
}

export function TodayHero({
  cycleDay,
  phaseSentence,
  learningNote,
}: TodayHeroProps) {
  return (
    <header className="today-hero">
      <p className="today-hero__eyebrow">Cycle today</p>
      <h1 className="today-screen__day">Day {cycleDay ?? "--"}</h1>
      <p className="today-screen__lede">{phaseSentence}</p>
      {learningNote ? <p className="today-hero__aside">{learningNote}</p> : null}
    </header>
  );
}
