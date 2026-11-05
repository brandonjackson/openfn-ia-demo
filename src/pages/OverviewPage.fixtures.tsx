import { overviewData } from "../fixtures/overview";
import OverviewPage from "./OverviewPage";

/** Feeds Overview, the home page, from fixtures. It sits at "/", outside the IA tree, so it takes no route. */
export default function OverviewPageFixtures() {
  return <OverviewPage data={overviewData} />;
}
