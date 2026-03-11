import { motion } from "framer-motion";
import { Link } from "wouter";
import { Flag } from "@/components/flags";
import { cn } from "@/lib/utils";
import { AppLayout } from "./Layout";
import { RACES_2026, SESSIONS } from "@/data";
import type { Race, Session } from "@/model";
import { TrophyIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SessionResults } from "./Race";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};

const item = {
  hidden: { opacity: 0, y: 8, x: 40 },
  show: { opacity: 1, y: 0, x: 0, transition: { duration: 0.3 } },
};

export function RaceWeekend() {
  const nextRace = RACES_2026.find(
    (race) => race.date && new Date(race.date) >= new Date(),
  );
  return (
    <AppLayout headline="Race Calendar">
      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col divide-y divide-border"
      >
        {RACES_2026.map((race) => (
          <RaceRow
            key={race.round}
            race={race}
            isNext={race.round === nextRace?.round}
          />
        ))}
      </motion.ul>
    </AppLayout>
  );
}

function RaceRow({ race, isNext }: { race: Race; isNext: boolean }) {
  const today = new Date();
  const isUpcoming = new Date(race.date) >= today;
  const sessions = SESSIONS.filter(
    (s) => s.circuit_code === race.circuit_code,
  ).sort(
    (a, b) =>
      new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
  );

  const race_session = sessions.find((s) => s.session_type === "Race");

  return (
    <motion.li variants={item}>
      <div className="flex items-center gap-4 px-3 hover:text-muted-foreground transition-colors duration-200 hover:bg-secondary">
        <Link
          to={`/race/${race.circuit_code}`}
          className="flex py-3 items-baseline gap-4 grow"
        >
          <span className="w-6 shrink-0 text-xl md:text-4xl font-thin text-muted-foreground tabular-nums mr-4">
            {race.round.toString().padStart(2, "0")}
          </span>
          <Flag
            className="size-5 md:size-7 border-border scale-95 translate-y-0.5 rounded-full object-cover shadow-sm"
            countryCode={race.country}
          />
          <div
            className={cn("font-medium text-xl md:text-4xl", {
              "text-accent-foreground": isNext,
              "text-muted-foreground": !isUpcoming,
            })}
          >
            {race.name}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate font-thin">
              {race.venue}
            </p>
          </div>
        </Link>
        {!isUpcoming && race_session && (
          <Dialog>
            <DialogTrigger asChild>
              <TrophyIcon className="size-6 hidden md:block text-orange-300 hover:text-orange-400 transition-colors duration-200" />
            </DialogTrigger>
            <DialogContent className="md:max-w-[calc(100%-6rem)] xl:max-w-7xl">
              <SessionResults session={race_session} />
            </DialogContent>
          </Dialog>
        )}
        <span className="shrink-0 text-xl md:text-2xl font-thin text-muted-foreground">
          {dateRange(sessions)}
        </span>
      </div>
    </motion.li>
  );
}

function dateRange(sessions: Session[]): string {
  if (sessions.length === 0) {
    return "—";
  }
  if (sessions.length === 1) {
    return new Date(sessions[0].date_start).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
  const start = new Date(sessions[0].date_start);
  const end = new Date(sessions[sessions.length - 1].date_end);
  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    return `${start.toLocaleDateString("en-US", {
      day: "numeric",
    })} - ${end.toLocaleDateString("en-US", {
      day: "numeric",
    })} ${end.toLocaleDateString("en-US", {
      month: "short",
    })}`;
  }
  return `${start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${end.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  })}`;
}
