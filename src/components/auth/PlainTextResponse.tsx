/**
 * A bare text/plain response as the browser shows it. Lightning answers
 * blocked routes (e.g. /users/register with signup off) this way, with no
 * layout at all.
 */
export default function PlainTextResponse({ children }: { children: string }) {
  return (
    <div className="fixed inset-0 z-[200] overflow-auto bg-white p-2">
      <pre className="m-0 text-black font-mono text-[13px] leading-normal whitespace-pre-wrap break-words">{children}</pre>
    </div>
  );
}
