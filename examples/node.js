import HtmlExtract from '../dist/html-extract.mjs';

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

const he = new HtmlExtract(HTML);

const result = he.query('.link :href');

console.log(result);
