import type { ReactNode } from "react";
import type { LoadStatus } from "../api/status";
import LoadingState from "../components/primitives/LoadingState";
import Callout from "../components/primitives/Callout";
import NotFoundPage from "../pages/NotFoundPage";

/**
 * What a .query wrapper renders around its page: a spinner while the data
 * loads, Not Found when the record isn't there or isn't yours to see (the
 * API answers 403 for both, so a non-member can't learn what exists), the
 * server's message for any other failure, and otherwise the page. The page
 * is a function so it's only built once its data is there.
 */
export default function Loaded({ status, path, children }: { status: LoadStatus; path: string; children: () => ReactNode }) {
  switch (status.state) {
    case "loading":
      return <LoadingState />;
    case "notFound":
    case "forbidden":
      return <NotFoundPage path={path} reason="data" />;
    case "error":
      return (
        <Callout variant="danger" title="This page couldn't load">
          {status.message}
        </Callout>
      );
    default:
      return <>{children()}</>;
  }
}
