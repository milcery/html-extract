# @atlach/html-extract

Get information using the string of the specified rule

## Usage

### Nodejs
```javascript
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
`
import HtmlExtract from '@atlach/html-extract';  // ES module
// const HtmlExtract = require('@atlach/html-extract').default; // Commonjs

const he = new HtmlExtract(HTML);

// Get data
he.query();
// Add custom function
he.useFilter();
```

### Browser

```html
<script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@atlach/html-extract@0.1.0/dist/html-extract.browser.js"></script>

<script>
  window.addEventListener('load', () => {
    const he = new HtmlExtract();

    // Get data
    he.query();
    // Add custom function
    he.useFilter();
  });
</script>
```


## Grammar
- Attribute related `:AttributeName`, case: `:href`
- Remove dom `-Tag`, case `-p` Remove p tag
- Filter method: `| functionName(parameter1, ..., parameterN)`, case: `| prefix(a, b)`
  Other forms `| functionName((parameter1), ..., (parameterN))` Parameter wrap(), `| functionName` no parameters required

### attribute

```javascript
he.query('.link :href')               // output -> //github.com
he.query('.link :data-id')            // output -> link
```

### Filter method

Self-filtering methods
- `| html`
- `| text`
- `| prefix`
- `| prefix`
- `| suffix`
- `| trim`
- `| eq`
- `| filter`

### html or text
```javascript
he.query('.link | text')              // output -> Github
he.query('dd | html')                 // output -> <p>content</p>
```

### delete dom
```javascript
he.query('section -u | text | trim');        // output -> prefixsuffix
```

### add prefix or suffix
```javascript
he.query('.link :href | prefix(https:)')                     // output -> https://github.com
he.query('.link :href | suffix(?q=123)')                     // output -> //github.com?q=123
he.query('.link :href | prefix(https:) | suffix(?q=123)')    // output -> https://github.com?q=123
```

### eq
```javascript
he.query('ul li:eq(2) :data-index')        // output -> 3
he.query('ul li | eq(2) :data-index')      // output -> 3
```

### filter text

```javascript
he.query('ul li:eq(2) a :href')                    // output -> //a.com/id1/103
// Filter out '1' and '/'
he.query('ul li:eq(2) a :href | filter(1, /)')     // output -> a.comid03
```


### list

grammar
- Get one: `| array(Rule)`
- Two-dimensional array: `| array((Rule1), (Rule2))`
- Object data: `| array(Key1 => (Rule1), Key2 => (Rule2))`

Get one

```javascript
he.query('ul li | array(| text | trim)')

// output ->
  [
    '(1)',
    '(2)',
    '(3)',
    '(4)'
  ]
```

Two-dimensional array
Note: The parameter is best to add `()`

```javascript
he.query('ul li | array((:data-index), (a | text))')

// output ->
  [
    ['1', '(1)'],
    ['2', '(2)'],
    ['3', '(3)'],
    ['4', '(4)']
  ];
```

Object data
=> The front is the key, => The following is the rule, the rule is best to be wrapped with ()

```javascript
he.query('ul a | array(href => (:href | prefix(https:)), title => (| text))')

// output ->
  [
    { href: 'https://a.com/id1/101', title: '(1)' },
    { href: 'https://a.com/id1/102', title: '(2)' },
    { href: 'https://a.com/id1/103', title: '(3)' },
    { href: 'https://a.com/id1/104', title: '(4)' }
  ];
```

### Custom filtering methods

```javascript
he.useFilter('prefixAndSuffix', (val, prefix, suffix) => prefix + val + suffix)

he.query('.link :href | prefixAndSuffix(https:, ?q=123)')   // output -> https://github.com?q=123
```


