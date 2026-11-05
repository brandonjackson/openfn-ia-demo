import type { PageRoute } from "../app/ia-utils";
import { handbookData } from "../fixtures/handbook";
import HandbookPage from "./HandbookPage";
import { pageFrame } from "./route.fixtures";

/** Feeds the Handbook from fixtures. */
export default function HandbookPageFixtures({ route }: { route: PageRoute }) {
  return <HandbookPage {...pageFrame(route)} data={handbookData} />;
}
