import { useParams } from "react-router-dom";
import Disclosure from "../../components/Disclosure";
import { DetailItem, DetailList } from "../../components/DetailList";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import Pill from "../../components/Pill";
import ProjectBreadcrumbs from "../../components/shell/ProjectBreadcrumbs";
import {
  BodyViewer,
  HeadersTable,
  ResponseEmpty,
  SectionSizeBadge,
  StatusCodeBadge,
} from "../../components/history/ChannelRequestParts";
import ChannelRequestSummary from "../../components/history/ChannelRequestSummary";
import ChannelTiming from "../../components/history/ChannelTiming";
import WipedDataViewer from "../../components/history/WipedDataViewer";
import { errorCategory, humanizeError } from "../../components/history/channelHelpers";
import { findChannel, findChannelRequest, primaryEvent } from "../../mock-data/channel-requests";
import { historyPermissions } from "../../mock-data/history-extra";
import { findProject } from "../../mock-data/projects";
import { shortUuid } from "../../utils/format";

const sizeNote = (size: number | null) => (size ? <SectionSizeBadge size={size} /> : null);

/** Inventory view `channel-request-show` (ChannelRequestLive.Show, channel_request_live/show.ex). */
export default function ChannelRequestShowPage() {
  const { projectId = "", requestId } = useParams();
  const project = findProject(projectId);
  const request = findChannelRequest(requestId);
  const channel = request && findChannel(request.channelId);
  const event = request && primaryEvent(request);
  const errorCat = event?.errorMessage ? errorCategory(event.errorMessage) : null;

  const header = (
    <Header
      breadcrumbs={
        project && (
          <ProjectBreadcrumbs
            project={project}
            items={[
              ["History", `/projects/${projectId}/history`],
              ["Channels", `/projects/${projectId}/history/channels`],
            ]}
            current={
              <>
                Channel Request
                <span className="pl-1 font-light font-mono">{request && shortUuid(request.requestId)}</span>
              </>
            }
          />
        )
      }
    />
  );

  if (!request || !channel) {
    return (
      <PageContent header={header}>
        <Centered>
          <p className="text-sm text-gray-500">Channel request not found.</p>
        </Centered>
      </PageContent>
    );
  }

  const configChanged = request.snapshot.lockVersion !== channel.lockVersion;
  const showRequestBody = event && !(event.requestBodyPreview == null && event.requestBodySize == null);
  const showResponseBody =
    event && errorCat === null && !(event.responseBodyPreview == null && event.responseBodySize == null);

  return (
    <PageContent header={header}>
      <Centered>
        <div className="space-y-4">
          <ChannelRequestSummary request={request} event={event} channel={channel} />

          {errorCat !== "credential" && <ChannelTiming event={event} />}

          {request.isWiped ? (
            <WipedDataViewer
              dataLabel="request_response"
              projectId={projectId}
              canEditDataRetention={historyPermissions.canEditDataRetention}
            />
          ) : (
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
              <Disclosure
                variant="card"
                id="request-section"
                title="Request"
                padded={false}
                titleRight={event?.requestBodySize ? <SectionSizeBadge size={event.requestBodySize} /> : undefined}
              >
                {event?.requestHeaders && (
                  <Disclosure variant="section" title="Headers">
                    <HeadersTable headers={event.requestHeaders} />
                  </Disclosure>
                )}
                {event && showRequestBody && (
                  <Disclosure variant="section" title="Body" titleRight={sizeNote(event.requestBodySize)}>
                    <BodyViewer
                      preview={event.requestBodyPreview}
                      hash={event.requestBodyHash}
                      size={event.requestBodySize}
                      headers={event.requestHeaders}
                    />
                  </Disclosure>
                )}
              </Disclosure>

              <Disclosure
                variant="card"
                id="response-section"
                title="Response"
                padded={false}
                titleRight={
                  <>
                    {event?.responseStatus && <StatusCodeBadge status={event.responseStatus} />}
                    {event?.responseBodySize ? <SectionSizeBadge size={event.responseBodySize} /> : null}
                  </>
                }
              >
                {errorCat && event?.errorMessage ? (
                  <ResponseEmpty
                    type={errorCat}
                    errorCode={event.errorMessage}
                    humanMessage={humanizeError(event.errorMessage)}
                  />
                ) : (
                  <>
                    {event?.responseHeaders && (
                      <Disclosure variant="section" title="Headers">
                        <HeadersTable headers={event.responseHeaders} />
                      </Disclosure>
                    )}
                    {event && showResponseBody && (
                      <Disclosure variant="section" title="Body" titleRight={sizeNote(event.responseBodySize)}>
                        <BodyViewer
                          preview={event.responseBodyPreview}
                          hash={event.responseBodyHash}
                          size={event.responseBodySize}
                          headers={event.responseHeaders}
                        />
                      </Disclosure>
                    )}
                  </>
                )}
              </Disclosure>
            </div>
          )}

          <Disclosure variant="card" id="context-section" title="Context" defaultOpen={false}>
            <DetailList layout="grid" className="md:grid-cols-3">
              <DetailItem label="Destination URL" mono>
                {request.snapshot.destinationUrl}
              </DetailItem>
              <DetailItem label="Channel Name">{request.snapshot.name}</DetailItem>
              <DetailItem label="Config Version">
                {request.snapshot.lockVersion}
                {configChanged && (
                  <Pill color="yellow" className="ml-2">
                    Config changed
                  </Pill>
                )}
              </DetailItem>
            </DetailList>
          </Disclosure>
        </div>
      </Centered>
    </PageContent>
  );
}
