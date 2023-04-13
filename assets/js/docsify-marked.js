(function () {
  const originMarkdown = window.$docsify?.markdown || {};
  const newMarked = marked; // version above 2.1.0
  window.gMarked = newMarked;
  window.$docsify.markdown = newMarkdown;
  return;
  function newMarkdown(originMarked, originRenderer) {
    const merge = Object.assign;
    const opts = mergeOptions();

    newMarked.setOptions(opts);
    newMarked.use({ extensions: window.gMarkedPlugins });

    return newMarked.parse;

    // source code: https://github.com/docsifyjs/docsify/blob/898e6eea7a7d5bf34a428d672d6a1b8c7896d183/src/core/render/compiler.js#L73-L87
    function mergeOptions() {
      if (isFn(originMarkdown)) {
        return originMarkdown.apply(this, originMarked, originRenderer)
          .defaults;
      } else {
        return merge(originMarkdown, {
          renderer: merge(originRenderer, originMarkdown.renderer),
        });
      }
    }
  }
  function isFn(obj) {
    return typeof obj === "function";
  }
})();
