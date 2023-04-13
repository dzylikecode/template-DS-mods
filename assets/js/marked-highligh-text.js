(function () {
  const markedPlugins = window.gMarkedPlugins;

  const extension = {
    name: "hightlightText",
    level: "inline",
    start(src) {
      let index = src.match(/=/)?.index;
      return index;
    },
    tokenizer(src, tokens) {
      const blockRule = /^==((\\.|[^\\])*?)==/;
      let match;
      if ((match = blockRule.exec(src))) {
        return {
          type: "hightlightText",
          raw: match[0],
          text: match[1].trim(),
        };
      }
    },
    renderer(token) {
      return `<mark>${token.text}</mark>`;
    },
  };

  markedPlugins.push(extension);
  return;
})();
