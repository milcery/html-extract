import Base from './Base';
import type { RootElement } from './types';

class HtmlExtract extends Base {
  constructor(HTML: unknown, rootElement: RootElement  = 'body') {
    super();

    // @ts-ignore
    if (typeof globalThis.jQuery !== 'function') {
      throw new Error('jQuery not found');
    }

    // @ts-ignore
    this.jq = globalThis.jQuery;
    this.rootEle = rootElement;
    this._env = 'browser';
  }
}

export default HtmlExtract;
