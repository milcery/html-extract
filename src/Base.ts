import type { CheerioAPI } from 'cheerio';
import type { RootElement, Rule, Result, ObjData, ArrData, Func, FilterFunc } from './types';

const INSTRUCTION: string[] = [':', '|', '-'];

class Base {
  protected _env: string;
  protected jq: CheerioAPI | JQueryStatic | JQuery;
  protected rootEle: RootElement = 'body';
  protected filterKeys: string[] = ['html', 'text', 'prefix', 'suffix', 'trim', 'eq', 'filter'];

  public get env(): string {
    return this._env;
  }

  public useFilter = (filterName: string, func: Func): void =>{
    if (this.filterKeys.indexOf(filterName) > -1) {
      console.error('[error] %s existed', filterName);
    } else {
      this.filterKeys.push(filterName);
      this.filterFunc[filterName] = func;
    }
  }

  public query = (rule: Rule = ''): Result => {
    return this._query(rule, undefined);
  }

  protected _query = (rule: Rule, dom: RootElement | JQuery | undefined): Result => {
    // @ts-ignore
    return this.splitRule(rule).reduce(this.parseRule, dom || this.jq(this.rootEle));
  }

  protected splitRule = (rule: Rule = ''): Rule[] => {
    const arr: Rule[] = rule
      .replace(/\,\s/g, ',')
      .replace(/\|\s/g, '|')
      .replace(/\s\=\>\s/g, '=>')
      .split(/\s/);

    let rules: Rule[] = [];

    const recursionSplit = (i = 0): void => {
      if (i === arr.length) {
        return;
      }

      const c: Rule = arr[i];
      const p: string[] | null = c.match(/\(/g);
      const l: string[] | null = c.match(/\)/g);

      if ((p === null && l === null) || (p && l && p.length === l.length)) {
        rules.push(c);
        recursionSplit(i + 1);
      } else {
        const x = arr.splice(i + 1, 1);
        arr[i] = c + '_~_' + x;
        recursionSplit(i);
      }
    }

    recursionSplit(0);

    return rules;
  }

  protected filter = (jq: JQuery, rule: Rule): Result => {
    const hasParams = rule.indexOf('(') > -1;

    let key: string = rule;
    let value: string = '';

    if (hasParams) {
      key = (rule.match(/^.*?(?=\()/gi))[0];
      value = rule.substring(key.length + 1, rule.length - 1);
    }

    if (this.filterKeys.indexOf(key) > -1) {
      return this.filterFunc[key](jq, ...(value.split(',')));
    }

    if (key === 'array') {
      const obj = value
        .replace(/\)\,/g, ')),')
        .split('),')
        .reduce<ObjData>((_obj, c) => {
          if (c.indexOf('=>') > -1) {
            const _val: string[] = c.split('=>');

            // @ts-ignore
            _obj[_val[0]] = _val[1].startsWith('(')
              ? _val[1].substring(1, _val[1].length - 1).replace(/\_\~\_/g, ' ')
              : _val[1].replace(/\_\~\_/g, ' ')
          }
          else {
            if (!Array.isArray(_obj)) {
              _obj = [];
            }
            (_obj as ObjData[]).push(c.startsWith('(')
              ? c.substring(1, c.length - 1).replace(/\_\~\_/g, ' ')
              : c.replace(/\_\~\_/g, ' '))
          }

          return _obj;
        }, {});

      return this.filterFunc.array(jq, obj);
    }

    return jq;
  }

  // @ts-ignore
  protected filterFunc: FilterFunc = {
    html: (jq) => jq.html(),
    text: (jq) => jq.text(),
    eq: (jq, index): JQuery => jq.eq(index),
    trim: (str) => str.trim(),
    prefix: (str, prefix) => prefix + str,
    suffix: (str, suffix) => str + suffix,
    filter: (str, ...arr): string => arr.reduce((s, a) => s.replaceAll(a, ''), str),
    array: (jq, str) => {
      let arr: ArrData = [];

      if (Array.isArray(str)) {
        arr = arr as string[];
        for (let i: number = 0, len: number = jq.length; i < len; i++) {
          // @ts-ignore
          const _val: string[] = str.reduce<Rule[]>((p, c) => {
            return p.concat(this._query(c, jq.eq(i)) as string);
          }, []);

          // @ts-ignore
          arr.push(_val.length === 1 ? _val[0] : _val);
        }

      } else if (typeof str === 'object') {
        arr = arr as ObjData[];

        const objKeys: string[] = Object.keys(str);

        for (let i: number = 0, len: number = jq.length; i < len; i++) {
          const _obj: ObjData = objKeys.reduce<ObjData>((p, c) => {
            // @ts-ignore
            p[c] = this._query(str[c], jq.eq(i));
            return p;
          }, {})

          arr.push(_obj)
        }
      }

      return arr;
    }
  }

  protected parseRule = (jq: JQuery, rule: Rule) : Result => {
    const instruction: string = rule.charAt(0);
    const field: string = rule.substring(1);

    if (INSTRUCTION.indexOf(instruction) === -1) {
      return jq.find(rule);
    }

    switch (instruction) {
      case ':':
        return jq.attr(field);
      case '-':
        return (jq.find(field).remove(), jq);
      case '|':
        return this.filter(jq, field);
      default:
        return jq;
    }
  }
}

export default Base;
