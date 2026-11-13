import type { Meta, StoryObj } from "@storybook/react";
import { Sparkles } from "lucide-react";
import AIAssistantPanel from "./AIAssistantPanel";
import EditorShell from "../patterns/EditorShell";
import { assistantConversations, assistantPlanResult, assistantReply, assistantSuggestions } from "../../fixtures/assistant";
import { sampleRun } from "../../fixtures/runs";
import { testGenerationReply } from "../../model/test-cases";

/** The fake assistant "thinks" this long before answering. */
const REPLY_DELAY_MS = 900;
const later = <T,>(answer: () => T) => new Promise<T>((resolve) => setTimeout(() => resolve(answer()), REPLY_DELAY_MS));

const meta: Meta<typeof AIAssistantPanel> = {
  title: "Domain/AIAssistantPanel",
  component: AIAssistantPanel,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="h-screen">
        <EditorShell toolbar={null} side={<Story />} sideTitle="Assistant" sideIcon={Sparkles} onCloseSide={() => {}}>
          {null}
        </EditorShell>
      </div>
    ),
  ],
  args: {
    conversations: assistantConversations,
    suggestions: assistantSuggestions,
    onSend: (prompt, jobLabel, mode) => later(() => assistantReply(prompt, jobLabel, mode)),
    onCarryOutPlan: (plan) => later(() => assistantPlanResult(plan)),
    onOpenRuns: () => {},
    onAskToMerge: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof AIAssistantPanel>;

/** Opens on the workflow's saved conversations. */
export const Conversations: Story = {};

/** A plan the assistant proposed and carried out, with the result. */
export const PlanAndResult: Story = {
  args: { defaultConversationId: "conv-consent", jobLabel: "Create new citizen in Identity" },
};

/** With a step open and no conversations about it yet, suggestions are offered. */
export const NewStepConversation: Story = {
  args: { jobLabel: "Queue application for retry", runId: sampleRun.runId },
};

export const About: Story = { args: { defaultAboutOpen: true } };

/** Opened from a card's Improve: the step is loaded into the chat input. */
export const ImproveStep: Story = {
  args: {
    jobLabel: "Search for duplicate citizens in Identity",
    reference: { kind: "step", id: "search", label: "Search for duplicate citizens in Identity", adaptor: "http" },
    onClearReference: () => {},
  },
};

/** Opened from Create's Build: the prompt goes out as the first message, and the assistant answers it. */
export const FromCreate: Story = {
  args: {
    conversations: [],
    initialPrompt: "When a birth is registered in OpenCRVS, open a child benefit application in Salesforce.",
  },
};

/**
 * In a sandbox, with no conversations yet: "Generate tests from spec" is
 * offered under the suggestions (and in the ⋮ menu), and the reply lists the
 * tests it wrote, with "Open test cases".
 */
export const GenerateTests: Story = {
  args: {
    conversations: [],
    onGenerateTests: () =>
      later(() => ({
        id: "reply-tests",
        role: "assistant",
        ...testGenerationReply({ created: 1, names: ["Logs never pair a name with a date of birth"], upToDate: 3, notInSpec: 0 }),
      })),
    onOpenTests: () => {},
  },
};
