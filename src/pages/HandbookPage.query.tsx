import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useHandbook, useHandbookFiles, useHandbookSaves } from "../api/handbook";
import { combine } from "../api/status";
import { handbookData } from "../fixtures/handbook";
import HandbookPage from "./HandbookPage";
import { pageFrame } from "./route.fixtures";

/**
 * Feeds the Handbook: its files from the demo's handbook routes, where adding
 * and removing them saves, and the article from fixtures (it isn't editable
 * yet). Anyone in the organisation changes the files; anyone else reads.
 */
export default function HandbookPageQuery({ route }: { route: PageRoute }) {
  const { status, handbook } = useHandbook();
  const { status: filesStatus, files } = useHandbookFiles();
  const saves = useHandbookSaves();
  return (
    <Loaded status={combine(status, filesStatus)} path={route.currentPath}>
      {() => (
        <HandbookPage
          {...pageFrame(route)}
          data={{ ...handbookData, files, capacityBytes: handbook!.capacityBytes }}
          onUploadFiles={handbook!.canEdit ? saves.upload : undefined}
          onRemoveFile={handbook!.canEdit ? saves.remove : undefined}
        />
      )}
    </Loaded>
  );
}
