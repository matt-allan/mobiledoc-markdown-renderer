class Element {
  constructor(tagName) {
    this.tagName = tagName.toLowerCase();
    this.childNodes = [];
    this.attributes = [];
  }

  appendChild(element) {
    this.childNodes.push(element);
  }

  setAttribute(propName, propValue) {
    this.attributes.push(propName, propValue);
  }

  toString() {

    let markdown = '';

    // opening tags
    switch (this.tagName.toLowerCase()) {
      case 'b':
      case 'strong':
        markdown += '**';
        break;
      case 'i':
      case 'em':
        markdown += '*';
        break;
      case 'h1':
        markdown += '# ';
        break;
      case 'h2':
        markdown += '## ';
        break;
      case 'h3':
        markdown += '### ';
        break;
      case 'h4':
        markdown += '#### ';
        break;
      case 'a':
        markdown += '[';
        break;
      case 'img':
        markdown += '![';
        break;
      case 'li':
        if (this.attributes.indexOf('position') !== -1) {
          let positionIndex = this.attributes.indexOf('position') + 1;
          let position = this.attributes[positionIndex];
          markdown += position + '. ';
        } else {
          markdown += '* ';
        }
        break;
      case 'blockquote':
        markdown += '> ';
        break;
    }

    // child nodes
    for (let i=0; i<this.childNodes.length; i++) {
      markdown += this.childNodes[i].toString();
    }

    // closing tags
    switch (this.tagName.toLowerCase()) {
      case 'b':
      case 'strong':
        markdown += '**';
        break;
      case 'i':
      case 'em':
        markdown += '*';
        break;
      case 'a':
        markdown += ']';
        if (this.attributes.indexOf('href') !== -1) {
          let urlIndex = this.attributes.indexOf('href') + 1;
          markdown += '(' + this.attributes[urlIndex] + ')';
        }
        break;
      case 'img':
        markdown += ']';
        if (this.attributes.indexOf('src') !== -1) {
          let srcIndex = this.attributes.indexOf('src') + 1;
          markdown += '(' + this.attributes[srcIndex] + ')';
        }
        break;
      case 'li':
        markdown += '\n';
        break;
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'p':
      case 'blockquote':
        markdown += '\n';
        break;
    }

    return markdown;
  }
}

class TextNode {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return this.value;
  }
}

export function createElement(tagName) {
  return new Element(tagName);
}

export function appendChild(target, child) {
  target.appendChild(child);
}

export function createTextNode(text) {
  return new TextNode(text);
}

export function setAttribute(element, propName, propValue) {
  element.setAttribute(propName, propValue);
}

export function createDocumentFragment() {
  return createElement('div');
}

export function normalizeTagName(name) {
  return name.toLowerCase();
}
