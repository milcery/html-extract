import * as cheerio from 'cheerio';
import Mint from '@celebi/mint-filter';
import parseRule from './parseRule';

import type { CheerioAPI } from 'cheerio';

const INSTRUCTION = [':', '|', '-'];

class CheerioExtract {
  private $: CheerioAPI;
  private rootElement: string;
  private FILTER = ['html', 'text', 'prefix', 'suffix', 'trim', 'eq', 'filter'];

  constructor(HTML: string, rootElement: string = 'body') {
    this.$ = cheerio.load(HTML);
    this.rootElement = rootElement;
  }

  useFilter = (filterName: string, func: unknown) => {
    if (this.FILTER.includes(filterName)) {
      console.error('[error] %s existed', filterName);
    } else {
      this.FILTER.push(filterName);
      // @ts-ignore
      this.filterFn[filterName] = func;
    }
  }

  query = <T>(rule: string = '', dom: any = undefined): T => {
    return parseRule(rule).reduce(this.parse, dom || this.$(this.rootElement));
  }

  parse = (dom: any, str: string) => {
    const instruction = str.charAt(0);
    const field = str.substr(1);

    if (!INSTRUCTION.includes(instruction)) {
      return dom.find(str);
    }

    switch (instruction) {
      case ':':
        return dom.attr(field);
      case '-':
        return (dom.find(field).remove(), dom);
      case '|':
        return this.filter(dom, field);
      default:
        return dom;
    }
  }

  filter = (dom: any, str: string) => {
    const hasParams: boolean = str.includes('(');
    const key: string = hasParams ? (str.match(/^.*?(?=\()/gi))[0] : str;
    const value: string = hasParams ? str.substring(key.length + 1, str.length - 1) : '';

    if (key === 'array') {
      let obj = value
        .replace(/\)\,/g, ')),')
        .split('),')
        .reduce((obj: any, c: string) => {
          if (c.includes('=>')) {
            const _val = c.split('=>');
            obj[_val[0]] = _val[1].charAt(0) === '('
              ? _val[1].substring(1, _val[1].length - 1).replace(/\_\~\_/g, ' ')
              : _val[1].replace(/\_\~\_/g, ' ')

          } else {
            if (!Array.isArray(obj)) {
              obj = [];
            }
            obj.push(c.charAt(0) === '('
              ? c.substring(1, c.length - 1).replace(/\_\~\_/g, ' ')
              : c.replace(/\_\~\_/g, ' '))
          }

          return obj;
        }, {});

      return this.filterFn.array(dom, obj);
    } else if (this.FILTER.includes(key)) {
      // @ts-ignore
      return this.filterFn[key](dom, ...(value.split(',')));
    } else {
      return dom
    }
  }

  filterFn = {
    html: (dom: { html: () => any; }) => dom.html(),
    text: (dom: { text: () => any; }) => dom.text(),
    eq: (dom: any, index: number) => dom.eq(index),
    trim: (prev: string) => prev.trim(),
    prefix: (prev: string, prefix: string) => prefix + prev,
    suffix: (prev: string, suffix: string) => prev + suffix,
    filter: (prev: string, ...str: (string | number)[]) => {
      return new Mint(str)
        .filterSync(prev, { replaceWith: '' })
        .text;
    },
    array: (dom: any, str: any) => {
      const arr = [];

      if (Array.isArray(str)) {
        for (let i = 0, len = dom.length; i < len; i++) {
          const val = str.reduce((p, c) => {
            p.push(this.query(c, dom.eq(i)))
            return p;
          }, []);
          arr.push(val.length === 1 ? val[0] : val);
        }
      } else if (typeof str === 'object') {
        const objKeys = Object.keys(str);
        for (let i = 0, len = dom.length; i < len; i++) {
          arr.push(objKeys.reduce((p, c) => {
            // @ts-ignore
            p[c] = this.query(str[c], dom.eq(i));
            return p;
          }, {}));
        }
      }

      return arr;
    }
  }
}

export = CheerioExtract;
