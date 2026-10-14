import { useState } from "react";
import Alert from "../Alert";
import Button from "../Button";
import { Radio, Select } from "../Inputs";
import SectionHeader from "../SectionHeader";
import SandboxSettingsBanner from "./SandboxSettingsBanner";
import { linkClass } from "./classes";
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

const Divider = () => (
  <div className="inset-0 flex items-center" aria-hidden="true">
    <div className="w-full border-t border-gray-300" />
  </div>
);

/**
 * The Data Storage tab (`#data-storage`, settings.html.heex:862-1053):
 * history retention, the input/output storage policy, and the dataclip
 * retention period. Save keeps the values locally; Cancel resets them.
 */
export default function DataStoragePanel({ initial, periods, canEditDataRetention, sandbox = false }: Props) {
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
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
      <div className="bg-white p-4 rounded-md">
        <form
          id="retention-settings-form"
          onSubmit={(e) => {
            e.preventDefault();
            const next = eraseAll ? { ...form, dataclipRetentionPeriod: null } : form;
            setSaved(next);
            setForm(next);
          }}
        >
          <div className="space-y-6">
            <div>
              <div className="text-black text-sm">
                <div className="font-medium">History Retention Period</div>
                <div className="block mt-1 mb-3">
                  Select how long your run history is stored in OpenFn before being removed from the servers.
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://docs.openfn.org/documentation/manage-projects/retention-periods"
                    className={cn(linkClass, "ml-1")}
                  >
                    Learn more
                  </a>
                  <br /> This includes all Work Orders, Runs, and Logs.
                </div>
              </div>
              <div className="flex gap-4 items-center">
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
                <div className="text-xs">
                  <span />
                </div>
              </div>
            </div>
            <Divider />
            <div>
              <div className="text-black text-sm">
                <div className="font-medium">Input/Output Data Storage Policy</div>
                <div className="block mt-1 mb-3">
                  The input and output data associated with workflow runs and channel requests is useful for debugging.
                  However it can contain sensitive PII. Should OpenFn store this data?
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://docs.openfn.org/documentation/manage-projects/io-data-storage"
                    className={cn(linkClass, "ml-1")}
                  >
                    Learn more
                  </a>
                </div>
              </div>
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
                <Alert type="warning" header="Heads Up!" className="mt-2">
                  <p>
                    When enabled, you will no longer be able to retry workflow runs, and channel request/response
                    payloads will not be stored.
                  </p>
                </Alert>
              )}
            </div>
            <Divider />
            <div>
              <div className={cn("text-black text-sm", (noHistory || eraseAll) && "text-black/30")}>
                <div className="font-medium">Input/Output Data Retention Period</div>
                <div className="block mt-1 mb-3">
                  Select how long input/output data is stored. Once input/output data is removed for a given run, you
                  will no longer be able to retry that run.
                </div>
              </div>
              <div className="flex space-y-2">
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
              </div>
            </div>
            <div className="mt-4">
              <Button
                theme="secondary"
                className="mr-1"
                disabled={!canEditDataRetention}
                onClick={() => setForm(saved)}
              >
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
          </div>
        </form>
      </div>
    </>
  );
}
