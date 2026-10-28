const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage",
);

const googleAuth = async ({ code }) => {
  const { tokens } = await client.getToken(code);

  if (!tokens.id_token) {
    throw new Error("Google ID token not received");
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    emailVerified: payload.email_verified,
  };
};

module.exports = {
  googleAuth,
};
