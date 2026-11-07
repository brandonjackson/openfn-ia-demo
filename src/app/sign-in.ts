/**
 * Lightning's sign-in, by way of lightning-full-api's `/v3/sign_in`, which
 * remembers where to come back to (the screen, `hash`, since the app routes
 * by its hash) before sending the browser on to `/users/log_in`.
 */
export const signInUrl = (hash: string) => `${import.meta.env.BASE_URL}sign_in${hash ? `?to=${encodeURIComponent(hash)}` : ""}`;
