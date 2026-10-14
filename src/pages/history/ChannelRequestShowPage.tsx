import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import ProjectBreadcrumbs from "../../components/ProjectBreadcrumbs";
import {
  BodyViewer,
  DisclosureSection,
  HeadersTable,
  ResponseEmpty,
  SectionSizeBadge,
  StatusCodeBadge,
  SubSection,
} from "../../components/history/ChannelRequestParts";
import ChannelRequestSummary from "../../components/history/ChannelRequestSummary";
import ChannelTiming from "../../components/history/ChannelTiming";
import WipedDataViewer from "../../components/history/WipedDataViewer";
import { errorCategory, humanizeError } from "../../components/history/channelHelpers";
import { formatBytes } from "../../components/history/format";
import { findChannel, findChannelRequest, primaryEvent } from "../../mock-data/channel-requests";
import { historyPermissions } from "../../mock-data/history-extra";
import { findProject } from "../../mock-data/projects";

const sizeNote = (size: number | null) =>
  size != null && size > 0 ? <span className="text-[11px] text-secondary-400 font-mono">{formatBytes(size)}</span> : null;

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
                <span className="pl-1 font-light font-mono">{request?.requestId.slice(0, 8)}</span>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              <DisclosureSection
                id="request-section"
                title="Request"
                padded={false}
                titleRight={event?.requestBodySize ? <SectionSizeBadge size={event.requestBodySize} /> : undefined}
              >
                {event?.requestHeaders && (
                  <SubSection title="Headers">
                    <HeadersTable headers={event.requestHeaders} />
                  </SubSection>
                )}
                {event && showRequestBody && (
                  <SubSection title="Body" titleRight={sizeNote(event.requestBodySize)}>
                    <BodyViewer
                      preview={event.requestBodyPreview}
                      hash={event.requestBodyHash}
                      size={event.requestBodySize}
                      headers={event.requestHeaders}
                    />
                  </SubSection>
                )}
              </DisclosureSection>

              <DisclosureSection
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
                      <SubSection title="Headers">
                        <HeadersTable headers={event.responseHeaders} />
                      </SubSection>
                    )}
                    {event && showResponseBody && (
                      <SubSection title="Body" titleRight={sizeNote(event.responseBodySize)}>
                        <BodyViewer
                          preview={event.responseBodyPreview}
                          hash={event.responseBodyHash}
                          size={event.responseBodySize}
                          headers={event.responseHeaders}
                        />
                      </SubSection>
                    )}
                  </>
                )}
              </DisclosureSection>
            </div>
          )}

          <DisclosureSection id="context-section" title="Context" defaultOpen={false}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-secondary-500 text-xs uppercase tracking-wide mb-1">Destination URL</dt>
                <dd className="text-secondary-900 break-all font-mono text-xs">{request.snapshot.destinationUrl}</dd>
              </div>
              <div>
                <dt className="text-secondary-500 text-xs uppercase tracking-wide mb-1">Channel Name</dt>
                <dd className="text-secondary-900">{request.snapshot.name}</dd>
              </div>
              <div>
                <dt className="text-secondary-500 text-xs uppercase tracking-wide mb-1">Config Version</dt>
                <dd className="flex items-center gap-2">
                  <span className="text-secondary-900">{request.snapshot.lockVersion}</span>
                  {configChanged && (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                      Config changed
                    </span>
                  )}
                </dd>
              </div>
            </div>
          </DisclosureSection>
        </div>
      </Centered>
    </PageContent>
  );
}
