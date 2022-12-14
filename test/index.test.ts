import CheerioExtract from '../src/index';

const HTML = `
<div>
  <a id="link" class="link" href="//github.com" data-id="link">Github</a>

  <dl>
    <dt>title</dt>
    <dd><p>content</p></dd>
  </dl>

  <section>
    prefix<u>123</u>suffix
  </section>

  <ul>
    <li data-index="1">
      <a href="//a.com/id1/101">(1)</a>
    </li>
    <li data-index="2">
      <a href="//a.com/id1/102">(2)</a>
    </li>
    <li data-index="3">
      <a href="//a.com/id1/103">(3)</a>
    </li>
    <li data-index="4">
      <a href="//a.com/id1/104">(4)</a>
    </li>
  </ul>
</div>
`;

describe('Test CheerioExtract', () => {
  let ce = new CheerioExtract(HTML);

  beforeEach(() => {
    ce = new CheerioExtract(HTML);
  });

  it('Class selector', () => {
    const result = ce.query('.link :href');
    expect(result).toBe('//github.com');
  });

  it('Id selector', () => {
    const result = ce.query('#link :href');
    expect(result).toBe('//github.com');
  });

  it('Get Properties', () => {
    const result = ce.query('.link :href');
    expect(result).toBe('//github.com');
  });

  it('Get custom properties', () => {
    const result = ce.query('.link :data-id');
    expect(result).toBe('link');
  });

  it('Get text', () => {
    const result = ce.query('.link | text');
    expect(result).toBe('Github');
  });

  it('Get html', () => {
    const result = ce.query('dd | html');
    expect(result).toBe('<p>content</p>');
  });

  it('trim', () => {
    const result = ce.query('section | text | trim');
    expect(result).toBe('prefix123suffix');
  });

  it('Add prefix', () => {
    const result = ce.query('.link :href | prefix(https:)');
    expect(result).toBe('https://github.com');
  });

  it('Add suffix', () => {
    const result = ce.query('.link :href | suffix(?q=123)');
    expect(result).toBe('//github.com?q=123');
  });

  it('Remove dom', () => {
    const result = ce.query('section -u | text | trim');
    expect(result).toBe('prefixsuffix');
  });

  it('Specify subscript 1', () => {
    const result = ce.query('ul li:eq(2) :data-index');
    expect(result).toBe('3');
  });

  it('Specify subscript 2', () => {
    const result = ce.query('ul li | eq(2) :data-index');
    expect(result).toBe('3');
  });

  it('Filter text', () => {
    const result = ce.query('section | text | trim | filter(f, i, x)');

    expect(result).toBe('pre123su');
  });

  it('Filter text2', () => {
    const result = ce.query('ul li:eq(2) a :href | filter(/, 1)');

    expect(result).toBe('a.comid03');
  });

  it('list1', () => {
    const arr = [
      '(1)',
      '(2)',
      '(3)',
      '(4)'
    ];
    const result = ce.query('ul li | array(| text | trim)');

    // @ts-ignore
    result.forEach((t: string, index: number) => {
      expect(t).toEqual(arr[index]);
    });
  });

  it('list2', () => {
    const arr = [
      ['1', '(1)'],
      ['2', '(2)'],
      ['3', '(3)'],
      ['4', '(4)']
    ];
    const result = ce.query('ul li | array((:data-index), (a | text))');

    // @ts-ignore
    result.forEach((t: string, index: number) => {
      expect(t[0]).toEqual(arr[index][0]);
      expect(t[1]).toEqual(arr[index][1]);
    });
  });

  it('list3', () => {
    interface Obj {
      title: string;
      href: string;
    }
    const arr: Array<Obj> = [
      { href: 'https://a.com/id1/101', title: '(1)' },
      { href: 'https://a.com/id1/102', title: '(2)' },
      { href: 'https://a.com/id1/103', title: '(3)' },
      { href: 'https://a.com/id1/104', title: '(4)' },
    ];
    const result = ce.query('ul a | array(href => (:href | prefix(https:)), title => (| text))');

    // @ts-ignore
    result.forEach((t: Obj, index: number) => {
      expect(t.href).toEqual(arr[index].href);
      expect(t.title).toEqual(arr[index].title);
    });
  });

  it('Custom Filters', () => {
    ce.useFilter('prefixAndSuffix', (str: any, p: any, s: any): any => p + str + s);

    const result = ce.query('.link :href | prefixAndSuffix(https:, ?q=123)');
    expect(result).toBe('https://github.com?q=123');
  });
});
