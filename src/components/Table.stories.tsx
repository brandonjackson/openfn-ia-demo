import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState, Table, Td, Th, Tr } from "./Table";
import Pagination from "./Pagination";
import { users } from "../mock-data/users";
import { fullName } from "../utils/format";

const meta: Meta = { title: "Shared/Table" };
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Table
      header={
        <Tr>
          <Th sortDirection="asc" onSort={() => {}}>
            Name
          </Th>
          <Th>Email</Th>
          <Th>Role</Th>
        </Tr>
      }
      footer={<Pagination pageNumber={1} pageSize={10} totalEntries={users.length} />}
    >
      {users.map((u) => (
        <Tr key={u.id} onClick={() => {}}>
          <Td className="text-gray-900">{fullName(u)}</Td>
          <Td>{u.email}</Td>
          <Td>{u.role}</Td>
        </Tr>
      ))}
    </Table>
  ),
};

export const Empty: Story = {
  render: () => <EmptyState message="No sandboxes found" />,
};

export const EmptyPlain: Story = {
  render: () => <EmptyState variant="plain" message="No channels found." />,
};

export const EmptyWithTitle: Story = {
  render: () => (
    <EmptyState
      variant="plain"
      icon="hero-eye-slash"
      title="No Data Available"
      message="This dataclip's data has been wiped in accordance with the project's data retention policy."
    />
  ),
};

export const EmptyWithAction: Story = {
  render: () => <EmptyState message="No collections yet." buttonText="Create a new collection" onClick={() => {}} />,
};
