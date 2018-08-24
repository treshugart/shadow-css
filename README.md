# shadow-css

Maybefill your Shadow DOM styles in 500 bytes!

- `:host` and `:host-context` support.
- Class name scoping.
- If native Shadow DOM is supported, styles are passed through.

## Install

```
npm install shadow-css --save
```

## Usage

```js
import css from "shadow-css";

const styles = css(`
  :host {
    display: block;
  }
  .some-class {
    background-color: blue;
  }
`);

class Test extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>${styles(this)}</style>
      <span class="some-class">This is scoped!</span>
    `;
  }
}
```
