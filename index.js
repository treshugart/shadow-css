const cached = {};
const native =
  typeof customElements !== "undefined" &&
  customElements.define.toString().indexOf("native code") > -1;
const regexClassName = /^\s*\.([a-zA-Z0-9]+)/g;
const regexHostBare = /:host([\s\{])/g;
const regexHostContext = /:host-context\(([^)]+)\)/g;
const regexHostSelector = /:host\(([^)]+)\)/g;

let scope = 0;
export default function css(str) {
  return function parse(host) {
    if (native) {
      return str;
    }

    const { localName } = host;

    // Set up initial caches for this host.
    if (!cached[localName]) {
      cached[localName] = {};
    }

    // Already parsed. Already inserted.
    if (cached[localName][str]) {
      host.setAttribute(`__scope-${cached[localName][str]}`, "");
      return;
    } else {
      cached[localName][str] = ++scope;
      host.setAttribute(`__scope-${cached[localName][str]}`, "");
    }

    // Parse.
    const hostSelector = `[__scope-${cached[localName][str]}]`;
    let parsed = str;
    parsed = parsed.replace(regexClassName, `${hostSelector} .$1`);
    parsed = parsed.replace(regexHostBare, `${hostSelector}$1`);
    parsed = parsed.replace(regexHostContext, `$1 ${hostSelector}`);
    parsed = parsed.replace(regexHostSelector, `${hostSelector}$1`);

    // Insert styles to head.
    const style = document.createElement("style");
    style.setAttribute("scope", scope);
    style.textContent = parsed;
    document.head.appendChild(style);
  };
}
