/**
 * <a class="Repos" target="_blank" href="../example/animation/static-anim/js/main.js">code</a> -> 指向github repos
 * <a class="Pages" target="_blank" href="../example/animation/static-anim/js/main.js">code</a> -> 指向github pages
 */
(function () {
  const docsifyPlugins = window.gDocsifyPlugins;
  const blobLink = window.gBlobLink; // github 需要最后的/, 而live server 不需要, 无妨
  const pageLink = window.gPageLink;

  let blobFile;
  let blobFileDir;
  let pageFile;
  let pageFileDir;
  function plugin(hook, vm) {
    hook.beforeEach(function (html) {
      blobFile = blobLink + vm.route.file;
      const DirRoute = vm.route.file.slice(
        0,
        vm.route.file.lastIndexOf("/") + 1
      );
      blobFileDir = blobLink + DirRoute;
      pageFile = pageLink + vm.route.file;
      pageFileDir = pageLink + DirRoute;
      return html;
    });
    hook.doneEach(function () {
      modifyReposLink();
      modifyPagesLink();
      modifyImageLink();
    });
  }

  function modifyReposLink() {
    const links = document.querySelectorAll("a.Repos");
    links.forEach((link) => {
      const url = link.attributes.href.value;
      if (isRelative(url)) {
        link.href = blobFileDir + url;
      } else {
        link.href = blobLink + url.slice(1);
      }
    });
  }
  function modifyPagesLink() {
    const links = document.querySelectorAll("a.Pages");
    links.forEach((link) => {
      const url = link.attributes.href.value;
      if (isRelative(url)) {
        link.href = pageFileDir + url;
      } else {
        link.href = pageLink + url.slice(1);
      }
    });
  }
  function modifyImageLink() {
    const links = document.querySelectorAll("img.Pages");
    links.forEach((link) => {
      const url = link.attributes.src.value;
      if (isRelative(url)) {
        link.src = pageFileDir + url;
      } else {
        link.src = pageLink + url.slice(1);
      }
    });
  }

  function isRelative(url) {
    return url[0] != "/";
  }

  function install() {
    docsifyPlugins.push(plugin);
  }

  install();
})();
