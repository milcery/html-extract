# @celebi/cheerio-extract

Get information using the string of the specified rule

## Usage

```html
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
import CheerioExtract from '@celebi/cheerio-extract';  // ES module
// const CheerioExtract = require('@celebi/cheerio-extract').default; // Commonjs

const ce = new CheerioExtract(HTML);

// Get data
ce.query();
// Add custom function
ce.useFilter();
```


## Grammar
- Attribute related `:AttributeName`, case: `:href`
- Remove dom `-Tag`, case `-p` Remove p tag
- Filter method: `| functionName(parameter1, ..., parameterN)`, case: `| prefix(a, b)`
  Other forms `| functionName((parameter1), ..., (parameterN))` Parameter wrap(), `| functionName` no parameters required

### attribute

```javascript
ce.query('.link :href')               // output -> //github.com
ce.query('.link :data-id')            // output -> link
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
ce.query('.link | text')              // output -> Github
ce.query('dd | html')                 // output -> <p>content</p>
```

### delete dom
```javascript
ce.query('section -u | text | trim');        // output -> prefixsuffix
```

### add prefix or suffix
```javascript
ce.query('.link :href | prefix(https:)')                     // output -> https://github.com
ce.query('.link :href | suffix(?q=123)')                     // output -> //github.com?q=123
ce.query('.link :href | prefix(https:) | suffix(?q=123)')    // output -> https://github.com?q=123
```

### eq
```javascript
ce.query('ul li:eq(2) :data-index')        // output -> 3
ce.query('ul li | eq(2) :data-index')      // output -> 3
```

### filter text

```javascript
ce.query('ul li:eq(2) a :href')                    // output -> //a.com/id1/103
// Filter out '1' and '/'
ce.query('ul li:eq(2) a :href | filter(1, /)')     // output -> a.comid03
```


### list

grammar
- Get one: `| array(Rule)`
- Two-dimensional array: `| array((Rule1), (Rule2))`
- Object data: `| array(Key1 => (Rule1), Key2 => (Rule2))`

Get one

```javascript
ce.query('ul li | array(| text | trim)')

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
ce.query('ul li | array((:data-index), (a | text))')

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
ce.query('ul a | array(href => (:href | prefix(https:)), title => (| text))')

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
ce.useFilter('prefixAndSuffix', (val, prefix, suffix) => prefix + val + suffix)

ce.query('.link :href | prefixAndSuffix(https:, ?q=123)')   // output -> https://github.com?q=123
```


