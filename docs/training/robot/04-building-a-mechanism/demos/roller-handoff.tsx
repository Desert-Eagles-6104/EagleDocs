import React from "react";
import {
  DemoStepList,
  RollerView,
} from "@site/src/components/CommandLifecycleDemo";
import type {
  CommandLifecycleDemoProps,
  DemoStep,
} from "@site/src/components/CommandLifecycleDemo";

type HandoffStep = DemoStep & {
  running: boolean;
  output: string;
  owner: string;
};

const collecting = {
  running: true,
  output: "פלט לכיוון איסוף",
  owner: "פקודת האיסוף שולטת ברולר",
};
const stopped = { running: false, output: "פלט המנוע מבוטל" };
const ejectOwner = "פקודת הפליטה שולטת ברולר";

export const rollerHandoffDemo = {
  title: "איך השליטה עוברת מ־Collect ל־Eject?",
  scenarios: [
    {
      id: "handoff",
      label: "Collect → Eject",
      steps: [
        {
          ...collecting,
          label: "Collect פעילה",
          message: "Collect כבר מפעילה את הרולר בכיוון האיסוף.",
        },
        {
          ...collecting,
          label: "מבקשים להפעיל Eject",
          message: "מבקשים להפעיל Eject. שתי הפקודות דורשות את אותו רולר.",
        },
        {
          ...stopped,
          owner: collecting.owner,
          label: "Collect.end(true)",
          message: "Collect מקבלת בקשת ביטול ומבטלת את פלט האיסוף.",
        },
        {
          ...stopped,
          owner: "הרולר פנוי",
          label: "הרולר מתפנה",
          message: "המתזמן משחרר את הדרישה של Collect לרולר.",
        },
        {
          ...stopped,
          owner: ejectOwner,
          label: "Eject.initialize()",
          message:
            "באותו מחזור המתזמן משייך את הרולר ל־Eject ומתחיל את הפקודה.",
        },
        {
          running: true,
          output: "פלט לכיוון פליטה",
          owner: ejectOwner,
          label: "Eject.execute()",
          message: "Eject שולחת פלט בכיוון הפליטה.",
        },
      ],
    },
  ],
  renderMechanism: (step, playing) => (
    <RollerView
      playing={playing}
      running={step.running}
      output={step.output}
      status={[step.owner]}
    />
  ),
  renderSequence: (_step, visibleSteps) => (
    <DemoStepList steps={visibleSteps} />
  ),
} satisfies CommandLifecycleDemoProps<HandoffStep>;
