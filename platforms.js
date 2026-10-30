/**
 * Platform constraint configuration.
 * Add a new platform by adding one entry here; the validator and UI pick it up automatically.
 *
 * Fields:
 *  maxChars      hard character limit (counted per grapheme)
 *  warnAt        fraction of maxChars at which a warning is shown
 *  maxHashtags   max number of #hashtags
 *  maxMedia      max attached files
 *  requiresMedia post cannot be published without media
 *  allowedMedia  allowed media kinds: "image" | "video"
 *  urlLength     fixed length every URL counts as (null = real length)
 *  maxLinks      max URLs in the text (null = unlimited)
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PLATFORMS = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
    x: {
      id: "x", name: "X (Twitter)", color: "#111111",
      maxChars: 280, warnAt: 0.9, maxHashtags: 10, maxMedia: 4,
      requiresMedia: false, allowedMedia: ["image", "video"],
      urlLength: 23, maxLinks: null,
    },
    linkedin: {
      id: "linkedin", name: "LinkedIn", color: "#0a66c2",
      maxChars: 3000, warnAt: 0.9, maxHashtags: 5, maxMedia: 9,
      requiresMedia: false, allowedMedia: ["image", "video"],
      urlLength: null, maxLinks: null,
    },
    instagram: {
      id: "instagram", name: "Instagram", color: "#c13584",
      maxChars: 2200, warnAt: 0.9, maxHashtags: 30, maxMedia: 10,
      requiresMedia: true, allowedMedia: ["image", "video"],
      urlLength: null, maxLinks: 0,
    },
    facebook: {
      id: "facebook", name: "Facebook", color: "#1877f2",
      maxChars: 63206, warnAt: 0.9, maxHashtags: 30, maxMedia: 10,
      requiresMedia: false, allowedMedia: ["image", "video"],
      urlLength: null, maxLinks: null,
    },
    threads: {
      id: "threads", name: "Threads", color: "#444444",
      maxChars: 500, warnAt: 0.9, maxHashtags: 1, maxMedia: 10,
      requiresMedia: false, allowedMedia: ["image", "video"],
      urlLength: null, maxLinks: 5,
    },
    bluesky: {
      id: "bluesky", name: "Bluesky", color: "#1185fe",
      maxChars: 300, warnAt: 0.9, maxHashtags: 8, maxMedia: 4,
      requiresMedia: false, allowedMedia: ["image"],
      urlLength: null, maxLinks: null,
    },
  };
});
