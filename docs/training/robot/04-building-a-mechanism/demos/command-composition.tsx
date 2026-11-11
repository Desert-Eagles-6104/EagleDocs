import React from "react";
import type {
  CommandLifecycleDemoProps,
  DemoStep,
} from "@site/src/components/CommandLifecycleDemo";
import styles from "./command-composition.module.css";

type CommandTiming = {
  label: string;
  start: number;
  end: number;
};

type TimingEvent = DemoStep & { time: number };
type TimingStep = TimingEvent & {
  started: boolean;
  groupEnd: number;
  commands: readonly CommandTiming[];
};

const collect = { label: "איסוף", start: 0, end: 1.5 };
const pause = { label: "המתנה", start: collect.end, end: 2 };
const eject = { label: "פליטה", start: pause.end, end: 2.4 };
const roller = { label: "רולר", start: 0, end: 1 };
const wait = { label: "המתנה", start: 0, end: 2 };
const flywheel = { label: "גלגל תנופה", start: 0, end: 3 };
const parallelCommands = [roller, wait, flywheel];
const timelineEnd = flywheel.end;
const ticks = [0, 1, 2, timelineEnd];

const startTogether = {
  time: 0,
  label: "התחלה במקביל",
  message: "הרולר, ההמתנה וגלגל התנופה מתחילים יחד.",
};
const rollerFinishes = {
  time: roller.end,
  label: "שלב האיסוף מסתיים",
  message: "הרולר מפסיק לקבל פלט. גלגל התנופה וההמתנה ממשיכים.",
};

function scenario(
  id: string,
  commands: readonly CommandTiming[],
  events: readonly [TimingEvent, ...TimingEvent[]],
) {
  const groupEnd = events[events.length - 1].time;
  const steps: [TimingStep, ...TimingStep[]] = [
    {
      time: 0,
      label: "לפני ההפעלה",
      message: "השילוב מוכן. עברו לצעד הבא כדי להתחיל.",
      started: false,
      groupEnd,
      commands,
    },
    ...events.map((event) => ({ ...event, started: true, groupEnd, commands })),
  ];
  return { id, label: id, steps };
}

const statusLabels = {
  pending: "טרם התחיל",
  running: "פעיל",
  finished: "הסתיים",
  interrupted: "נקטע",
};

function TimingView({ step }: { step: TimingStep }) {
  const tracks = step.commands.map(({ label, start, end }) => {
    const stop = Math.min(end, step.groupEnd);
    const elapsed = Math.max(0, Math.min(step.time, stop) - start);
    const status =
      !step.started || step.time < start
        ? "pending"
        : step.time < stop
          ? "running"
          : stop < end
            ? "interrupted"
            : "finished";
    return { label, start, end, elapsed, status } as const;
  });
  const percent = (seconds: number) => `${(seconds / timelineEnd) * 100}%`;

  return (
    <div
      className={styles.timeline}
      role="img"
      aria-label={`זמן ${step.time} שניות. ${tracks.map(({ label, status }) => `${label} ${statusLabels[status]}`).join(". ")}.`}
    >
      <strong className={styles.time}>
        <bdi>{step.time}</bdi> שנ׳
      </strong>
      {tracks.map(({ label, start, end, elapsed, status }) => (
        <div key={label} className={styles.row} data-status={status}>
          <div className={styles.rowLabel}>
            <span>{label}</span>
            <span className={styles.status}>{statusLabels[status]}</span>
          </div>
          <div className={styles.track} dir="ltr">
            <span
              className={styles.planned}
              style={{
                insetInlineStart: percent(start),
                inlineSize: percent(end - start),
              }}
            />
            <span
              className={styles.elapsed}
              style={{
                insetInlineStart: percent(start),
                inlineSize: percent(elapsed),
              }}
            />
            <span
              className={styles.cursor}
              style={{ insetInlineStart: percent(step.time) }}
            />
          </div>
        </div>
      ))}
      <div className={styles.axis} dir="ltr" aria-hidden="true">
        {ticks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
    </div>
  );
}

export const commandCompositionDemo = {
  title: "עוקבים אחרי שילוב הפקודות",
  scenarios: [
    scenario(
      "sequence",
      [collect, pause, eject],
      [
        {
          time: collect.start,
          label: "איסוף",
          message: "פקודת האיסוף מתחילה להפעיל את הרולר.",
        },
        {
          time: pause.start,
          label: "המתנה",
          message: "זמן האיסוף נגמר. פלט הרולר מתבטל ומתחילה ההמתנה.",
        },
        {
          time: eject.start,
          label: "פליטה",
          message: "ההמתנה מסתיימת ופקודת הפליטה מתחילה.",
        },
        {
          time: eject.end,
          label: "הרצף מסתיים",
          message: "זמן הפליטה נגמר והפלט מתבטל.",
        },
      ],
    ),
    scenario("parallel", parallelCommands, [
      startTogether,
      rollerFinishes,
      {
        time: wait.end,
        label: "ההמתנה מסתיימת",
        message: "גלגל התנופה ממשיך לפעול.",
      },
      {
        time: flywheel.end,
        label: "השילוב מסתיים",
        message: "גלגל התנופה מסיים. עכשיו כל שלושת השלבים הסתיימו.",
      },
    ]),
    scenario("race", parallelCommands, [
      startTogether,
      {
        time: roller.end,
        label: "השילוב מסתיים",
        message:
          "שלב האיסוף מסיים ראשון. השילוב קוטע את ההמתנה ואת גלגל התנופה.",
      },
    ]),
    scenario("deadline", parallelCommands, [
      {
        ...startTogether,
        message: "שלוש הפקודות מתחילות יחד. ההמתנה קובעת את רגע הסיום.",
      },
      rollerFinishes,
      {
        time: wait.end,
        label: "השילוב מסתיים",
        message: "סיום ההמתנה מסיים את השילוב וקוטע את גלגל התנופה.",
      },
    ]),
  ],
  renderMechanism: (step) => <TimingView step={step} />,
} satisfies CommandLifecycleDemoProps<TimingStep>;
