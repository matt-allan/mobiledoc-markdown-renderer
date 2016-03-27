import RendererFactory from './renderer-factory';

export function registerGlobal(window) {
  window.MobiledocMarkdownRenderer = RendererFactory;
}

import RENDER_TYPE from './utils/render-type';
export { RENDER_TYPE };

export default RendererFactory;
