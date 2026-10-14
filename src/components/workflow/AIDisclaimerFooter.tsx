import { cn } from "../../utils/cn";
import TextLink from "../TextLink";

/** "Please use AI responsibly. Never share PII." (AIDisclaimerFooter.tsx). */
export default function AIDisclaimerFooter({ muted = false }: { muted?: boolean }) {
  return (
    <div className="flex items-center gap-1.5" data-testid="ai-disclaimer-footer">
      {!muted && <span className="hero-shield-exclamation h-3.5 w-3.5 shrink-0 text-yellow-500" />}
      <span className={cn("text-xs", muted ? "text-gray-400" : "font-medium text-gray-600")}>
        Please use AI responsibly. Never share PII.{" "}
        <TextLink
          variant="plain"
          to="https://www.openfn.org/ai"
          external
          className={cn("underline hover:text-gray-900", muted && "hover:text-gray-500")}
        >
          Learn more.
        </TextLink>
      </span>
    </div>
  );
}
