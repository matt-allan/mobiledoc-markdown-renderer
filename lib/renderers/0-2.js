import {
  createElement,
  createTextNode,
  createDocumentFragment,
  setAttribute,
  appendChild
} from '../utils/dom';
import ImageCard from '../cards/image';
import RENDER_TYPE from '../utils/render-type';
import {
  MARKUP_SECTION_TYPE,
  IMAGE_SECTION_TYPE,
  LIST_SECTION_TYPE,
  CARD_SECTION_TYPE
} from '../utils/section-types';
import {
  isValidSectionTagName,
  isValidMarkerType
} from '../utils/tag-names';

export const MOBILEDOC_VERSION = '0.2.0';

/**
 * runtime Markdown renderer
 * renders a mobiledoc to Markdown (string)
 *
 * input: mobiledoc
 * output: Markdown (string)
 */

function createElementFromMarkerType([tagName, attributes]=['', []]) {
  let element = createElement(tagName);
  attributes = attributes || [];

  for (let i=0,l=attributes.length; i<l; i=i+2) {
    let propName = attributes[i],
        propValue = attributes[i+1];
    setAttribute(element, propName, propValue);
  }
  return element;
}

function validateVersion(version) {
  if (version !== MOBILEDOC_VERSION) {
    throw new Error(`Unexpected Mobiledoc version "${version}"`);
  }
}

export default class Renderer {
  constructor(mobiledoc, state) {
    let {
      cards,
      cardOptions,
      unknownCardHandler
    } = state;
    let {
      version,
      sections: sectionData
    } = mobiledoc;
    validateVersion(version);

    const [markerTypes, sections] = sectionData;

    this.root               = createDocumentFragment();
    this.markerTypes        = markerTypes;
    this.sections           = sections;
    this.cards              = cards;
    this.cardOptions        = cardOptions;
    this.unknownCardHandler = unknownCardHandler || this._defaultUnknownCardHandler;

    this._teardownCallbacks  = [];
  }

  get _defaultUnknownCardHandler() {
    return ({env: {name}}) => {
      throw new Error(`Card "${name}" not found but no unknownCardHandler was registered`);
    };
  }

  render() {
    this.sections.forEach((section) => {
      let rendered = this.renderSection(section);
      if (rendered) {
        appendChild(this.root, rendered);
      }
    });

    return { result: this.root.toString(), teardown: () => this.teardown() };
  }

  teardown() {
    for (let i=0; i < this._teardownCallbacks.length; i++) {
      this._teardownCallbacks[i]();
    }
  }

  renderSection(section) {
    const [type] = section;
    switch (type) {
      case MARKUP_SECTION_TYPE:
        return this.renderMarkupSection(section);
      case IMAGE_SECTION_TYPE:
        return this.renderImageSection(section);
      case LIST_SECTION_TYPE:
        return this.renderListSection(section);
      case CARD_SECTION_TYPE:
        return this.renderCardSection(section);
      default:
        throw new Error(`Renderer cannot render type "${type}"`);
    }
  }

  renderListSection([type, tagName, items]) {
    if (!isValidSectionTagName(tagName, LIST_SECTION_TYPE)) {
      return;
    }
    const element = createElement(tagName);
    if (tagName.toLowerCase() === 'ol') {
      for (let i=0; i < items.length; i++) {
        let li = items[i];
        appendChild(element, this.renderListItem(li, i + 1));
      }
    } else {
      items.forEach(li => {
        appendChild(element, this.renderListItem(li));
      });
    }
    return element;
  }

  renderListItem(markers, position = null) {
    const element = createElement('li');
    if (position !== null) {
      setAttribute(element, 'position', position);
    }
    this._renderMarkersOnElement(element, markers);
    return element;
  }

  renderImageSection([type, url]) {
    let element = createElement('img');
    setAttribute(element, 'src', url);
    return element;
  }

  findCard(name) {
    for (let i=0; i < this.cards.length; i++) {
      if (this.cards[i].name === name) {
        return this.cards[i];
      }
    }
    if (name === ImageCard.name) {
      return ImageCard;
    }
    return this._createUnknownCard(name);
  }

  _createUnknownCard(name) {
    return {
      name,
      type: RENDER_TYPE,
      render: this.unknownCardHandler
    };
  }

  renderCardSection([type, name, payload]) {
    let card = this.findCard(name);

    let cardWrapper = this._createCardElement();
    let cardArg = this._createCardArgument(card, payload);
    let rendered = card.render(cardArg);

    this._validateCardRender(rendered, card.name);

    if (rendered) {
      appendChild(cardWrapper, rendered);
    }

    return cardWrapper;
  }

  _registerTeardownCallback(callback) {
    this._teardownCallbacks.push(callback);
  }

  _createCardArgument(card, payload={}) {
    let env = {
      name: card.name,
      isInEditor: false,
      onTeardown: (callback) => this._registerTeardownCallback(callback)
    };

    let options = this.cardOptions;

    return { env, options, payload };
  }

  _validateCardRender(rendered, cardName) {
    if (!rendered) {
      return;
    }

    if (typeof rendered !== 'string') {
      throw new Error(`Card "${cardName}" must render ${RENDER_TYPE}, but result was ${typeof rendered}"`);
    }
  }

  _createCardElement() {
    return createElement('div');
  }

  renderMarkupSection([type, tagName, markers]) {
    if (!isValidSectionTagName(tagName, MARKUP_SECTION_TYPE)) {
      return;
    }
    let renderer = createElement;
    let element = renderer(tagName);
    this._renderMarkersOnElement(element, markers);
    return element;
  }

  _renderMarkersOnElement(element, markers) {
    let elements = [element];
    let currentElement = element;

    for (let i=0, l=markers.length; i<l; i++) {
      let marker = markers[i];
      let [openTypes, closeCount, text] = marker;

      for (let j=0, m=openTypes.length; j<m; j++) {
        let markerType = this.markerTypes[openTypes[j]];
        let [tagName] = markerType;
        if (isValidMarkerType(tagName)) {
          let openedElement = createElementFromMarkerType(markerType);
          appendChild(currentElement, openedElement);
          elements.push(openedElement);
          currentElement = openedElement;
        } else {
          closeCount--;
        }
      }

      appendChild(currentElement, createTextNode(text));

      for (let j=0, m=closeCount; j<m; j++) {
        elements.pop();
        currentElement = elements[elements.length - 1];
      }
    }
  }
}
