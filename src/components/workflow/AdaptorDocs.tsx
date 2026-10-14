import { adaptorFunctions, adaptorShortName, resolveAdaptor, resolvedAdaptorVersion } from "../../mock-data/adaptors";
import TextLink from "../TextLink";

/**
 * The IDE's Docs panel (assets/js/adaptor-docs/components/DocsPanel.tsx):
 * package name and version, links, editor tips, and the adaptor's
 * operations as expandable signatures.
 */
export default function AdaptorDocs({ adaptor }: { adaptor: string }) {
  const { package: pkg } = resolveAdaptor(adaptor);
  const short = adaptorShortName(adaptor);
  const version = resolvedAdaptorVersion(adaptor);
  const fns = adaptorFunctions(adaptor);
  return (
    <div className="block w-full overflow-auto ml-1">
      <h1 className="text-lg font-bold text-secondary-700 mb-2 flex justify-between items-center">
        <span>
          {pkg} ({version})
        </span>
      </h1>
      <div className="mb-2 text-sm">
        <div>
          External docs:
          <TextLink className="ml-2" to={`https://docs.openfn.org/adaptors/packages/${short}-docs`} external>
            docs.openfn.org
          </TextLink>
        </div>
        <div>
          Source code:
          <TextLink className="ml-2" to={`https://github.com/OpenFn/adaptors/tree/%40openfn/language-${short}%40${version}/packages/${short}/src`} external>
            github.com/OpenFn/adaptors
          </TextLink>
        </div>
      </div>
      <details className="mb-4">
        <summary className="text-sm cursor-pointer">
          <h3 className="inline">Editor tips & shortcuts</h3>
        </summary>
        <div className="text-sm border-solid border-gray-300 border-l-4 pl-2 mt-2">
          <p className="mb-2">
            Most adaptors provide intelligent code suggestions to the editor. Start typing and press TAB or ENTER to accept a
            suggestion, or ESC to cancel
          </p>
          <ul className="list-disc ml-4">
            <li>Press CTRL+SPACE to show suggestions</li>
            <li>Press CTRL+SPACE again to toggle suggestion details (recommended!)</li>
            <li>Press F1 to show the command menu (not all commands will work!)</li>
          </ul>
        </div>
      </details>
      <h3>Adaptor API</h3>
      <div className="text-sm mb-4">These are the operations available for this adaptor:</div>
      {fns.map((fn) => (
        <details key={fn.name} className="ml-4">
          <summary className="text-sm text-secondary-700 mb-1 cursor-pointer marker:text-slate-600 marker:text-sm whitespace-nowrap hover:bg-sky-50/50">
            {fn.name}({fn.params.join(", ")})
          </summary>
          <div className="block mb-4 pl-4">
            <div className="block text-sm">
              <p>{fn.description}</p>
            </div>
            {fn.example && (
              <section>
                <label className="block text-sm text-secondary-700 mt-2">Example</label>
                <pre className="rounded-md pl-4 pr-8 py-2 mx-4 mt-1 font-mono bg-slate-100 border-2 border-slate-200 text-slate-800 text-xs overflow-x-auto">
                  {fn.example}
                </pre>
              </section>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

/** The Metadata tab (metadata-explorer/Empty.tsx): no adaptor in the demo has magic functions. */
export function AdaptorMetadata({ adaptor }: { adaptor: string }) {
  return (
    <div>
      <p className="block m-2">{`No metadata found for ${resolveAdaptor(adaptor).package}`}</p>
      <p className="block m-2">This adaptor does not support magic functions yet.</p>
    </div>
  );
}
