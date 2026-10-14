/** Ports of channel_request_live/helpers.ex error humanisation. */

const transportErrors: Record<string, string> = {
  nxdomain: "DNS lookup failed — the destination hostname could not be resolved",
  econnrefused: "Connection refused — the destination server is not accepting connections on this port",
  ehostunreach: "Host unreachable — no route to the destination server",
  enetunreach: "Network unreachable — no network path to the destination",
  closed: "Connection closed unexpectedly by the destination",
  econnreset: "Connection reset — the destination dropped the connection",
  econnaborted: "Connection aborted by the destination",
  epipe: "Broken pipe — the destination closed the connection while data was being sent",
  connect_timeout: "Connection timed out — the destination server did not respond to the connection attempt",
  response_timeout:
    "Response timed out — the destination accepted the connection but did not send a response in time",
  timeout: "Request timed out",
};

const credentialErrors: Record<string, string> = {
  credential_missing_auth_fields: "The configured credential is missing required authentication fields",
  credential_environment_not_found: "The credential environment could not be found",
  oauth_refresh_failed: "OAuth token refresh failed — the destination credential could not be renewed",
  oauth_reauthorization_required: "OAuth credential needs to be re-authorized by a user",
};

export function humanizeError(code: string): string {
  if (transportErrors[code]) return transportErrors[code];
  if (credentialErrors[code]) return credentialErrors[code];
  if (code.startsWith("unsupported_credential_schema:")) {
    const name = code.replace("unsupported_credential_schema:", "");
    return `Unsupported credential type "${name}" — this credential schema cannot be used for destination auth`;
  }
  return code;
}

export function errorCategory(code: string): "transport" | "credential" | null {
  if (transportErrors[code]) return "transport";
  if (credentialErrors[code] || code.startsWith("unsupported_credential_schema:")) return "credential";
  return null;
}
