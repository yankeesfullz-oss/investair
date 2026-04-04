import { Auth0Client } from "@auth0/nextjs-auth0/server";

const authorizationParameters = {};

if (process.env.AUTH0_AUDIENCE) {
  authorizationParameters.audience = process.env.AUTH0_AUDIENCE;
}

if (process.env.AUTH0_SCOPE) {
  authorizationParameters.scope = process.env.AUTH0_SCOPE;
}

export const auth0 = new Auth0Client(
  Object.keys(authorizationParameters).length > 0
    ? { authorizationParameters }
    : undefined
);
