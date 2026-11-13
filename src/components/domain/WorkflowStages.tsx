import { lifecycleStageLabels, type LifecycleStage, type LifecycleStageId } from "../../model/workflow-lifecycle";
import Card from "../primitives/Card";
import ScrollPane from "../primitives/ScrollPane";
import SectionHeading from "../primitives/SectionHeading";
import StageList from "../primitives/StageList";
import TextLink from "../primitives/TextLink";

/** Somewhere to go for a stage: usually an item in the explorer, named as it's listed there. */
export interface StageLink {
  label: string;
  onOpen: () => void;
}

interface Props {
  /** Each stage and how far along it is, from `lifecycleStages`. */
  stages: LifecycleStage[];
  /** Where each stage is worked on, e.g. Describe's context.md or Monitor's Health; a stage without one has no link. */
  links?: Partial<Record<LifecycleStageId, StageLink>>;
  /** On main, going live is turning the trigger on; in a sandbox it starts with a promotion request. */
  onMain?: boolean;
}

/**
 * The workflow's Overview, which code mode opens on: where the workflow is
 * in its life, from saying what it's for to keeping an eye on it once it's
 * live, as a short checklist. Only the stage you're on says what it asks of
 * you; each links to the place in the explorer where it's done.
 */
export default function WorkflowStages({ stages, links = {}, onMain = false }: Props) {
  const descriptions: Record<LifecycleStageId, string> = {
    describe: "Write down what the workflow is for and when a run counts as done. The assistant reads it too.",
    build: "Add the steps that move the data, one system at a time.",
    test: "Run it with a sample input and check what each step gives back.",
    live: onMain
      ? "Turn its trigger on so it starts runs by itself."
      : "Ask to merge this sandbox into main, then turn the trigger on there.",
    monitor: "It's running. Check its health now and then, and look into any failures.",
  };
  const current = stages.findIndex((s) => s.state === "current");

  return (
    <ScrollPane width="narrow">
      <SectionHeading
        title="Overview"
        description={current >= 0 ? `Stage ${current + 1} of ${stages.length}: ${lifecycleStageLabels[stages[current].id]}` : undefined}
      />
      <Card>
        <StageList
          label="Stages"
          stages={stages.map(({ id, state }) => {
            const link = links[id];
            return {
              id,
              state,
              label: lifecycleStageLabels[id],
              description: descriptions[id],
              action: link && (
                <TextLink variant="action" onClick={link.onOpen}>
                  {link.label}
                </TextLink>
              ),
            };
          })}
        />
      </Card>
    </ScrollPane>
  );
}
