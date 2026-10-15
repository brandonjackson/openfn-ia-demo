import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import MfaCard from "./MfaCard";
import { fakeTotpSecret } from "../../mock-data/profile";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof MfaCard> = { title: "Profile/MfaCard", component: MfaCard, decorators: [withRouter] };
export default meta;
type Story = StoryObj<typeof MfaCard>;

function Stateful({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  return <MfaCard mfaEnabled={on} totpSecret={fakeTotpSecret} onChange={setOn} />;
}

export const Disabled: Story = { render: () => <Stateful initial={false} /> };
export const Enabled: Story = { render: () => <Stateful initial={true} /> };
