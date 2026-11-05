# Wiring the IA demo to the API

What it would take to feed every page in this app from Lightning's API instead
of fixtures. For each page's wrapper (`XPage.fixtures.tsx`), this lists the
endpoint its future `XPage.query.tsx` would call for each piece of data and
each callback. Then it goes the other way: every endpoint in the API, and where
it's used. Endpoints nothing here would call are split into functionality the
demo needs to port, and endpoints no page needs.

The API is the contract in
[openfn-3-poc `api/`](https://github.com/OpenFn/openfn-3-poc/tree/main/api), as of
`149bc57` (5 Nov 2026). The endpoint list is its README's "All endpoints"
table. Statuses (Public, Private, Planned) are the API's own.

## By page

### Shell (`Shell.fixtures.tsx`, `AccountMenu`)

| Data or action | Endpoint |
| --- | --- |
| Signed-in state on load | `GET /api/session` |
| `instance` (name, URL, release, purge days, GitHub connect URL) | `GET /api/instance` |
| `user`, `isSuperuser` | `GET /api/me` |
| `recentProjects` | `GET /api/projects` |
| `project` (the one the URL is in) | `GET /api/projects/:id` |
| Project bar's sandbox list | `GET /api/projects/:project_id/sandboxes` |
| "Log out" | `DELETE /api/session` |

### Projects (`ProjectsPage`)

| Data or action | Endpoint |
| --- | --- |
| `projects` | `GET /api/projects` |
| `onCreateProject` | `PUT /api/projects/:id` (client makes the UUID) |

### Project overview (`ProjectPage`)

| Data or action | Endpoint |
| --- | --- |
| Project name, description | `GET /api/projects/:id` |
| Insights tiles (work order count) | `GET /api/projects/:project_id/work_orders` (`meta.total_entries`) |
| `components` (channels) | `GET /api/projects/:project_id/channels` |

### Workflows (`ProjectWorkflowsPage`)

| Data or action | Endpoint |
| --- | --- |
| `workflows` | `GET /api/projects/:project_id/workflows` |
| `onToggleWorkflow` | `PATCH /api/projects/:project_id/workflows/:id` (trigger `enabled`) |
| `onDeleteWorkflow` | `DELETE /api/projects/:project_id/workflows/:id` |

### Components (`ProjectComponentsPage`)

| Data or action | Endpoint |
| --- | --- |
| Channels | `GET /api/projects/:project_id/channels` |
| `channelCredentials` | `GET /api/projects/:project_id/credentials` |
| `onCreateChannel` | `PUT /api/projects/:project_id/channels/:id` |

### Channel (`ChannelPage`, and `ChannelView` in the editor)

| Data or action | Endpoint |
| --- | --- |
| The channel | `GET /api/projects/:project_id/channels/:id` |
| Traffic and recent messages | `GET /api/projects/:project_id/channel_requests?channel_id=…` |
| A message's run | `GET /api/runs/:id` |
| `credentials` | `GET /api/projects/:project_id/credentials` |
| `onEditChannel`, `onSetEnabled` | `PUT /api/projects/:project_id/channels/:id` |
| `onDeleteChannel` | `DELETE /api/projects/:project_id/channels/:id` |

### Sandboxes (`ProjectSandboxesPage`)

| Data or action | Endpoint |
| --- | --- |
| `sandboxes` | `GET /api/projects/:project_id/sandboxes` (planned `depth=all` for the tree) |
| Merge dialog: what will change, diverged workflows, credentials | `POST /api/projects/:project_id/sandboxes/:id/merge_previews` |
| `onCreateSandbox` | `PUT /api/projects/:project_id/sandboxes/:id` |
| `onEditSandbox` (name, colour) | `PUT /api/projects/:id` (a sandbox is a project) |
| `onMergeSandbox` | `POST /api/projects/:project_id/sandboxes/:id/merges` |
| `onDeleteSandbox` | `DELETE /api/projects/:id` |

### History (`HistoryPage`)

| Data or action | Endpoint |
| --- | --- |
| `workOrders`, one project | `GET /api/projects/:project_id/work_orders?include=runs` (planned `search`, `last_activity_*`, `include=runs`) |
| `workOrders`, every project | `GET /api/work_orders?include=runs` |
| A run's steps in `RunEntry` | `GET /api/runs/:id/steps` |
| Search by log | `search_fields=log` on the work order list; `GET /api/log_lines` for the matched lines |
| `channelRequests` | `GET /api/projects/:project_id/channel_requests` |
| `workflows` filter, one project | `GET /api/projects/:project_id/workflows` |
| `workflows` filter, every project | `GET /api/workflows` |
| `projects` filter | `GET /api/projects` |
| `onRetry`, `onRetryFromStep` | `POST /api/projects/:project_id/work_orders/retries` |
| `onCancel`, one work order | `PATCH /api/work_orders/:id` |
| `onCancel`, several | `POST /api/projects/:project_id/work_orders/cancellations` |
| `onExport` | `POST /api/projects/:project_id/history_exports` |

### Project settings (`ProjectSettingsPage`)

| Section | Data or action | Endpoint |
| --- | --- | --- |
| Setup | Name, environment, description, concurrency, `permissions` | `GET /api/projects/:id` |
| Setup | `onSaveProjectIdentity`, `onSaveConcurrency` | `PUT /api/projects/:id` |
| Setup | `onExportProject` | `GET /api/provision/yaml?id=…` |
| Setup | `onDeleteProject` | `DELETE /api/projects/:id` |
| Credentials | `orgCredentials` | `GET /api/projects/:project_id/credentials` |
| Collections | `collections` | `GET /api/projects/:project_id/collections` |
| Collections | `onCreateCollection`, `onRenameCollection` | `PUT /api/projects/:project_id/collections/:id` |
| Collections | `onDeleteCollection` | `DELETE /api/projects/:project_id/collections/:id` |
| Collections | `onPreviewCollection` | `GET /collections/:name?limit=5` |
| Webhook security | `webhookAuthMethods` | `GET /api/projects/:project_id/webhook_auth_methods` |
| Webhook security | `webhookTriggers` | `GET /api/projects/:project_id/workflows` |
| Webhook security | `onCreateWebhookAuthMethod`, `onUpdateWebhookAuthMethod` | `PUT /api/projects/:project_id/webhook_auth_methods/:id` |
| Webhook security | `onDeleteWebhookAuthMethod` | `DELETE /api/projects/:project_id/webhook_auth_methods/:id` |
| Collaboration | `collaborators` | `GET /api/projects/:project_id/members` |
| Collaboration | `onAddCollaborators`, `onChangeCollaboratorRole` | `PUT /api/projects/:project_id/members/:user_id` |
| Collaboration | `onInviteCollaborators` | `POST /api/projects/:project_id/invitations` |
| Collaboration | `onSetFailureAlert`, `onSetDigest` | `PUT /api/projects/:project_id/members/:user_id/notifications` |
| Collaboration | `onRemoveCollaborator` | `DELETE /api/projects/:project_id/members/:user_id` |
| Security | `onSetMfaRequired` | `PUT /api/projects/:id/mfa_requirement` |
| Sync to GitHub | `github.connection` | `GET /api/projects/:project_id/repo_connection` |
| Sync to GitHub | `github.installations` (repos) | `GET /api/me/github_repos` |
| Sync to GitHub | Branch picker | `GET /api/me/github_repos/:owner/:name/branches` |
| Sync to GitHub | `onConnectGitHubAccount` | Browser redirect to `github_connect_url` from `GET /api/instance` |
| Sync to GitHub | `onConnectGitHub` | `PUT /api/projects/:project_id/repo_connection` |
| Sync to GitHub | `onInitiateGitHubSync` | `POST /api/projects/:project_id/repo_connection/syncs` |
| Sync to GitHub | `onDisconnectGitHub` | `DELETE /api/projects/:project_id/repo_connection` |
| Data storage | `dataStorage` | `GET /api/projects/:id` |
| Data storage | `onSaveDataStorage` | `PUT /api/projects/:id/data_retention` |
| History exports | `historyExports` | `GET /api/projects/:project_id/history_exports` |
| History exports | `onCreateHistoryExport` | `POST /api/projects/:project_id/history_exports` |
| History exports | `onDownloadHistoryExport` | `GET /api/projects/:project_id/history_exports/:id` (its download link) |

### User settings (`UserSettingsPage`)

| Section | Data or action | Endpoint |
| --- | --- | --- |
| Profile | `profile` (name, email, pending email, GitHub, MFA) | `GET /api/me` |
| Profile | `onSaveProfile` | `PATCH /api/users/:id` |
| Profile | `onChangeEmail`, `onChangePassword` | `POST /api/session` (step up with the current password), then `PATCH /api/users/:id` |
| Profile | `onStartMfaSetup` | `POST /api/me/mfa` |
| Profile | `onEnableMfa` | `PUT /api/me/mfa` |
| Profile | `onDisableMfa` | `DELETE /api/me/mfa` |
| Profile | `backupCodes` | `GET /api/me/mfa` |
| Profile | `onRegenerateBackupCodes` | `POST /api/me/mfa/backup_codes` |
| Profile | `onConnectGitHub` | Browser redirect to `github_connect_url` from `GET /api/instance` |
| Profile | `onDisconnectGitHub` | `DELETE /api/me/github_connection` |
| Profile | `onDeleteAccount` | `DELETE /api/users/:id` |
| Credentials | `credentials` | `GET /api/credentials` |
| Credentials | Each credential's environments | `GET /api/credentials/:id/environments` |
| Credentials | `credentialSchemas` | `GET /api/credential_schemas` (and `/:name` for one form) |
| Credentials | `projects` (to link to) | `GET /api/projects` |
| Credentials | `onSaveCredential`, new | `POST /api/credentials` |
| Credentials | `onSaveCredential`, existing | `PUT /api/credentials/:id` |
| Credentials | `onSaveCredential`, environments added or changed | `PUT /api/credentials/:id/environments/:name` |
| Credentials | `onSaveCredential`, environment removed | `DELETE /api/credentials/:id/environments/:name` |
| Credentials | `onSaveCredential`, project added | `PUT /api/projects/:project_id/credentials/:id` |
| Credentials | `onSaveCredential`, project removed | `DELETE /api/projects/:project_id/credentials/:id` |
| Credentials | `onDeleteCredential`, never used | `DELETE /api/credentials/:id` |
| Credentials | `onDeleteCredential`, used by runs | `PUT /api/credentials/:id/scheduled_deletion` |
| Credentials | `onTransferCredential` | `PUT /api/credentials/:id/transfer` |
| Credentials | `onRevokeCredentialTransfer` | `DELETE /api/credentials/:id/transfer` |
| Credentials | `oauthClients` | `GET /api/oauth_clients` |
| Credentials | `onSaveOAuthClient` | `PUT /api/oauth_clients/:id` |
| Credentials | `onDeleteOAuthClient` | `DELETE /api/oauth_clients/:id` |
| API tokens | `apiTokens` | `GET /api/me/tokens` |
| API tokens | `onGenerateToken` | `POST /api/session` (step up), then `POST /api/me/tokens` |
| API tokens | `onDeleteToken` | `DELETE /api/me/tokens/:id` |

### Admin settings (`AdminSettingsPage`)

| Section | Data or action | Endpoint |
| --- | --- | --- |
| Users | `users` | `GET /api/users` |
| Users | `onCreateUser` | `POST /api/users` |
| Users | `onUpdateUser`, `onSetUserDisabled` | `PATCH /api/users/:id` |
| Users | `onScheduleUserDeletion` | `DELETE /api/users/:id` |
| Users | `onCancelUserDeletion` | `DELETE /api/users/:id/scheduled_deletion` |
| Projects | `projects` | `GET /api/projects` (every project for a superuser is planned) |
| Projects | `onCreateProject`, `onUpdateProject` | `PUT /api/projects/:id` |
| Projects | `onScheduleProjectDeletion` | `DELETE /api/projects/:id` |
| Projects | `onCancelProjectDeletion` | `DELETE /api/projects/:id/scheduled_deletion` |
| Audit trail | `audit`, `onChangeAuditQuery` | `GET /api/audit_events` |
| Authentication | `authProvider` | `GET /api/auth_provider` |
| Authentication | `onSaveAuthProvider` | `PUT /api/auth_provider` |
| Authentication | `onRemoveAuthProvider` | `DELETE /api/auth_provider` |
| Collections | `collections` | `GET /api/collections` |
| Collections | `onDeleteCollection` | `DELETE /api/projects/:project_id/collections/:id` |
| Everywhere | `instanceUrl`, `deletionGraceDays` | `GET /api/instance` (`url`, `purge_deleted_after_days`) |

### Workflow editor (`WorkflowEditorPage`)

| Data or action | Endpoint |
| --- | --- |
| `workflow` (the route has no project in it) | `GET /api/workflows/:id` |
| New workflow, saved the first time | `POST /api/projects/:project_id/workflows` |
| Edits in a sandbox (canvas, code, steps, rename, settings) | `PATCH /api/projects/:project_id/workflows/:id` |
| "Pause workflow" / "Resume workflow" | `PATCH /api/projects/:project_id/workflows/:id` (trigger `enabled`) |
| "Delete workflow" (`onDelete`) | `DELETE /api/projects/:project_id/workflows/:id` |
| `versions` | `GET /api/workflows/:id/versions` |
| `graphForVersion` ("View as executed") | `GET /api/workflows/:id/snapshots/:snapshot_id` |
| "Export as YAML" | `GET /api/provision/yaml?id=…` (this workflow's part) |
| `sandboxes` | `GET /api/projects/:project_id/sandboxes` |
| "Go live" (promote a sandbox) | `POST …/sandboxes/:id/merge_previews`, then `POST …/sandboxes/:id/merges` with `workflow_ids` |
| `workOrders` (runs bar, run history, Health) | `GET /api/projects/:project_id/work_orders?workflow_id=…&include=runs` |
| A loaded run (`?run=`) | `GET /api/runs/:id`, `GET /api/runs/:id/steps` |
| Log view | `GET /api/log_lines?run_id=…` |
| Input and output (`DataSnippet`, `RunIOPanel`) | `GET /api/dataclips/:id` |
| `dataclips` (the run input picker) | `GET /api/projects/:project_id/dataclips` (Planned) |
| `onRun`, from the trigger or a step, new or existing input | `POST /api/projects/:project_id/workflows/:workflow_id/work_orders` |
| `onRun` from a step of a loaded run | `POST /api/runs/:id/retries` |
| Naming a new input so it's kept | `PATCH /api/dataclips/:id` |
| `adaptors.credentials`, credential pickers | `GET /api/projects/:project_id/credentials` |
| Trigger's webhook auth methods | `GET /api/projects/:project_id/webhook_auth_methods` |
| `components` (channels) and `ChannelView` | `GET /api/projects/:project_id/channels(/:id)`, `GET …/channel_requests` |
| `assistantConversations` | `GET /api/projects/:project_id/ai_sessions` |
| Opening a past conversation | `GET /api/ai_sessions/:id` |
| `onAssistantSend`, first message | `POST /api/projects/:project_id/ai_sessions` |
| `onAssistantSend`, later messages | `POST /api/ai_sessions/:id/messages` |
| `onAssistantCarryOutPlan` | `POST /api/ai_sessions/:id/messages`, then `PATCH` the workflow with the result |

### Pages with no Lightning API behind them

Overview, Systems, System, Services, Service, Status, Insights, Handbook,
Organization settings and the X-Road and ecosystem views are feature-flagged
work beyond Lightning. Where they show runs or workflows they'd read the same
lists as above (`GET /api/work_orders`, `GET /api/workflows`), but their own
records (connected systems, services, X-Road, context layers, handbook files,
billing) have no endpoint yet. Project Create's AI building would sit on the AI
assistant routes.

## By endpoint

Every row of the API's endpoint table. Where a row lists several verbs that do
different jobs, each has its own line.

| Endpoint | Status | Wired in |
| --- | --- | --- |
| `GET /.well-known/oauth-authorization-server` | Public | **Not used**: service accounts only |
| `POST /api/oauth/token` | Public | **Not used**: service accounts only |
| `GET /api/instance` | Private | Shell; Admin settings; GitHub connect links |
| `POST /api/session` | Private | Step-up only (User settings: email, password, tokens). **Sign-in not used** |
| `GET /api/session` | Private | Shell, `signed_in` only. **Other states not used** |
| `DELETE /api/session` | Private | Account menu, "Log out" |
| `POST /api/password_resets` | Private | **Not used** |
| `PUT /api/password_resets/:token` | Private | **Not used** |
| `POST /api/confirmations` | Private | **Not used** |
| `PUT /api/confirmations/:token` | Private | **Not used** |
| `GET /api/me` | Private | Shell; User settings |
| `GET /api/me/tokens` | Private | User settings › API tokens |
| `POST /api/me/tokens` | Private | User settings › API tokens |
| `DELETE /api/me/tokens/:id` | Private | User settings › API tokens |
| `GET /api/me/mfa` | Private | User settings › Profile |
| `POST /api/me/mfa` | Private | User settings › Profile |
| `PUT /api/me/mfa` | Private | User settings › Profile |
| `DELETE /api/me/mfa` | Private | User settings › Profile |
| `POST /api/me/mfa/backup_codes` | Private | User settings › Profile |
| `DELETE /api/me/identities/:id` | Planned | **Not used** |
| `DELETE /api/me/github_connection` | Private | User settings › Profile |
| `GET /api/me/github_repos`, `…/branches` | Private | Project settings › Sync to GitHub |
| `GET /api/projects` | Public | Shell; Projects; History; User settings; Admin settings |
| `GET /api/projects/:id` | Public | Shell; every project page; Project settings |
| `PUT /api/projects/:id` | Public | Projects; Project settings; Sandboxes (edit); Admin settings |
| `DELETE /api/projects/:id` | Private | Project settings; Sandboxes; Admin settings |
| `DELETE /api/projects/:id/scheduled_deletion` | Private | Admin settings › Projects |
| `PUT /api/projects/:id/data_retention` | Private | Project settings › Data storage |
| `PUT /api/projects/:id/mfa_requirement` | Private | Project settings › Security |
| `PUT /api/projects/:id/support_access` | Private | **Not used** |
| `GET /api/projects/:project_id/members` | Private | Project settings › Collaboration |
| `PUT /api/projects/:project_id/members/:user_id` | Private | Project settings › Collaboration |
| `DELETE /api/projects/:project_id/members/:user_id` | Private | Project settings › Collaboration |
| `PUT /api/projects/:project_id/members/:user_id/notifications` | Private | Project settings › Collaboration |
| `POST /api/projects/:project_id/invitations` | Private | Project settings › Collaboration |
| `GET /api/projects/:project_id/sandboxes` | Private | Shell; Sandboxes; editor |
| `PUT /api/projects/:project_id/sandboxes/:id` | Private | Sandboxes |
| `POST /api/projects/:project_id/sandboxes/:id/merge_previews` | Private | Sandboxes; editor "Go live" |
| `POST /api/projects/:project_id/sandboxes/:id/merges` | Private | Sandboxes; editor "Go live" |
| `GET /api/credentials` | Public | User settings › Credentials |
| `GET /api/projects/:project_id/credentials` | Public | Project settings › Credentials; Components; Channel; editor |
| `POST /api/credentials` | Public | User settings › Credentials |
| `GET /api/credentials/:id` | Public | **Not used**: the list carries everything |
| `PUT /api/credentials/:id` | Public | User settings › Credentials |
| `DELETE /api/credentials/:id` | Public | User settings › Credentials |
| `PUT /api/credentials/:id/scheduled_deletion` | Private | User settings › Credentials (delete a used one) |
| `DELETE /api/credentials/:id/scheduled_deletion` | Private | **Not used** |
| `PUT /api/projects/:project_id/credentials/:id` | Private | User settings › Credentials |
| `DELETE /api/projects/:project_id/credentials/:id` | Private | User settings › Credentials |
| `GET /api/credentials/:id/environments` | Private | User settings › Credentials |
| `PUT /api/credentials/:id/environments/:name` | Private | User settings › Credentials |
| `DELETE /api/credentials/:id/environments/:name` | Private | User settings › Credentials |
| `PUT /api/credentials/:id/transfer` | Private | User settings › Credentials |
| `DELETE /api/credentials/:id/transfer` | Private | User settings › Credentials |
| `GET /api/oauth_clients`, `/api/projects/:project_id/oauth_clients` | Private | User settings › Credentials |
| `PUT /api/oauth_clients/:id` | Private | User settings › Credentials |
| `DELETE /api/oauth_clients/:id` | Private | User settings › Credentials |
| `GET /api/projects/:project_id/keychain_credentials` | Private | **Not used** |
| `PUT /api/projects/:project_id/keychain_credentials/:id` | Private | **Not used** |
| `DELETE /api/projects/:project_id/keychain_credentials/:id` | Private | **Not used** |
| `GET /api/credential_schemas`, `/:name` | Private | User settings › Credentials |
| `GET /api/projects/:project_id/collections` | Private | Project settings › Collections |
| `GET /api/collections` | Private | Admin settings › Collections |
| `GET /api/projects/:project_id/collections/:id` | Public | **Not used**: the list carries everything |
| `PUT /api/projects/:project_id/collections/:id` | Public | Project settings › Collections |
| `DELETE /api/projects/:project_id/collections/:id` | Private | Project settings › Collections; Admin settings › Collections |
| `GET /collections/:name` | Public | Project settings › Collections (preview) |
| `POST /collections/:name` | Public | **Not used**: jobs and scripts write items |
| `DELETE /collections/:name` | Public | **Not used**: jobs and scripts delete items |
| `GET /collections/:name/:key` | Public | **Not used**: jobs and scripts |
| `PUT /collections/:name/:key` | Public | **Not used**: jobs and scripts |
| `DELETE /collections/:name/:key` | Public | **Not used**: jobs and scripts |
| `GET /api/users` | Public | Admin settings › Users |
| `POST /api/users` | Public | Admin settings › Users |
| `GET /api/users/:id` | Public | **Not used**: the list carries everything |
| `PATCH /api/users/:id` | Public | Admin settings › Users; User settings › Profile |
| `DELETE /api/users/:id` | Private | Admin settings › Users; User settings › Profile |
| `DELETE /api/users/:id/scheduled_deletion` | Private | Admin settings › Users |
| `GET /api/workflows` | Public | History (every project) |
| `GET /api/workflows/:id` | Public | Editor |
| `GET /api/projects/:project_id/workflows` | Public | Workflows; History; Project settings › Webhook security |
| `POST /api/projects/:project_id/workflows` | Public | Editor (new workflow) |
| `GET /api/projects/:project_id/workflows/:id` | Public | **Not used**: the editor uses `GET /api/workflows/:id` |
| `PATCH`, `PUT /api/projects/:project_id/workflows/:id` | Public | Workflows (toggle); editor |
| `DELETE /api/projects/:project_id/workflows/:id` | Private | Workflows; editor |
| `POST /api/projects/:project_id/workflows/validations` | Planned | **Not used** |
| `GET /api/workflows/:id/snapshots(/:snapshot_id)` | Private | Editor ("View as executed") |
| `GET /api/workflows/:id/versions` | Private | Editor (version picker) |
| `GET /api/workflow_templates` | Private | **Not used** |
| `PUT /api/workflows/:id/template` | Private | **Not used** |
| `GET /api/jobs…` (four paths) | Public | **Not used**: steps come inside the workflow |
| `GET /api/work_orders…` (four paths) | Public | History; Project overview; editor |
| `POST /api/projects/:project_id/workflows/:workflow_id/work_orders` | Private | Editor (Run) |
| `POST /api/projects/:project_id/work_orders/retries` | Private | History |
| `PATCH /api/work_orders/:id` | Private | History (cancel one) |
| `POST /api/projects/:project_id/work_orders/cancellations` | Private | History (cancel several) |
| `POST /api/projects/:project_id/history_exports` | Private | History; Project settings › History exports |
| `GET /api/projects/:project_id/history_exports(/:id)` | Private | Project settings › History exports |
| `GET /api/runs…` (four paths) | Public | Editor; Channel |
| `PATCH /api/runs/:id` | Private | **Not used** |
| `POST /api/runs/:id/retries` | Private | Editor (run from a step of a loaded run) |
| `GET /api/runs/:id/steps` | Private | History; editor |
| `GET /api/dataclips/:id` | Private | Editor |
| `PATCH /api/dataclips/:id` | Private | Editor (naming an input) |
| `GET /api/projects/:project_id/dataclips` | Planned | Editor (input picker) |
| `GET /api/log_lines` | Public | Editor; History (log search) |
| `POST /api/provision` | Public | **Not used**: the CLI deploys with it |
| `GET /api/provision/:id` | Public | **Not used**: the YAML export does the job |
| `GET /api/provision/yaml` | Public | Project settings (export); editor (Export as YAML) |
| `GET /api/projects/:project_id/repo_connection` | Private | Project settings › Sync to GitHub |
| `PUT /api/projects/:project_id/repo_connection` | Private | Project settings › Sync to GitHub |
| `DELETE /api/projects/:project_id/repo_connection` | Private | Project settings › Sync to GitHub |
| `POST /api/projects/:project_id/repo_connection/syncs` | Private | Project settings › Sync to GitHub |
| `POST /i/:trigger_id`, `/i/:project_id/:custom_path` | Public | **Not used**: called by outside systems |
| `GET /i/:trigger_id`, `/i/:project_id/:custom_path` | Public | **Not used**: called by outside systems |
| `GET /api/projects/:project_id/webhook_auth_methods(/:id)` | Private | Project settings › Webhook security; editor |
| `PUT /api/projects/:project_id/webhook_auth_methods/:id` | Private | Project settings › Webhook security |
| `DELETE /api/projects/:project_id/webhook_auth_methods/:id` | Private | Project settings › Webhook security |
| Any `/channels/:id`, `/channels/:id/*path` | Public | **Not used**: called by outside systems |
| `GET /api/projects/:project_id/channels(/:id)` | Private | Components; Channel; Project overview; editor |
| `PUT /api/projects/:project_id/channels/:id` | Private | Components; Channel |
| `DELETE /api/projects/:project_id/channels/:id` | Private | Channel |
| `GET /api/projects/:project_id/channel_requests`, `/api/channel_requests/:id` | Private | History › Channel requests; Channel |
| `GET /api/audit_events` | Private | Admin settings › Audit trail |
| `GET /api/auth_provider` | Private | Admin settings › Authentication |
| `PUT /api/auth_provider` | Private | Admin settings › Authentication |
| `DELETE /api/auth_provider` | Private | Admin settings › Authentication |
| `GET /api/projects/:project_id/ai_sessions` | Private | Editor (assistant) |
| `POST /api/projects/:project_id/ai_sessions` | Private | Editor (assistant) |
| `GET /api/ai_sessions/:id` | Private | Editor (assistant) |
| `POST /api/ai_sessions/:id/messages` | Private | Editor (assistant) |
| `POST /api/ai_sessions/:id/messages/:message_id/retries` | Private | **Not used** |

## Not used: functionality to port

What each unused endpoint is for in the POC (or in Lightning, where the POC
hasn't built it), and what the demo would need to do it.

1. **Sign-in, two-factor and sign-up screens.** `POST /api/session` to sign in
   (with the MFA code, or a backup code, after), and the `mfa_required`,
   `confirmation_required` and `signup_pending` states of `GET /api/session`.
   The POC has `AuthLoginPage`, `AuthTwoFactorPage`, `AuthRegisterPage`,
   `AuthConfirmationRequiredPage` and `FirstSetupPage` (`GET /api/instance`'s
   `needs_setup`). The demo has no screens outside the signed-in app.
2. **Forgot and reset password.** `POST /api/password_resets` and
   `PUT /api/password_resets/:token`. POC: `AuthResetPasswordPage`, the "Forgot
   your password?" link and the emailed link's landing page.
3. **Confirm an email address.** `PUT /api/confirmations/:token` for the
   emailed link (a new account, or a changed email), and
   `POST /api/confirmations` to send it again. POC: `AuthConfirmAccountPage`
   and the resend button on `AuthConfirmationRequiredPage`. In the demo, User
   settings shows a pending email change but offers no "Resend".
4. **Allow support access to a project.** `PUT /api/projects/:id/support_access`.
   POC: a switch in Project settings › Collaboration (`onSetSupportAccess`,
   shown to people who can edit the project). The demo has the support-user
   flag on users in Admin settings but no project switch to let them in.
5. **Keychain credentials.** `GET`, `PUT` and `DELETE
   /api/projects/:project_id/keychain_credentials(/:id)`. A project-owned
   credential that picks one of the project's credentials per run from a
   JSONPath into the input, with a default. POC: a third table in the
   credentials index and `KeychainCredentialFormModal` (name, path, default
   credential). The demo's Project settings › Credentials lists credentials
   but has no keychain table or actions, and the step credential picker
   doesn't offer them.
6. **Cancel a credential's scheduled deletion.** `DELETE
   /api/credentials/:id/scheduled_deletion`. POC: a credential used by runs is
   scheduled rather than deleted (`scheduledDeletion` on the credential), its
   row says so with "Cancel deletion", and deleting a scheduled one again
   deletes it now (`CredentialDeletionModal`). The demo's credentials have one
   delete and no scheduled state.
7. **Cancel a single run.** `PATCH /api/runs/:id`. POC: "Cancel" on a run that
   no worker has picked up yet (`RunCard`, Lightning's run page). The demo
   cancels whole work orders from History, but not one queued run from its
   `RunEntry` or the editor's loaded run.
8. **Workflow templates.** `GET /api/workflow_templates` to start a workflow
   from one, and `PUT /api/workflows/:id/template` to publish one. POC: the new
   workflow `LandingScreen` with "Browse templates" (`TemplateBrowserModal`).
   Lightning also has a "Publish as template" inspector panel for support
   users, which the POC hasn't built yet. The demo starts new workflows blank
   or from Create's ideas.
9. **Validate a workflow before saving it** (Planned).
   `POST /api/projects/:project_id/workflows/validations`. Where it would land:
   the POC's `YAMLImportModal` (paste or drop a workflow's YAML on the new
   workflow screen, with `ValidationErrorDisplay`), which checks in the browser
   for now. The demo has no YAML import; adding it is the natural home for
   this route, and the editor could use it to show errors before a sandbox
   edit is saved.
10. **Retry an assistant message.** `POST
    /api/ai_sessions/:id/messages/:message_id/retries`. Lightning shows a failed
    reply, failed code edit or stuck message with why and a "Try again"
    (`workflow-editor-ai-assistant` annotation). The POC hasn't built it
    either. The demo's assistant replies always succeed, so it has no failed
    state to retry from.
11. **Unlink a sign-in provider** (Planned). `DELETE /api/me/identities/:id`.
    A "Sign-in methods" list in User settings › Profile showing the providers
    on `GET /api/me`'s `identities`, each with "Unlink". Neither Lightning nor
    the POC has this screen yet.

## Not used: nothing to port

- **For outside clients, not the app:** `GET /.well-known/oauth-authorization-server`
  and `POST /api/oauth/token` (service accounts), `POST` and `GET /i/…`
  (webhooks), any `/channels/:id…` (the channel proxy), `POST /api/provision`
  (CLI deploys), and the five collection item routes (`POST` and `DELETE
  /collections/:name`, `GET`, `PUT` and `DELETE /collections/:name/:key`),
  which Lightning's own annotation calls "API only".
- **Read-one routes the list already covers:** `GET /api/credentials/:id`,
  `GET /api/projects/:project_id/collections/:id`, `GET /api/users/:id` (the
  POC uses it for a deep-linkable user edit page; the demo edits in a modal),
  `GET /api/projects/:project_id/workflows/:id`, `GET /api/jobs…` and
  `GET /api/provision/:id`.

## The other way round: callbacks with no endpoint

Things the demo does today that wiring would hit a wall on.

- `onDeleteUserNow`, `onDeleteProjectNow` (Admin settings): immediate purges
  are a [misfit](https://github.com/OpenFn/openfn-3-poc/blob/main/api/misfits.md#immediate-purges);
  Lightning does them in the background after the grace period.
- `onTestAuthProvider`: the API fetches the discovery document as part of
  `PUT /api/auth_provider` and fails with `discovery_failed`, so a separate
  test is a save attempt or a misfit.
- `onRunMaintenance`, `usageMetricsEnabled` (Admin settings › Maintenance):
  no route.
- `onAddCollaborators` adds people by email, but
  `PUT /api/projects/:project_id/members/:user_id` needs their user id, and
  `GET /api/users?email=…` is service-account only. A project admin has no way
  to look up an existing user's id. Worth raising on the contract.
- Admin settings › Projects needs every project, but `GET /api/projects`
  only lists a superuser's own (planned scope).
- `PATCH /api/users/:id` can't set `support_user` or `disabled` yet, and a
  person can't update or delete themselves yet (planned scope), so
  `onSetUserDisabled`, the support flag and User settings' profile, email,
  password and delete-account actions wait on that.
