/**
 * 将 <a class="Docsify" href="#xxx">xxx</a> 转换为 <a class="Docsify" href="url#xxx">xxx</a>, 使得docsify 正常渲染
 */
(function () {
  const docsifyPlugins = window.gDocsifyPlugins;

  let fileRoute = "";
  function plugin(hook, vm) {
    hook.beforeEach(function (html) {
      fileRoute = vm.route.path;
      return html;
    });
    hook.doneEach(function () {
      modifyDocsifyLink();
    });
  }
  function modifyDocsifyLink() {
    const links = document.querySelectorAll("a.Docsify");
    links.forEach((link) => {
      const anchor = link.attributes.href.value;
      link.href = "#" + fileRoute + anchor;
    });
  }
  function install() {
    docsifyPlugins.push(plugin);
  }
  install();
})();
