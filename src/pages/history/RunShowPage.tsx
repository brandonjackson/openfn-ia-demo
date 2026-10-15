import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Button from "../../components/Button";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import ProjectBreadcrumbs from "../../components/shell/ProjectBreadcrumbs";
import DateTime from "../../components/DateTime";
import { DetailItem, DetailList } from "../../components/DetailList";
import LogViewer from "../../components/history/LogViewer";
import RunStepList from "../../components/history/RunStepList";
import SnapshotVersionChip from "../../components/history/SnapshotVersionChip";
import StatePill from "../../components/history/StatePill";
import StepDataclipViewer from "../../components/history/StepDataclipViewer";
import Tabs from "../../components/Tabs";
import TextLink from "../../components/TextLink";
import { capitalize, formatElapsed, shortId, uuidOf } from "../../utils/format";
import { findDataclip, findRun, findWorkOrder, stepsOf } from "../../mock-data/history";
import { finalDataclipIdOf, logsOf } from "../../mock-data/history-extra";
import { finalRunStates } from "../../constants";
import { findProject } from "../../mock-data/projects";
import { findUser } from "../../mock-data/users";
import { usePermissions } from "../../session/session";

/** Inventory view `run-show` (RunLive.Show, run_live/show.ex). */
export default function RunShowPage() {
  const { projectId = "", runId } = useParams();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState("log");
  const project = findProject(projectId);
  const { canRunWorkflow, canEditDataRetention } = usePermissions(project);
  const run = findRun(runId);
  const workOrder = run && findWorkOrder(run.workOrderId);
  const steps = run ? stepsOf(run) : [];
  const selectedStepId = searchParams.get("step");
  const selectedStep = steps.find((s) => s.id === selectedStepId);
  const finished = run ? finalRunStates.includes(run.state) : false;
  const activeTab = selectedStep ? tab : "log";

  const header = (
    <Header
      breadcrumbs={
        project && (
          <ProjectBreadcrumbs
            project={project}
            items={[["History", `/projects/${projectId}/history`]]}
            current={
              <>
                Run
                <span className="pl-2 font-light">{runId && shortId(runId)}</span>
                <div className="mx-2" />
                {run && (
                  <SnapshotVersionChip
                    version="latest"
                    tooltip="This run is based on the latest version of this workflow."
                  />
                )}
              </>
            }
          />
        )
      }
    />
  );

  if (!run || !workOrder) {
    return (
      <PageContent header={header}>
        <Centered>there was an error loading the run</Centered>
      </PageContent>
    );
  }

  const finalDataclipId = finalDataclipIdOf(run);
  const startedBy = run.createdBy
    ? findUser(run.createdBy)?.email
    : run.startingTrigger && `${capitalize(run.startingTrigger.toLowerCase())} trigger`;

  return (
    <PageContent header={header}>
      <Centered className="@container/main h-full">
        <div className="flex gap-x-6 @5xl/main:flex-row flex-col h-full">
          <div className="@5xl/main:basis-1/3 flex gap-y-6 @5xl/main:flex-col flex-row">
            <DetailList id={`run-detail-${run.id}`} className="flex-1 @5xl/main:flex-none">
              <DetailItem label="Workflow">
                <TextLink to={`/projects/${projectId}/w/${workOrder.workflowId}?run=${run.id}`} className="text-ellipsis">
                  {workOrder.workflowName}
                </TextLink>
              </DetailItem>
              <DetailItem label="Work Order" mono>
                <TextLink to={`/projects/${projectId}/history?filters[workorder_id]=${workOrder.id}`} title={uuidOf(workOrder.id)}>
                  {shortId(workOrder.id)}
                </TextLink>
              </DetailItem>
              {startedBy && <DetailItem label="Started by">{startedBy}</DetailItem>}
              <DetailItem label="Started">{run.startedAt && <DateTime value={run.startedAt} />}</DetailItem>
              <DetailItem label="Finished">{run.finishedAt && <DateTime value={run.finishedAt} />}</DetailItem>
              <DetailItem label="Final Output" mono>
                {finalDataclipId && (
                  <TextLink to={`/projects/${projectId}/dataclips/${finalDataclipId}/show`}>{shortId(finalDataclipId)}</TextLink>
                )}
              </DetailItem>
              <DetailItem label="Duration">{formatElapsed(run.startedAt, run.finishedAt)}</DetailItem>
              <DetailItem label="Status">
                <StatePill state={run.state} />
              </DetailItem>
              {run.state === "available" && canRunWorkflow && (
                <DetailItem label="Action">
                  <Button size="sm" theme="secondary">
                    Cancel
                  </Button>
                </DetailItem>
              )}
            </DetailList>

            <RunStepList
              run={run}
              steps={steps}
              selectedStepId={selectedStepId}
              projectId={projectId}
              workflowId={workOrder.workflowId}
            />
          </div>
          <div className="@5xl/main:basis-2/3 flex flex-col gap-4 h-full min-h-0">
            <Tabs
              label="Run details"
              active={activeTab}
              onChange={setTab}
              tabs={[
                {
                  id: "log",
                  label: "Log",
                  icon: "hero-command-line",
                },
                {
                  id: "input",
                  disabled: !selectedStep,
                  disabledReason: "A valid step must be selected to view its input",
                  label: "Input",
                  icon: "hero-arrow-down-on-square",
                },
                {
                  id: "output",
                  disabled: !selectedStep,
                  disabledReason: "A valid step (with a readable output) must be selected to view its output",
                  label: "Output",
                  icon: "hero-arrow-up-on-square",
                },
              ]}
            />
            <div className="flex min-h-0 flex-1 flex-col">
              {activeTab === "log" && (
                <div className="flex h-full min-h-96">
                  <LogViewer
                    logs={logsOf(run)}
                    finished={finished}
                    selectedStepId={selectedStepId}
                    waitingMessage={
                      run.state === "available"
                        ? "Waiting for worker"
                        : run.state === "claimed"
                          ? "Creating runtime & installing adaptors"
                          : "Nothing yet"
                    }
                    className="h-full"
                  />
                </div>
              )}
              {activeTab !== "log" && selectedStep && (
                <StepDataclipViewer
                  step={selectedStep}
                  inputOrOutput={activeTab as "input" | "output"}
                  dataclip={findDataclip(
                    activeTab === "input" ? selectedStep.inputDataclipId : (selectedStep.outputDataclipId ?? undefined)
                  )}
                  runFinished={finished}
                  projectId={projectId}
                  canEditDataRetention={canEditDataRetention}
                />
              )}
            </div>
          </div>
        </div>
      </Centered>
    </PageContent>
  );
}
