import {
  buildShareLink,
  signSharePayload,
} from "../src/lib/share-links/index.ts";

const secret = process.env.SHARE_LINK_SECRET || "dev-secret-local";
const now = Math.floor(Date.now() / 1000);
const payload = {
  tutor: "http://localhost:8080/simple-tutor.yaml",
  start: now,
  end: now + 3600,
};
const sig = signSharePayload(payload, secret);
const link = buildShareLink("http://localhost:3000", payload, sig);

console.log(link);
