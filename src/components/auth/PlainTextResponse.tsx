/**
 * A bare text/plain response as the browser shows it. Lightning answers
 * blocked routes (e.g. /users/register with signup off) this way, with no
 * layout at all. Routed outside the app shell, so it's just a white page.
 */
export default function PlainTextResponse({ children }: { children: string }) {
  return (
    <div className="min-h-screen bg-white p-2">
      <pre className="m-0 text-black font-mono text-[13px] leading-normal whitespace-pre-wrap break-words">{children}</pre>
    </div>
  );
}
