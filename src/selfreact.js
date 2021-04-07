
const RENDER_TO_DOM = Symbol('renderToDom');
const RE_RENDER = Symbol('rerender');
const MERGE = Symbol('merge');

class ElementWrapper {
  constructor (tagName) {
    this.root = document.createElement(tagName);
  }
  setAttribute (name, value) {
    if (name.match(/^on([\s\S]+$)/)) {
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
  constructor (text) {
    this.root = document.createTextNode(text);
  }
  [RENDER_TO_DOM] (range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

export class Component {
  constructor () {
    this.props = Object.create(null);
    this._range = null;
    this.children = [];
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
  [RE_RENDER] () {
    const oldRange = this._range;
    const range = document.createRange();
    range.setStart(oldRange.startContainer, oldRange.startOffset);
    range.setEnd(oldRange.startContainer, oldRange.startOffset);
    this[RENDER_TO_DOM](range);
    oldRange.setStart(range.endContainer, range.endOffset);
    oldRange.deleteContents();
  }
  [MERGE] (oldState, newState) {
    Object.keys(newState).forEach(key => {
      oldState[key] = newState[key];
    })
  }
  setState (newState) {
    this[MERGE](this.state, newState);
    if (this._timer) {
      clearTimeout(this._timer);
    }
    this._timer = setTimeout(() => {
      this[RE_RENDER]();
    }, 20)
  }
}

export const createElement = (type, attrs, ...children) => {

  let e;
  if (typeof type === 'string') {
    e = new ElementWrapper(type);
  } else {
    e = new type
  }

  if (Object.prototype.toString.call(attrs) === '[object Object]') {
    Object.keys(attrs).forEach(attrName => {
      e.setAttribute(attrName, attrs[attrName]);
    })
  }
  const insetChildren = (children) => {
    for (let child of children) {
      if (typeof child === 'string' || typeof child === 'number') {
        child = new TextWrapper(String(child));
        e.appendChild(child);
        continue;
      } 
      if (Array.isArray(child)) {
        insetChildren(child);
      } else {
        if (Object.prototype.toString.call(child) === '[object Object]' && child.root instanceof HTMLElement) {
          e.appendChild(child);
        }
      }
    }
  }
  insetChildren(children);

  return e;
}

export const render = (component, parentElement) => {
  const range = document.createRange();
  range.setStart(parentElement, 0);
  range.setEnd(parentElement, parentElement.childNodes.length);
  component[RENDER_TO_DOM](range);
}