(function () {
  const markedPlugins = window.gMarkedPlugins;

  const extension = {
    name: "code-doc",
    level: "inline",
    start(src) {
      let index = src.match(/[@#]/)?.index;
      return index;
    },
    tokenizer(src, tokens) {
      const popupRule = /^@([^\s,]+)/;
      let match;
      if ((match = popupRule.exec(src))) {
        return {
          type: "code-doc",
          raw: match[0],
          text: match[1].replace(/\\/g, ""),
        };
      }
    },
    renderer(token) {
      return `<span class="pop-up" data-id="${token.text}">${token.text}</span>`;
    },
  };

  markedPlugins.push(extension);
  return;
})();

(function () {
  const docsifyPlugins = window.gDocsifyPlugins;
  const pageLink = window.gPageLink;
  const blobLink = window.gBlobLink;
  /**
   * @type {{docs:string, code:string, cache:string, exclude: string[], global: string[], ext:string}[]}
   */
  const codeDocMaps = window.gCodeDocMaps;
  const remoteRepos = window.gRemoteRepos ?? [];
  // 引用 window.gMarked, 开始的时候是 null

  let isLoaded = false;
  let cacheVar = {};
  const docsCache = {
    cur: null,
    global: [],
    as: {},
    deps: [],
  };

  class Container {
    constructor() {
      this.container = document.createElement("div");
      this.container.classList.add("pop-up-container");
      this.body = document.querySelector("body");
      const onMouseOut = (e) => {
        // mouse out 不是进入自己, 则隐藏
        if (!this.container.contains(e.relatedTarget)) {
          this.hide();
        }
      };
      this.container.addEventListener("mouseout", onMouseOut);
      this.container.onwheel = (e) => e.stopPropagation();
    }

    setContent(content) {
      this.container.innerHTML = content;
    }

    show() {
      this.body.appendChild(this.container);
    }

    hide() {
      this.container.remove();
    }
    /**
     *
     *
     * @param {HTMLElement} elem
     */
    setMouseOver(elem) {
      const onMouseOver = (e) => {
        // see https://javascript.info/event-delegation#tooltip-behavior
        const {
          left: elemLeft,
          top: elemTop,
          height: elemHeight,
        } = elem.getBoundingClientRect();
        const description = elem.dataset?.id
          ? getContent(elem.dataset.id)
          : getModuleContent(elem.dataset.path);
        this.setContent(description);
        // 需要先显示才能计算出 Client Rect
        this.show();
        const { height: containerHeight } =
          this.container.getBoundingClientRect();
        this.container.style.left = `${elemLeft}px`;
        // 显示在上面
        let top = elemTop - containerHeight;
        if (top < 0) {
          // 显示在下面
          top = elemTop + elemHeight;
        }
        this.container.style.top = `${top}px`;
      };
      elem.addEventListener("mouseover", onMouseOver);
      function getContent(id) {
        if (cacheVar?.[id]) {
          return cacheVar[id];
        }
        const content = searchContent(id);
        cacheVar[id] = content;
        return content;
      }
      function searchContent(id) {
        if (!isLoaded) return "Loading...<br> Try again";

        {
          const firstSplit = id.indexOf("-");
          if (firstSplit != -1) {
            const aliasName = id.slice(0, firstSplit);
            const m = docsCache.as?.[aliasName];
            if (m) {
              const realId = m.ret + id.slice(firstSplit);
              const v = m.extern.find((val) => val.id == realId);
              if (v) {
                const name = v.id;
                const virtualName = m.id;
                const anchor = realId;
                const content = v.info;
                return prettyContent(name, virtualName, anchor, content, m);
              } else return "Not found";
            }
          }
        }

        {
          const v = docsCache.cur.local.find((val) => val.id == id);
          if (v) {
            const name = v.id;
            const virtualName = docsCache.cur.id;
            const anchor = name;
            const content = v.info;
            return prettyContent(
              name,
              virtualName,
              anchor,
              content,
              docsCache.cur
            );
          }
        }

        {
          const v = docsCache.cur.extern.find((val) => val.id == id);
          if (v) {
            const name = v.id;
            const virtualName = docsCache.cur.id;
            const anchor = name;
            const content = v.info;
            return prettyContent(
              name,
              virtualName,
              anchor,
              content,
              docsCache.cur
            );
          }
        }

        {
          for (const m of docsCache.deps) {
            const v = m.extern.find((val) => val.id == id);
            if (v) {
              const name = v.id;
              const virtualName = m.id;
              const anchor = name;
              const content = v.info;
              return prettyContent(name, virtualName, anchor, content, m);
            }
          }
        }

        {
          for (const m of docsCache.global) {
            const v = m.extern.find((val) => val.id == id);
            if (v) {
              const name = v.id;
              const virtualName = m.id;
              const anchor = name;
              const content = v.info;
              return prettyContent(name, virtualName, anchor, content, m);
            }
          }
        }

        return "Not Found";

        function prettyContent(name, virtualName, anchor, content, m) {
          return window.gMarked.parse(
            `${name}: ${getLocation(virtualName, anchor, m)}<br>${content}`
          );
        }

        function getLocation(virtualName, anchor, m) {
          const docsHref = `${getDocsPath(
            m.repos,
            virtualName
          )}#${anchor.toLowerCase()}`;
          return `<a class="docs" href="${docsHref}">${anchor}</a> <a class="code" href="${getCodePath(
            m.repos,
            virtualName
          )}" target="_blank">code</a>`;
        }
      }

      function getModuleContent(mName) {
        if (!isLoaded) return "Loading...<br> Try again";

        {
          const m = docsCache.deps.find((m) => m.id == mName);
          if (m) {
            const name = m.id;
            const virtualName = m.id;
            const content = m.info;
            return prettyContent(name, virtualName, content, m);
          }
        }

        {
          const m = docsCache.global.find((m) => m.id == mName);
          if (m) {
            const name = m.id;
            const virtualName = m.id;
            const content = m.info;
            return prettyContent(name, virtualName, content, m);
          }
        }

        {
          const m = docsCache.as.keys().find((m) => m.id == mName);
          if (m) {
            const name = m.id;
            const virtualName = m.id;
            const content = m.info;
            return prettyContent(name, virtualName, content, m);
          }
        }

        function prettyContent(name, virtualName, content, m) {
          return window.gMarked.parse(
            `${name}: ${getLocation(virtualName, m)}<br>${content}`
          );
        }

        function getLocation(virtualName, m) {
          const docsHref = `${getDocsPath(m.repos, virtualName)}`;
          return `<a class="docs" href="${docsHref}">${virtualName}</a> <a class="code" href="${getCodePath(
            m.repos,
            virtualName
          )}" target="_blank">code</a>`;
        }
      }
    }

    setMouseOut(elem) {
      const onMouseOut = (e) => {
        // 如果进入的不是 container, 则隐藏
        if (!this.container.contains(e.relatedTarget)) {
          this.hide();
        }
      };
      elem.addEventListener("mouseout", onMouseOut);
    }

    attachTo(element) {
      this.setMouseOver(element);
      this.setMouseOut(element);
    }
  }

  function plugin(hook, vm) {
    let container = null;
    const dependencyRule = /- .*?require\s"(.+)"/g;
    hook.beforeEach(function (html) {
      const fileRoute = vm.route.file;
      const res = mapToVirtual(fileRoute);
      if (!res) return html;
      isLoaded = false;
      const allRepos = [res.repos, ...remoteRepos];
      cacheVar = {};
      fetchCache(res);
      const viewCode = `[:rocket: VIEW CODE](${getCodePath(
        res.repos,
        res.virtualName
      )})`;
      return (
        viewCode +
        html.replace(dependencyRule, (match, p1) => {
          const link = `<span class="pop-up" data-path="${p1}">${p1}</span>`;
          return match.replace(p1, link);
        })
      );

      async function fetchCache(src) {
        const cacheFilePath = getCachePath(src.repos, src.virtualName);
        const res = await fetch(cacheFilePath);
        const global = src.global;
        if (!res.ok) return;
        docsCache.cur = JSON.parse(await res.text());
        docsCache.cur.repos = src.repos;
        docsCache.deps = [];
        for (const virtualName of docsCache.cur.deps) {
          for (const repos of allRepos) {
            const fullPath = getCachePath(repos, virtualName);
            const res = await fetch(fullPath);
            if (!res.ok) continue;
            const obj = JSON.parse(await res.text());
            obj.repos = repos;
            docsCache.deps.push(obj);
            break;
          }
        }
        docsCache.global = [];
        for (const virtualName of global) {
          for (const repos of allRepos) {
            const fullPath = getCachePath(repos, virtualName);
            const res = await fetch(fullPath);
            if (!res.ok) continue;
            const obj = JSON.parse(await res.text());
            obj.repos = repos;
            docsCache.global.push(obj);
            break;
          }
        }
        docsCache.as = {};
        for (const [asName, virtualName] of Object.entries(docsCache.cur.as)) {
          for (const repos of allRepos) {
            const fullPath = getCachePath(repos, virtualName);
            const res = await fetch(fullPath);
            if (!res.ok) continue;
            const obj = JSON.parse(await res.text());
            obj.repos = repos;
            docsCache.as[asName] = obj;
            break;
          }
        }

        isLoaded = true;
      }
    });
    hook.doneEach(function () {
      if (!container) container = new Container();
      const popUps = document.querySelectorAll(".pop-up");
      popUps.forEach(container.attachTo.bind(container));
    });
  }

  function install() {
    docsifyPlugins.push(plugin);
  }

  /**
   *
   * @param {string} fileRoute
   * @returns
   */
  function mapToVirtual(fileRoute) {
    const match = codeDocMaps.find((m) => fileRoute.startsWith(m.docs));
    if (!match) return;
    const virtualName = fileRoute.slice(match.docs.length, -".md".length);
    if (isExcludedFile(virtualName)) return;
    const cache = `${pageLink}${match.cache}`;
    const code = `${blobLink}${match.code}`;
    const docs = `${pageLink}#/${match.docs}`;

    return {
      virtualName,
      repos: { docs, code, cache, ext: match.ext },
      global: match.global,
    };

    /**
     *
     * @param {string} virtualName
     * @returns
     */
    function isExcludedFile(virtualName) {
      return match.exclude.some((e) => virtualName.startsWith(e));
    }
  }

  function getCodePath(repos, virtualName) {
    return `${repos.code}${virtualName}${repos.ext}`;
  }

  function getDocsPath(repos, virtualName) {
    return `${repos.docs}${virtualName}`;
  }

  function getCachePath(repos, virtualName) {
    return `${repos.cache}${virtualName}.json`;
  }

  install();
})();
