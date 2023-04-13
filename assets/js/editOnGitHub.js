/**
 * 添加 edit on github 按钮, 跳转到 github repos
 */
(function () {
  const docsifyPlugins = window.gDocsifyPlugins;
  const blobLink = window.gBlobLink;

  function plugin(hook, vm) {
    hook.beforeEach(function (html) {
      const blobFile = blobLink + vm.route.file;
      const editHtml = "[:memo: EDIT DOCUMENT](" + blobFile + ")\n\n";
      return editHtml + html;
    });
  }

  function install() {
    docsifyPlugins.push(plugin);
  }

  install();
})();
