// Run with: node tests/validator.test.js   (no dependencies; uses node:assert)
const assert = require("node:assert/strict");
const P = require("../js/platforms.js");
const V = require("../js/validator.js");

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log("  PASS  " + name); }
  catch (e) { console.error("  FAIL  " + name + "\n        " + e.message); process.exitCode = 1; }
}
const post = (text, media = []) => ({ text, media });
const img = (n = "a.png") => ({ name: n, kind: "image" });
const vid = (n = "a.mp4") => ({ name: n, kind: "video" });

console.log("Validator experiments");

test("E1 valid short post passes on X", () => {
  assert.equal(V.validate(post("Hello world"), P.x).ok, true);
});
test("E2 exactly 280 chars passes on X (boundary)", () => {
  assert.equal(V.validate(post("a".repeat(280)), P.x).ok, true);
});
test("E3 281 chars fails on X (boundary + 1)", () => {
  const r = V.validate(post("a".repeat(281)), P.x);
  assert.equal(r.ok, false);
  assert.match(r.errors[0], /1 characters over/);
});
test("E4 same 281-char text passes on LinkedIn (per-platform limits)", () => {
  assert.equal(V.validate(post("a".repeat(281)), P.linkedin).ok, true);
});
test("E5 emoji counted as one grapheme", () => {
  assert.equal(V.graphemeLength("a👍🏽b"), 3);
});
test("E6 URL counts as 23 chars on X", () => {
  const r = V.validate(post("see https://example.com/a/very/long/path/that/is/longer/than/23/chars"), P.x);
  assert.equal(r.stats.chars, 4 + 23);
});
test("E7 URL counts at real length on Bluesky", () => {
  const url = "https://example.com/abc";
  assert.equal(V.validate(post(url), P.bluesky).stats.chars, url.length);
});
test("E8 empty post is rejected", () => {
  assert.equal(V.validate(post("   "), P.x).ok, false);
});
test("E9 media-only post is valid on X", () => {
  assert.equal(V.validate(post("", [img()]), P.x).ok, true);
});
test("E10 Instagram requires media", () => {
  const r = V.validate(post("caption"), P.instagram);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /at least one image or video/.test(e)));
});
test("E11 Instagram with media passes", () => {
  assert.equal(V.validate(post("caption", [img()]), P.instagram).ok, true);
});
test("E12 Instagram rejects links in caption", () => {
  const r = V.validate(post("go https://x.com", [img()]), P.instagram);
  assert.equal(r.ok, false);
});
test("E13 hashtag limit: Threads allows 1, rejects 2", () => {
  assert.equal(V.validate(post("hi #one"), P.threads).ok, true);
  assert.equal(V.validate(post("hi #one #two"), P.threads).ok, false);
});
test("E14 '#' inside a word or URL fragment is not a hashtag", () => {
  assert.equal(V.countHashtags("a#b and https://x.com/p#frag"), 0);
});
test("E15 media count limit: X allows 4, rejects 5", () => {
  const four = Array.from({ length: 4 }, (_, i) => img("i" + i));
  assert.equal(V.validate(post("x", four), P.x).ok, true);
  assert.equal(V.validate(post("x", four.concat(img("5"))), P.x).ok, false);
});
test("E16 Bluesky rejects video", () => {
  assert.equal(V.validate(post("x", [vid()]), P.bluesky).ok, false);
});
test("E17 warning appears near the limit but post stays valid", () => {
  const r = V.validate(post("a".repeat(260)), P.x);
  assert.equal(r.ok, true);
  assert.equal(r.warnings.length, 1);
});
test("E18 validateAll isolates results per platform", () => {
  const text = "a".repeat(400);
  const res = V.validateAll({ x: post(text), linkedin: post(text) }, P, ["x", "linkedin"]);
  assert.equal(res.x.ok, false);
  assert.equal(res.linkedin.ok, true);
});

console.log(`\n${passed}/18 passed`);
if (process.exitCode) console.log("Some experiments failed.");
