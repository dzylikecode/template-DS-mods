# js

开头通过 const 来表示 import

同一命名

```js
fileRoute = "/test/test.md";
achor = "#code";
blobFile =
  "https://github.com/dzylikecode/lang-js/blob/master/docs/phaser/001-simple-game/README.md";
pageFile =
  "https://dzylikecode.github.io/lang-js/#/docs/phaser/001-simple-game/README";
```

- marked plugin: extension
- docsify plugin: plugin
- marked render: render

## global

```js
// https://github.com/dzylikecode/lang-js
window.gReposLink = `https://github.com/${window.gUserName}/${window.gReposName}`;
// https://github.com/dzylikecode/lang-js/blob/master/
window.gBlobLink = `${window.gReposLink}/blob/${window.gBranchName}/`;
// window.gPageLink =
//   window.location.origin +
//   window.location.pathname.slice(
//     0,
//     window.location.pathname.lastIndexOf("/") + 1
//   );
// https://dzylikecode.github.io/lang-js
window.gPageLink = window.location.origin + window.location.pathname;
```
