const getEnv = (key) => {
  if (typeof Netlify !== "undefined" && Netlify?.env?.get) {
    return Netlify.env.get(key);
  }
  return process.env[key];
};

const jsonHeaders = { "content-type": "application/json" };

const unauthorizedResponse = (message = "Unauthorized") =>
  new Response(JSON.stringify({ error: message }), { status: 401, headers: jsonHeaders });

export function requireOwner(context = {}) {
  const rawUser = context?.clientContext?.user;
  if (!rawUser) return unauthorizedResponse();

  let user = rawUser;
  if (typeof rawUser === "string") {
    try {
      user = JSON.parse(rawUser);
    } catch {
      return unauthorizedResponse("Invalid identity payload");
    }
  }

  const configuredEmail = (getEnv("ADMIN_EMAIL") || "").toLowerCase();
  const email = (user?.email || "").toLowerCase();
  const roles = Array.isArray(user?.app_metadata?.roles) ? user.app_metadata.roles : [];
  const isOwner = (configuredEmail && email === configuredEmail) || roles.includes("owner");

  if (!isOwner) return unauthorizedResponse();
  return { user };
}

export { unauthorizedResponse as unauthorizedJsonResponse };

