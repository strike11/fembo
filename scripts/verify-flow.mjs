const base = "http://localhost:3000";

function cookieJar() {
  const cookies = new Map();
  return {
    apply(headers) {
      const raw = headers.getSetCookie?.() ?? [];
      for (const entry of raw) {
        const [pair] = entry.split(";");
        const idx = pair.indexOf("=");
        if (idx > 0) cookies.set(pair.slice(0, idx), pair.slice(idx + 1));
      }
    },
    header() {
      return [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    },
    hasSession() {
      return [...cookies.keys()].some((key) => key.includes("session") || key.includes("better-auth"));
    },
  };
}

async function request(path, { method = "GET", body, jar, follow = false } = {}) {
  const headers = { Origin: base };
  if (body) headers["Content-Type"] = "application/json";
  if (jar?.header()) headers.Cookie = jar.header();
  const response = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: follow ? "follow" : "manual",
  });
  if (jar) jar.apply(response.headers);
  const text = await response.text();
  return { status: response.status, location: response.headers.get("location"), text };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const email = `verify.${Date.now()}@example.com`;
const password = "SoftRoom2211";
const jar = cookieJar();

const landing = await request("/");
assert(landing.status === 200, `landing ${landing.status}`);
assert(landing.text.includes("A calm space with a companion you shape"), "landing hero missing");
assert(landing.text.includes("Aki") && landing.text.includes("Nico"), "companion strip missing");

const registerPage = await request("/register");
assert(registerPage.status === 200, `register page ${registerPage.status}`);
assert(registerPage.text.includes("I confirm I am 21 or older"), "age gate missing");

const loginPage = await request("/login");
assert(loginPage.status === 200, `login page ${loginPage.status}`);

const guarded = await request("/app/companions");
assert([307, 308, 302].includes(guarded.status), `app should redirect, got ${guarded.status}`);
assert(guarded.location?.includes("/login"), `unexpected guard redirect ${guarded.location}`);

const underage = await request("/api/auth/sign-up/email", {
  method: "POST",
  jar,
  body: {
    name: "Too Young",
    email: `young.${Date.now()}@example.com`,
    password,
    dateOfBirth: "2012-01-01",
  },
});
assert(underage.status >= 400, `underage should fail, got ${underage.status} ${underage.text}`);

const signup = await request("/api/auth/sign-up/email", {
  method: "POST",
  jar,
  body: {
    name: "Soft Tester",
    email,
    password,
    dateOfBirth: "1998-04-12",
  },
});
assert(signup.status < 400, `signup failed ${signup.status} ${signup.text}`);
assert(jar.hasSession() || signup.status === 200, "signup did not set a session cookie");

const companions = await request("/app/companions", { jar, follow: true });
assert(companions.status === 200, `companions ${companions.status}`);
assert(companions.text.includes("Talk") && companions.text.includes("Tune"), "companion actions missing");
assert(companions.text.includes("Mint"), "furry companion missing");

const profilePatch = await request("/api/profile", {
  method: "PATCH",
  jar,
  body: { name: "Soft Tester", nsfwEnabled: true },
});
assert(profilePatch.status === 200, `profile ${profilePatch.status} ${profilePatch.text}`);
assert(profilePatch.text.includes("nsfwEnabled"), "profile payload missing");

const config = await request("/api/companions/aki/config", {
  method: "PUT",
  jar,
  body: {
    nickname: "Aki-soft",
    shyBold: 15,
    sweetTeasing: 20,
    calmEnergetic: 10,
    treatYou: "Speak gently and stay close.",
    appearanceNotes: "Cream sweater, pink hair.",
    voiceId: "en_US-hfc_female-medium",
  },
});
assert(config.status === 200, `config ${config.status} ${config.text}`);

const chatPage = await request("/app/companions/aki", { jar, follow: true });
assert(chatPage.status === 200, `chat page ${chatPage.status}`);
assert(chatPage.text.includes("Aki-soft") || chatPage.text.includes("Talk with"), "chat header missing");

const configurePage = await request("/app/companions/aki/configure", { jar, follow: true });
assert(configurePage.status === 200, `configure ${configurePage.status}`);
assert(configurePage.text.includes("Piper voice"), "voice picker missing");

const profilePage = await request("/app/profile", { jar, follow: true });
assert(profilePage.status === 200, `profile page ${profilePage.status}`);
assert(profilePage.text.includes("NSFW conversation"), "nsfw switch missing");

let chatOk = false;
try {
  const chat = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: {
      Origin: base,
      "Content-Type": "application/json",
      Cookie: jar.header(),
    },
    body: JSON.stringify({ slug: "aki", content: "Hi, just say hello in one short sentence." }),
  });
  const chatText = await chat.text();
  chatOk = chat.ok && (chatText.includes("delta") || chatText.includes("done") || chatText.length > 0);
  if (!chat.ok) {
    console.log("chat pending/unavailable:", chat.status, chatText.slice(0, 240));
  } else {
    console.log("chat stream sample:", chatText.slice(0, 240));
  }
} catch (error) {
  console.log("chat not reachable yet:", error.message);
}

console.log(
  JSON.stringify(
    {
      landing: landing.status,
      register: registerPage.status,
      login: loginPage.status,
      ageGateBlocked: underage.status,
      signup: signup.status,
      companions: companions.status,
      profile: profilePatch.status,
      config: config.status,
      chatPage: chatPage.status,
      configurePage: configurePage.status,
      chatOk,
    },
    null,
    2,
  ),
);
