import { Check } from "lucide-react";
import { triggerTypes, type TriggerType } from "../../model/workflow";
import Modal from "../primitives/Modal";
import NavItem from "../primitives/NavItem";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

/** The kinds a trigger can be changed to, as Lightning offers them, each with what it does. */
const choices: { type: TriggerType; description: string }[] = [
  { type: "webhook", description: "Starts a run for each request sent to its URL." },
  { type: "cron", description: "Starts a run on a schedule you set." },
];

interface Props {
  open: boolean;
  /** The kind the trigger is now, marked as chosen. */
  current: TriggerType;
  onPick: (type: TriggerType) => void;
  onClose: () => void;
}

/**
 * Picking what starts a workflow, the trigger's Change: a webhook or a
 * schedule, as the step's adaptor is picked from its Change. Picking one
 * closes it; a cron starts out every day at midnight, as Lightning's does,
 * and its schedule is set beside it. A webhook that becomes a cron loses its
 * URL and the auth methods that guarded it, which the picker says first.
 */
export default function TriggerTypePicker({ open, current, onPick, onClose }: Props) {
  return (
    <Modal open={open} title="Change trigger type" onClose={onClose} widthClass="max-w-md">
      <Stack gap="md">
        <Stack gap="xs" label="Trigger types">
          {choices.map(({ type, description }) => (
            <NavItem
              key={type}
              variant="tree"
              icon={triggerTypes[type].icon}
              label={triggerTypes[type].label}
              description={description}
              active={type === current}
              trailing={type === current ? <Check size={14} aria-label="Current" /> : undefined}
              onClick={() => {
                if (type !== current) onPick(type);
                onClose();
              }}
            />
          ))}
        </Stack>
        {current === "webhook" && (
          <Text size="xs" tone="muted">
            A cron trigger has no URL: requests sent to this one will stop starting runs, and the auth methods guarding it come off.
          </Text>
        )}
      </Stack>
    </Modal>
  );
}
