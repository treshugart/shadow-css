const cached = {};
const mapScope = new WeakMap();
const native =
  typeof customElements !== "undefined" &&
  customElements.define.toString().indexOf("native code") > -1;
const regexClassName = /^\s*\.([a-zA-Z0-9]+)/g;
const regexHostBare = /:host([\s\{])/g;
const regexHostContext = /:host-context\(([^)]+)\)/g;
const regexHostSelector = /:host\(([^)]+)\)/g;

let ids = 0;
let scopes = 0;

function appendToHead(parsed, scope) {
  const style = document.createElement("style");
  if (scope) {
    style.setAttribute("scope", scope);
  }
  style.textContent = parsed;
  document.head.appendChild(style);
}

function parse(id, css) {
  const hostSelector = `[__scope-${cached[id][css]}]`;
  let parsed = css;
  parsed = parsed.replace(regexClassName, `${hostSelector} .$1`);
  parsed = parsed.replace(regexHostBare, `${hostSelector}$1`);
  parsed = parsed.replace(regexHostContext, `$1 ${hostSelector}`);
  parsed = parsed.replace(regexHostSelector, `${hostSelector}$1`);
  return parsed;
}

export default function css(str) {
  return function(host) {
    if (native) {
      return str;
    }

    if (!host) {
      appendToHead(str);
      return;
    }

    let id = mapScope.get(host);
    if (!id) {
      mapScope.set(host, (id = ++ids));
    }

    // Set up initial caches for this host.
    if (!cached[id]) {
      cached[id] = {};
    }

    // Already parsed. Already inserted.
    if (cached[id][str]) {
      host.setAttribute(`__scope-${cached[id][str]}`, "");
      return;
    } else {
      cached[id][str] = ++scopes;
      host.setAttribute(`__scope-${cached[id][str]}`, "");
    }

    appendToHead(parse(id, str), scopes);
  };
}
