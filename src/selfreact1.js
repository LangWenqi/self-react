
class ElementWrapper {
  constructor (tagName) {
    this.root = document.createElement(tagName);
  }
  setAttribute (name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild (component) {
    this.root.appendChild(component.root);
  }
}

class TextWrapper {
  constructor (text) {
    this.root = document.createTextNode(text);
  }
}

export class Component {
  constructor () {
    this.props = Object.create(null);
    this._root = null;
    this.children = [];
  }
  setAttribute (name, value) {
    this.props[name] = value;
  }
  appendChild (component) {
    this.children.push(component);
  }
  get root () {
    if (!this._root) {
      this._root = this.render().root;
    }
    return this._root;
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
      e.setAttribute(attrName, attrs);
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
  parentElement.appendChild(component.root);
}