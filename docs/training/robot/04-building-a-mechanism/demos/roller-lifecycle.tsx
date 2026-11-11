import React from "react";
import {
  LifecycleDiagram,
  RollerView,
} from "@site/src/components/CommandLifecycleDemo";
import type {
  CommandLifecycleDemoProps,
  DemoStep,
  LifecycleRoute,
  LifecycleStage,
} from "@site/src/components/CommandLifecycleDemo";

type IntakeStep = DemoStep & {
  stage: LifecycleStage;
  route: LifecycleRoute;
  cycle: number;
  hasControl: boolean;
  held: boolean;
  running: boolean;
  heldMs: number;
  runningMs: number;
};

const cycleMs = 20;
const releaseMs = 500;
const finishMs = 1000;
const timelineMs = 2000;

function labelsFor({ cycle, route }: Pick<IntakeStep, "cycle" | "route">) {
  return {
    create: "פקודת האיסוף נוצרה",
    init: "initialize()",
    cycle: cycle ? `מחזור ${cycle}` : "תחילת מחזור",
    execute: "execute()",
    check: "isFinished()",
    interrupt: "שחרור הכפתור",
    end:
      route === "done"
        ? "end(false)"
        : route === "cancel"
          ? "end(true)"
          : "end(…)",
    free: "הרולר מתפנה",
  };
}

function createIntakeSteps(scenario: "timeout" | "release") {
  let state: IntakeStep = {
    stage: "create",
    label: labelsFor({ cycle: 0, route: "" }).create,
    message: "הבנאי מכין את הפקודה. היא מחכה ללחיצה.",
    cycle: 0,
    route: "",
    hasControl: false,
    held: false,
    running: false,
    heldMs: 0,
    runningMs: 0,
  };
  const steps: [IntakeStep, ...IntakeStep[]] = [state];

  function add(
    stage: LifecycleStage,
    message: string,
    changes: Partial<IntakeStep> = {},
  ) {
    const next = { ...state, ...changes, stage, message };
    const labels = labelsFor(next);
    state = {
      ...next,
      label:
        stage === "check"
          ? `${labels.check} → ${next.route === "done"}`
          : labels[stage],
    };
    steps.push(state);
  }

  function startCycle(ms: number, message: string) {
    add("cycle", message, {
      cycle: ms / cycleMs + 1,
      route: "",
      heldMs: ms,
      runningMs: ms,
    });
  }

  function runCycle(finished: boolean) {
    add(
      "execute",
      state.running ? "הרולר ממשיך להסתובב." : "הרולר מתחיל להסתובב.",
      { running: true },
    );
    add(
      "check",
      finished
        ? "עברה שנייה. ממשיכים לסיום."
        : "עוד לא עברה שנייה. חוזרים לתחילת המחזור הבא.",
      { route: finished ? "done" : "again" },
    );
  }

  add("init", "כפתור האיסוף נלחץ. הפקודה מקבלת את הרולר ומתחילה למדוד זמן.", {
    held: true,
    cycle: 1,
    hasControl: true,
  });
  runCycle(false);
  startCycle(cycleMs, "מתחיל מחזור חדש. אותה פקודת איסוף עדיין פעילה.");
  runCycle(false);

  if (scenario === "timeout") {
    startCycle(finishMs, "אחרי מחזורים חוזרים, כפתור האיסוף עדיין לחוץ.");
    runCycle(true);
  } else {
    add("interrupt", "אחרי חצי שנייה שחרור הכפתור שולח בקשת ביטול.", {
      cycle: releaseMs / cycleMs + 1,
      held: false,
      heldMs: releaseMs,
      runningMs: releaseMs,
      route: "cancel",
    });
  }

  add(
    "end",
    scenario === "timeout"
      ? "האיסוף מסתיים מעצמו והרולר נעצר."
      : "האיסוף נקטע והרולר נעצר.",
    { running: false },
  );
  add("free", "פקודת האיסוף משחררת את השליטה ברולר.", { hasControl: false });

  if (scenario === "timeout") {
    add("free", "אחרי שתי שניות הכפתור משתחרר. הרולר נשאר עצור.", {
      held: false,
      heldMs: timelineMs,
    });
  }

  return steps;
}

export const rollerLifecycleDemo = {
  title: "עוקבים אחרי פקודת האיסוף",
  scenarios: [
    {
      id: "timeout",
      label: "החזקה לשתי שניות",
      steps: createIntakeSteps("timeout"),
    },
    {
      id: "release",
      label: "שחרור אחרי חצי שנייה",
      steps: createIntakeSteps("release"),
    },
  ],
  renderMechanism: (step, playing) => (
    <RollerView
      playing={playing}
      running={step.running}
      output={step.running ? "הרולר מסתובב" : "הרולר עצור"}
      status={[
        step.hasControl ? "פקודת האיסוף שולטת ברולר" : "הרולר פנוי",
        step.held ? "כפתור האיסוף לחוץ" : "כפתור האיסוף משוחרר",
      ]}
      timeline={{
        durationMs: timelineMs,
        input: { label: "כפתור איסוף", elapsedMs: step.heldMs },
        output: { label: "רולר פועל", elapsedMs: step.runningMs },
      }}
    />
  ),
  renderSequence: (step) => (
    <LifecycleDiagram
      stage={step.stage}
      route={step.route}
      labels={labelsFor(step)}
    />
  ),
} satisfies CommandLifecycleDemoProps<IntakeStep>;
