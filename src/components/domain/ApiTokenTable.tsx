import { Trash2 } from "lucide-react";
import type { ApiToken } from "../../model/account";
import DataTable from "../primitives/DataTable";
import type { DataTableColumn } from "../primitives/DataTable";
import IconButton from "../primitives/IconButton";
import Text from "../primitives/Text";

interface Props {
  tokens: ApiToken[];
  /** Asks to delete a token. Left out, there's no delete button. */
  onDelete?: (token: ApiToken) => void;
}

/**
 * Your personal access tokens, masked down to their last four characters,
 * with when each was made and last used, and a button to delete it.
 */
export default function ApiTokenTable({ tokens, onDelete }: Props) {
  const columns: DataTableColumn<ApiToken>[] = [
    {
      key: "token",
      header: "Token",
      render: (t) => (
        <Text tone="strong" mono>
          ••••••••••••{t.suffix}
        </Text>
      ),
    },
    { key: "created", header: "Created on", render: (t) => t.createdAt },
    { key: "last-used", header: "Last used", render: (t) => t.lastUsedAt ?? <Text tone="subtle">Never used</Text> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (t) =>
        onDelete && <IconButton icon={Trash2} label={`Delete token ending ${t.suffix}`} onClick={() => onDelete(t)} />,
    },
  ];

  return <DataTable columns={columns} rows={tokens} getRowKey={(t) => t.id} emptyMessage="No personal access tokens." />;
}
