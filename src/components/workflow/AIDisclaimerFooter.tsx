import { cn } from "../../utils/cn";

/** "Please use AI responsibly. Never share PII." (AIDisclaimerFooter.tsx). */
export default function AIDisclaimerFooter({ muted = false }: { muted?: boolean }) {
  return (
    <div className="flex items-center gap-1.5" data-testid="ai-disclaimer-footer">
      {!muted && <span className="hero-shield-exclamation h-3.5 w-3.5 text-amber-500 shrink-0" />}
      <span className={cn("text-[11px]", muted ? "text-gray-400" : "font-medium text-gray-600")}>
        Please use AI responsibly. Never share PII.{" "}
        <a
          href="https://www.openfn.org/ai"
          target="_blank"
          rel="noopener noreferrer"
          className={cn("underline hover:text-gray-900", muted && "hover:text-gray-500")}
        >
          Learn more.
        </a>
      </span>
    </div>
  );
}
