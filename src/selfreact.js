const RENDER_TO_DOM = Symbol('renderToDom');
const RERENDER = Symbol('rerender');
const MERGE_STATE = Symbol('mergeState');

class ElementWrapper {
  constructor (type) {
    this.root = document.createElement(type);
  }
  setAttribute (name, value) {
    if (name.match(/^on([\s\S]+)/)) {
      const evt = RegExp.$1;
      this.root.addEventListener(evt.replace(/^[\s\S]/, c => c.toLowerCase()), value);
    } else {
      this.root.setAttribute(name, value);
    }
  }
  appendChild (component) {
    const range = document.createRange();
    range.setStart(this.root, this.root.childNodes.length);
    range.setEnd(this.root, this.root.childNodes.length);
    component[RENDER_TO_DOM](range);
  }
  [RENDER_TO_DOM] (range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

class TextWrapper {
  constructor (content) {
    this.root = document.createTextNode(content);
  }
  [RENDER_TO_DOM] (range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

export class Component {
  constructor () {
    this.props = Object.create(null);
    this.children = [];
    this._range = null;
    this._timer = null;
  }
  setAttribute (name, value) {
    this.props[name] = value;
  }
  appendChild (component) {
    this.children.push(component);
  }
  [RENDER_TO_DOM] (range) {
    this._range = range;
    this.render()[RENDER_TO_DOM](range);
  }
  [MERGE_STATE] (oldState, newState) {
    Object.keys(newState).forEach(key => {
      oldState[key] = newState[key];
    })
  }
  [RERENDER] () {
    const oldRange = this._range;
    const range = document.createRange();
    range.setStart(oldRange.startContainer, oldRange.startOffset);
    range.setEnd(oldRange.startContainer, oldRange.startOffset);
    this[RENDER_TO_DOM](range);
    oldRange.setStart(range.endContainer, range.endOffset);
    oldRange.deleteContents();
  }
  setState (newState) {
    this[MERGE_STATE](this.state, newState);
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    this._timer = setTimeout(() => {
      this[RERENDER]();
      this._timer = null;
    }, 20)
  }
}
export const createElement = (type, attrs, ...children) => {
  let e;
  if (typeof type === 'string') {
    e = new ElementWrapper(type);
  } else {
    e = new type;
  }
  if (Object.prototype.toString.call(attrs) === '[object Object]') {
    Object.keys(attrs).forEach(attrName => {
      e.setAttribute(attrName, attrs[attrName]);
    })
  }
  const insertChildren = (children) => {
    for (let child of children) {
      if (typeof child === 'number' || typeof child === 'string') {
        e.appendChild(new TextWrapper(String(child)));
        continue;
      }
      if (Object.prototype.toString.call(child) === '[object Object]' && (child.root instanceof HTMLElement || child[RERENDER])) {
        e.appendChild(child);
        continue;
      }
      if (Array.isArray(child)) {
        insertChildren(child)
      }
    }
  }
  insertChildren(children);

  return e;
}

export const render = (component, parentElement) => {
  const range = document.createRange();
  range.setStart(parentElement, 0);
  range.setStart(parentElement, parentElement.childNodes.length);
  component[RENDER_TO_DOM](range);
}