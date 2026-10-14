import Alert from "../Alert";
import CopyButton from "../CopyButton";
import { TextInput } from "../Inputs";

/**
 * The banner shown once after "Generate New Token"
 * (tokens_live/index.html.heex `data-entity="new_token"`).
 */
export default function NewTokenBanner({ token }: { token: string }) {
  return (
    <div data-entity="new_token">
      <Alert type="info" header="Make sure to copy your token now as you will not be able to see it again.">
        <div className="flex items-center gap-2">
          <TextInput id="new_token" value={token} readOnly className="font-mono" fieldClassName="min-w-0 flex-1" />
          <CopyButton id="copy" value={token} />
        </div>
      </Alert>
    </div>
  );
}
