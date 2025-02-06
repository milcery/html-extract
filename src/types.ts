

export type RootElement = string | HTMLElement;

export type Result = JQuery | ArrData | string[][] | string | null;

export type Rule = string;

export type ObjData = {
  [key: number]: unknown;
}
export type ArrData = ObjData[] | string[] | string[][];

// type Func = ($1: JQuery | string, $2?: number | Rule[] | ObjData) => string | JQuery | ArrData;
export type Func = <T>(...p: unknown[]) => T;

export type FilterFunc = _FilterFunc & {
  [key: string]: Func;
};

export interface _FilterFunc {
  html: (jq: JQuery) => string;
  text: (jq: JQuery) => string;
  eq: (jq: JQuery, index: number) => JQuery;
  trim: (str: string) => string;
  prefix: (str: string, prefix: string) => string;
  suffix: (str: string, suffix: string) => string;
  filter: (str: string, ...arr: string[]) => string;
  array: (jq: JQuery, str: Rule[] | ObjData) => ArrData;
}
