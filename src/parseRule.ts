type Rules = string[];

function parseRule(rule: string): Rules {
  const arr: Rules = rule
    .replace(/\,\s/g, ',')
    .replace(/\|\s/g, '|')
    .replace(/\s\=\>\s/g, '=>')
    .split(/\s/)

  let rules: Rules = [];

  function recursion(i: number = 0): void {
    if (i === arr.length) {
      return;
    }

    const c : string = arr[i];
    const p = c.match(/\(/g);
    const l = c.match(/\)/g);

    if ((p === null && l === null) || (p && l && p.length === l.length)) {
      rules.push(c);
      recursion(i + 1);
    } else {
      const xx = arr.splice(i + 1, 1);
      arr[i] = c + '_~_' + xx;
      recursion(i);
    }
  }

  recursion();

  return rules;
}

export default parseRule;
