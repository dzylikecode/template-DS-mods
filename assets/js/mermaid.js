/**
 * mermaid
 */

(function () {
  const docsifyRender = window.gDocsifyRender;
  const docsifyPlugins = window.gDocsifyPlugins;

  const langId = "mermaid";
  // 有一个副作用, 每次切换页面(不是刷新), 本来mermaid-svg-3可能会变成mermaid-svg-5
  // 要是在beforeEach里面, 初始化就不会出现这样的问题
  let num = 0;

  function init() {
    mermaid.initialize({ startOnLoad: false, theme: getTheme() });
    return;
    function getTheme() {
      if (window?.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      } else {
        return "default";
      }
    }
  }
  function plugin(hook, vm) {
    hook.beforeEach(function (html) {
      num = 0;
      return html;
    });
  }

  function render(code) {
    return (
      '<pre class="mermaid">' +
      mermaid.render("mermaid-svg-" + num++, code) +
      "</pre>"
    );
  }

  function install() {
    init();
    docsifyRender.code[langId] = render;
    docsifyPlugins.push(plugin);
  }

  install();
})();
