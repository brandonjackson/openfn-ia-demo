import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useHandbook, useHandbookFiles, useHandbookSaves } from "../api/handbook";
import { combine } from "../api/status";
import HandbookPage from "./HandbookPage";
import { pageFrame } from "../app/page-frame";

/**
 * Feeds the Handbook from the demo's handbook routes: the article, which
 * saves when edited, and its files, which save as they're added and removed.
 * Anyone in the organisation changes them; anyone else reads.
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
          data={{
            pageType: "handbook",
            sections: handbook!.sections,
            updatedAt: handbook!.updatedAt,
            updatedBy: handbook!.updatedBy,
            files,
            capacityBytes: handbook!.capacityBytes,
          }}
          onSaveArticle={handbook!.canEdit ? saves.saveArticle : undefined}
          onUploadFiles={handbook!.canEdit ? saves.upload : undefined}
          onRemoveFile={handbook!.canEdit ? saves.remove : undefined}
        />
      )}
    </Loaded>
  );
}
