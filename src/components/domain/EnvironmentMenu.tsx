import { FlaskConical, Layers, Lock } from "lucide-react";
import type { ProjectComponent } from "../../model/projects";
import { componentTypeIcons } from "../../model/component-types";
import Popover from "../primitives/Popover";
import IconButton from "../primitives/IconButton";
import NavItem from "../primitives/NavItem";
import Stack from "../primitives/Stack";
import Inline from "../primitives/Inline";
import Text from "../primitives/Text";
import Badge from "../primitives/Badge";
import EnvironmentBadge from "./EnvironmentBadge";

interface Props {
  /** Where you're working: "main" or a sandbox's name. */
  sandbox: string;
  /** The environment its credentials load their values from, e.g. "production". Left out while it isn't known. */
  environment?: string;
  /** The project components the workflow uses. */
  components?: ProjectComponent[];
  /** Opens a component, e.g. in the explorer. Without it the components are listed, not links. */
  onOpenComponent?: (componentId: string) => void;
  /** Start open (useful for stories). */
  defaultOpen?: boolean;
}

/**
 * The editor's environment icon, just left of Run, and what it opens: where
 * you're working (the sandbox, or main), the environment its credentials load
 * from, and the components the workflow has to hand, such as collections,
 * each opening in the explorer. A glance at what a run here will touch.
 */
export default function EnvironmentMenu({ sandbox, environment, components = [], onOpenComponent, defaultOpen = false }: Props) {
  const onMain = sandbox === "main";

  return (
    <Popover
      ariaLabel="Environment"
      align="right"
      widthClass="w-80"
      defaultOpen={defaultOpen}
      trigger={({ open, toggle }) => (
        <IconButton icon={Layers} size="md" label="Environment" active={open} aria-expanded={open} aria-haspopup="dialog" onClick={toggle} />
      )}
    >
      {(close) => (
        <Stack gap="md">
          <Stack gap="xs">
            <Text tone="muted" size="xs">
              {onMain ? "Project" : "Sandbox"}
            </Text>
            <Inline gap="sm">
              <Text tone="strong" mono={!onMain} truncate>
                {sandbox}
              </Text>
              {onMain ? <Badge label="Read-only" shape="tag" icon={Lock} /> : <Badge label="Sandbox" shape="tag" icon={FlaskConical} tone="yellow" />}
            </Inline>
          </Stack>
          <Stack gap="xs">
            <Text tone="muted" size="xs">
              Environment
            </Text>
            {environment ? (
              <Inline gap="sm">
                <EnvironmentBadge environment={environment} />
                <Text tone="muted" size="xs">
                  Credentials use their {environment} values
                </Text>
              </Inline>
            ) : (
              <Text tone="muted">Not set</Text>
            )}
          </Stack>
          <Stack gap="xs">
            <Text tone="muted" size="xs">
              Active components
            </Text>
            {components.length === 0 ? (
              <Text tone="muted" block>
                This workflow uses no components.
              </Text>
            ) : (
              components.map((c) => (
                <NavItem
                  key={c.id}
                  variant="menu"
                  label={c.name}
                  icon={componentTypeIcons[c.type]}
                  trailing={<Badge label={c.type} shape="tag" />}
                  onClick={
                    onOpenComponent
                      ? () => {
                          close();
                          onOpenComponent(c.id);
                        }
                      : undefined
                  }
                />
              ))
            )}
          </Stack>
        </Stack>
      )}
    </Popover>
  );
}
