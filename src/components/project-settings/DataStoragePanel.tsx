import { useState, type ReactNode } from "react";
import Alert from "../Alert";
import Button from "../Button";
import Card from "../Card";
import Heading from "../Heading";
import { Radio, Select } from "../Inputs";
import SectionHeader from "../SectionHeader";
import TextLink from "../TextLink";
import { useToast } from "../Toast";
import SandboxSettingsBanner from "./SandboxSettingsBanner";
import type { RetentionPolicy } from "../../mock-data/projects";
import { cn } from "../../utils/cn";

interface RetentionSettings {
  historyRetentionPeriod: number | null;
  dataclipRetentionPeriod: number | null;
  retentionPolicy: RetentionPolicy;
}

interface Props {
  initial: RetentionSettings;
  /** Allowed periods in days (the usage limiter can narrow these). */
  periods: number[];
  canEditDataRetention: boolean;
  sandbox?: boolean;
}

const policies: [RetentionPolicy, string][] = [
  ["retain_all", "Retain all input/output data"],
  ["erase_all", "Never retain input/output data (zero-persistence)"],
];

/** One setting: its name, an explanation, then the control. `dimmed` fades the text when it doesn't apply. */
function Setting({ title, dimmed = false, description, children }: { title: string; dimmed?: boolean; description: ReactNode; children: ReactNode }) {
  return (
    <div className={cn("space-y-3 text-sm", dimmed && "text-gray-300")}>
      <div>
        <Heading as="h4" size="sm" className={cn(dimmed && "text-gray-300")}>
          {title}
        </Heading>
        <p className="mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}

/**
 * The Data Storage tab (`#data-storage`, settings.html.heex:862-1053):
 * history retention, the input/output storage policy, and the dataclip
 * retention period. Save keeps the values locally; Cancel resets them.
 */
export default function DataStoragePanel({ initial, periods, canEditDataRetention, sandbox = false }: Props) {
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const toast = useToast();
  const options = periods.map((d) => [`${d} Days`, String(d)] as [string, string]);
  const eraseAll = form.retentionPolicy === "erase_all";
  const noHistory = form.historyRetentionPeriod === null;
  const dataclipDisabled = !canEditDataRetention || noHistory || eraseAll;
  const dataclipError =
    form.dataclipRetentionPeriod !== null &&
    form.historyRetentionPeriod !== null &&
    form.dataclipRetentionPeriod > form.historyRetentionPeriod
      ? "dataclip retention period must be less or equal to the history retention period"
      : null;
  const toNum = (v: string) => (v === "" ? null : Number(v));

  return (
    <>
      <SectionHeader
        title="Data storage"
        subtitle="View or modify data storage settings for this project."
        permissionsSection={canEditDataRetention ? undefined : "data storage settings."}
      />
      {sandbox && <SandboxSettingsBanner variant="local" />}
      <Card>
        <form
          id="retention-settings-form"
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            const next = eraseAll ? { ...form, dataclipRetentionPeriod: null } : form;
            setSaved(next);
            setForm(next);
            toast("Project updated successfully");
          }}
        >
          <Setting
            title="History Retention Period"
            description={
              <>
                Select how long your run history is stored in OpenFn before being removed from the servers.
                <TextLink href="https://docs.openfn.org/documentation/manage-projects/retention-periods" external className="ml-1">
                  Learn more
                </TextLink>
                <br /> This includes all Work Orders, Runs, and Logs.
              </>
            }
          >
            <Select
              id="project_history_retention_period"
              aria-label="History Retention Period"
              prompt="Select Period"
              options={options}
              disabled={!canEditDataRetention || periods.length === 1}
              value={form.historyRetentionPeriod === null ? "" : String(form.historyRetentionPeriod)}
              onChange={(e) => setForm({ ...form, historyRetentionPeriod: toNum(e.target.value) })}
              className="w-auto"
            />
          </Setting>
          <hr className="border-gray-300" />
          <Setting
            title="Input/Output Data Storage Policy"
            description={
              <>
                The input and output data associated with workflow runs and channel requests is useful for debugging.
                However it can contain sensitive PII. Should OpenFn store this data?
                <TextLink href="https://docs.openfn.org/documentation/manage-projects/io-data-storage" external className="ml-1">
                  Learn more
                </TextLink>
              </>
            }
          >
            <div className="space-y-2">
              {policies.map(([value, text]) => (
                <Radio
                  key={value}
                  id={value}
                  name="retention_policy"
                  value={value}
                  label={text}
                  disabled={!canEditDataRetention}
                  checked={form.retentionPolicy === value}
                  onChange={() => setForm({ ...form, retentionPolicy: value })}
                />
              ))}
            </div>
            {form.retentionPolicy !== "retain_all" && (
              <Alert type="warning" header="Heads Up!">
                <p>
                  When enabled, you will no longer be able to retry workflow runs, and channel request/response
                  payloads will not be stored.
                </p>
              </Alert>
            )}
          </Setting>
          <hr className="border-gray-300" />
          <Setting
            title="Input/Output Data Retention Period"
            dimmed={noHistory || eraseAll}
            description="Select how long input/output data is stored. Once input/output data is removed for a given run, you will no longer be able to retry that run."
          >
            <Select
              id="project_dataclip_retention_period"
              aria-label="Input/Output Data Retention Period"
              prompt="Select Period"
              options={options}
              disabled={dataclipDisabled}
              value={form.dataclipRetentionPeriod === null ? "" : String(form.dataclipRetentionPeriod)}
              onChange={(e) => setForm({ ...form, dataclipRetentionPeriod: toNum(e.target.value) })}
              errors={dataclipError ? [dataclipError] : []}
              className="w-auto"
            />
          </Setting>
          <div className="flex gap-1">
            <Button theme="secondary" disabled={!canEditDataRetention} onClick={() => setForm(saved)}>
              Cancel
            </Button>
            <Button
              id="input-output-retention-period-submit-btn"
              type="submit"
              disabled={!!dataclipError || !canEditDataRetention}
            >
              Save
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
