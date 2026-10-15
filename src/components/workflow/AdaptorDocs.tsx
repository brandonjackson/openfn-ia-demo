import { adaptorFunctions, adaptorShortName, resolveAdaptor, resolvedAdaptorVersion } from "../../mock-data/adaptors";
import Disclosure from "../Disclosure";
import Heading from "../Heading";
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
    <div className="ml-1 space-y-4 overflow-auto text-sm">
      <div>
        <Heading size="lg" as="h1" className="mb-2 text-gray-700">
          {pkg} ({version})
        </Heading>
        <p>
          External docs:
          <TextLink className="ml-2" to={`https://docs.openfn.org/adaptors/packages/${short}-docs`} external>
            docs.openfn.org
          </TextLink>
        </p>
        <p>
          Source code:
          <TextLink className="ml-2" to={`https://github.com/OpenFn/adaptors/tree/%40openfn/language-${short}%40${version}/packages/${short}/src`} external>
            github.com/OpenFn/adaptors
          </TextLink>
        </p>
      </div>
      <Disclosure variant="inline" defaultOpen={false} title="Editor tips & shortcuts">
        <div className="border-l-4 border-gray-300 pl-2">
          <p className="mb-2">
            Most adaptors provide intelligent code suggestions to the editor. Start typing and press TAB or ENTER to accept a
            suggestion, or ESC to cancel
          </p>
          <ul className="ml-4 list-disc">
            <li>Press CTRL+SPACE to show suggestions</li>
            <li>Press CTRL+SPACE again to toggle suggestion details (recommended!)</li>
            <li>Press F1 to show the command menu (not all commands will work!)</li>
          </ul>
        </div>
      </Disclosure>
      <div>
        <Heading size="sm">Adaptor API</Heading>
        <p>These are the operations available for this adaptor:</p>
      </div>
      <div className="ml-4 space-y-1">
        {fns.map((fn) => (
          <Disclosure key={fn.name} variant="inline" defaultOpen={false} title={`${fn.name}(${fn.params.join(", ")})`}>
            <div className="mb-4 pl-4">
              <p>{fn.description}</p>
              {fn.example && (
                <>
                  <p className="mt-2 text-gray-700">Example</p>
                  <pre className="mx-4 mt-1 overflow-x-auto rounded-md border-2 border-gray-200 bg-gray-100 py-2 pr-8 pl-4 font-mono text-xs text-gray-800">
                    {fn.example}
                  </pre>
                </>
              )}
            </div>
          </Disclosure>
        ))}
      </div>
    </div>
  );
}

/** The Metadata tab (metadata-explorer/Empty.tsx): no adaptor in the demo has magic functions. */
export function AdaptorMetadata({ adaptor }: { adaptor: string }) {
  return (
    <div>
      <p className="m-2">{`No metadata found for ${resolveAdaptor(adaptor).package}`}</p>
      <p className="m-2">This adaptor does not support magic functions yet.</p>
    </div>
  );
}
