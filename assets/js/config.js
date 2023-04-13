window.gReposLink = `https://github.com/${window.gUserName}/${window.gReposName}`;
window.gBlobLink = `${window.gReposLink}/blob/${window.gBranchName}/`;
window.gDocsifyPlugins = [];
window.gDocsifyRender = { code: {} };
window.gMarkedPlugins = [];
window.gMarked = null;
// window.gPageLink =
//   window.location.origin +
//   window.location.pathname.slice(
//     0,
//     window.location.pathname.lastIndexOf("/") + 1
//   );
window.gPageLink = window.location.origin + window.location.pathname;
