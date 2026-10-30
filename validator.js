/**
 * Pure constraint validation. No DOM access, so it runs in the browser and in Node tests.
 *
 * validate(post, platform) -> {
 *   ok: boolean, errors: string[], warnings: string[],
 *   stats: { chars, maxChars, hashtags, links, media, remaining }
 * }
 * post = { text: string, media: [{ name, kind: "image"|"video" }] }
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Validator = factory();
})(typeof self !== "undefined" ? self : this, function () {
  var URL_RE = /https?:\/\/[^\s]+/g;
  var HASHTAG_RE = /(^|\s)#[\p{L}\p{N}_]+/gu;

  function graphemeLength(str) {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      var n = 0;
      var seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      for (var _ of seg.segment(str)) n++;
      return n;
    }
    return Array.from(str).length;
  }

  function findUrls(text) {
    return text.match(URL_RE) || [];
  }

  function countHashtags(text) {
    return (text.match(HASHTAG_RE) || []).length;
  }

  /** Effective length: URLs count as platform.urlLength when it is set. */
  function effectiveLength(text, platform) {
    if (platform.urlLength == null) return graphemeLength(text);
    var urls = findUrls(text);
    var stripped = text.replace(URL_RE, "");
    return graphemeLength(stripped) + urls.length * platform.urlLength;
  }

  function validate(post, platform) {
    var text = (post && post.text) || "";
    var media = (post && post.media) || [];
    var errors = [];
    var warnings = [];

    var chars = effectiveLength(text, platform);
    var hashtags = countHashtags(text);
    var links = findUrls(text).length;
    var trimmed = text.trim();

    if (!trimmed && media.length === 0) {
      errors.push("Post is empty. Add text or media.");
    }
    if (chars > platform.maxChars) {
      errors.push(
        "Text is " + (chars - platform.maxChars) + " characters over the " +
        platform.maxChars + " limit."
      );
    } else if (chars >= platform.maxChars * platform.warnAt) {
      warnings.push("Approaching the character limit (" + chars + "/" + platform.maxChars + ").");
    }
    if (hashtags > platform.maxHashtags) {
      errors.push(
        "Too many hashtags: " + hashtags + " (max " + platform.maxHashtags + ")."
      );
    }
    if (platform.maxLinks != null && links > platform.maxLinks) {
      errors.push(
        platform.maxLinks === 0
          ? "Links in captions are not clickable here; remove " + links + " link(s)."
          : "Too many links: " + links + " (max " + platform.maxLinks + ")."
      );
    }
    if (platform.requiresMedia && media.length === 0) {
      errors.push("Requires at least one image or video.");
    }
    if (media.length > platform.maxMedia) {
      errors.push("Too many attachments: " + media.length + " (max " + platform.maxMedia + ").");
    }
    media.forEach(function (m) {
      if (platform.allowedMedia.indexOf(m.kind) === -1) {
        errors.push('"' + m.name + '" is a ' + m.kind + "; only " + platform.allowedMedia.join("/") + " allowed.");
      }
    });

    return {
      ok: errors.length === 0,
      errors: errors,
      warnings: warnings,
      stats: {
        chars: chars,
        maxChars: platform.maxChars,
        remaining: platform.maxChars - chars,
        hashtags: hashtags,
        links: links,
        media: media.length,
      },
    };
  }

  /** Validate a post against many platforms at once. */
  function validateAll(posts, platforms, selectedIds) {
    var out = {};
    selectedIds.forEach(function (id) {
      out[id] = validate(posts[id], platforms[id]);
    });
    return out;
  }

  return {
    validate: validate,
    validateAll: validateAll,
    graphemeLength: graphemeLength,
    effectiveLength: effectiveLength,
    countHashtags: countHashtags,
    findUrls: findUrls,
  };
});
