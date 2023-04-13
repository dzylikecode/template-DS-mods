/**
 * markmap
 */

(function () {
  const langId = "markmap";

  let num = 0;
  let markmapSvg = [];
  const transformer = new markmap.Transformer();

  function render(code) {
    const { root: data } = transformer.transform(code);
    let currentNum = num;
    markmapSvg.push(function () {
      let elem = document.getElementById("markmap-svg-" + currentNum);
      const mm = new markmap.Markmap(elem, null);
      if (data) {
        mm.setData(data);
        const { minX, maxX, minY, maxY } = mm.state;
        const naturalWidth = maxY - minY;
        const naturalHeight = maxX - minX;
        elem.style.width = naturalWidth + "px";
        elem.style.height = naturalHeight + "px";
        mm.fit(); // always fit for the first render
      }
    });
    return `<svg class="markmap" id="markmap-svg-${num++}"></svg>`;
  }

  function plugin(hook, vm) {
    hook.beforeEach(function (html) {
      num = 0;
      markmapSvg = [];
      return html;
    });
    hook.doneEach(function () {
      markmapSvg.forEach((fn) => fn());
    });
  }

  function install() {
    window.gDocsifyRender.code[langId] = render;
    window.gDocsifyPlugins.push(plugin);
  }

  install();
})();
