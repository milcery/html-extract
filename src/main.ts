import { load } from 'cheerio';
import Base from './Base';
import type { RootElement } from './types';

class HtmlExtract extends Base {
  constructor(HTML: string, rootElement: RootElement  = 'body') {
    super();
    this.jq = load(HTML);
    this.rootEle = rootElement;
    this._env = 'node';
  }
}

export default HtmlExtract;
