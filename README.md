# style-sheet

[![Build Status](https://travis-ci.org/giuseppeg/style-sheet.svg?branch=master)](https://travis-ci.org/giuseppeg/style-sheet)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Fast CSS in JS library with support for static CSS extraction.

With a React Native like API, compiles rules to atomic CSS classes for fast performance even at runtime! While the API is inspired to the React Native one the library can be used with any framework or vanilla js.

## Getting started

Firstly, install the package:

```
npm i --save style-sheet
```

The package exposes a `StyleSheet` and `StyleResolver` instances that are used to respectively create rulesets and resolve (apply) them to class names:

```js
import { StyleSheet, StyleResolver } from 'style-sheet'

const styles = StyleSheet.create({
  root: {
    display: 'block',
    color: 'red',
  },
  another: {
    marginTop: 10,
    color: 'green'
  }
})

const className = StyleResolver.resolve([styles.root, styles.another])

console.log(`<div class="${className)}"></div>`)
```

`StyleResolver.resolve` can accept a single rule or an array of rules and it will merge them deterministically in application order (left to right). Finally it inserts the computed styles into the page.

### Pseudo classes, media queries and other features

`style-sheet` supports simple state selectors, media queries and shallow combinator selectors like:

```js
const styles = StyleSheet.create({
  root: {
    color: 'red',
    '&:hover' { // state selector
      color: 'green'
    },
    ':focus > &': { // shallow combinator selector
      color: 'green'
    },
    ':focus + &': { // shallow combinator selector
      color: 'blue'
    },
    '@media (min-width: 678px)': { // media query
      color: 'yellow'
    }
  },
})
```

When possible though we suggest to define separate rules and apply (resolve) them conditionally.

## Server side rendering

The library exports a `flushServer` function that can be used for server side rendering.

When called, `flushServer` returns an array with two objects. Each object contains an `id` and a `css` property. The `css` contains the rendered styles whereas the `id` should be set on the `style` tag so that `style-sheet` can reconcile the styles on the client.

The reason why `flushServer` returns two objects is that `style-sheet` creates a separate stylesheet for media queries which should be rendereded after regular rules to preserve specificity.

```js
import { flushServer } from 'style-sheet'

const styleTags = flushServer().map(style => {
  return `<style id="${style.id}">${style.css}</style>`
}).join('\n')

const html = `
<!doctype html>
<html>
  <head>
    <meta charset=utf-8>
    <title>my app</title>
    ${styleTags}
  </head>
  <body>
    <main>${renderedHTML}</main>
  </body>
</html>
`
```

## Extracting to static

(experimental)

`style-sheet` comes with a Babel plugin that can extract static CSS. This means that your styles are not computed at runtime or in JavaScript and can be served via `link` tag.

Just add `style-sheet/babel` to `plugins` in your babel configuration:

```json
{
  "plugins": [
    "style-sheet/babel"
  ]
}
```

and compile your JavaScript files with Babel.

Once Babel is done compiling you can import `getCss` from `style-sheet/babel` to get the extracted CSS:

```js
import { writeFileSync } from 'fs'
import { getCss } from 'style-sheet/babel'

const bundleFilePath = './build/bundle.css'
writeFileSync(bundleFilePath, getCss())
```

In your page then you can reference the `bundleFilePath`:

```diff
const html = `
<!doctype html>
<html>
  <head>
    <meta charset=utf-8>
    <title>my app</title>
+    <link id="__style_sheet_extracted__" rel="stylesheet" href="./build/bundle.css">
  </head>
  <body>
    <main>${renderedHTML}</main>
  </body>
</html>
`
```

Note that `style-sheet` **can also reconcile extracted styles!!!** You just need to make sure that the `link` tag has the `__style_sheet_extracted__` set.

When the Babel plugin can't resolve styles to static it flags them as dynamic and it leaves them in JavaScript. For this reason it is always a good idea to define dynamic styles in separate rules.

### Configuration

By default the plugin looks for references to `StyleSheet` when they are imported from `style-sheet`. However both can be configured, via plugin options:

* `importName`
* `packageName`

```json
{
  "plugins": [
    [
      "style-sheet/babel",
      {
        "importName": "create",
        "packageName": "../lib/customInstance"
      }
    ]
  ]
}
```

This is useful when `style-sheet` is using in custom ways like described in the advanced section.

## Advanced usage

This library comes with a factory that is available at `style-sheet/factory` and a server package `style-sheet/server`. These can be used to have full control over the style sheets creation and to support unusual cases like rendering inside of iframes.

More documentation to come, please refer at the implementation in `src/factory.js`.

## Using style-sheet with React

style-sheet is framework agnostic but it works well with React.

```jsx
import React from 'react'
import { StyleSheet, StyleResolver } from 'style-sheet'

export default ({ children }) => {
  const className = StyleResolver.resolve([styles.root, styles.another])
  return (
    <div className={className}>{children}</div>
  )
}

const styles = StyleSheet.create({
  root: {
    display: 'block',
    color: 'red',
  },
  another: {
    marginTop: 10,
    color: 'green'
  }
})
```

### The `css` prop

(experimental)

style-sheet provides a custom `createElement` function that adds support for a `css` prop to React. This prop allows you to define "inline styles" that get compiled to real CSS and removed from the element. These are also vendor prefixed and scoped.

Note that `className` takes always precedence over the `css` prop when merging the styles. This allows parent components to pass styles such as overrides to children.

To use this feature you need to `import { createElement } from 'style-sheet'` and instructing Babel to use this method instead of the default `React.createElement`. This can be done in two ways:

* Adding the `/* @jsx createElement */` at the top of every file

```jsx
/* @jsx createElement */

import React from 'react'
import { StyleSheet, StyleResolver, createElement } from 'style-sheet'

export default ({ children }) => (
  <div css={{ color: 'red' }}>{children}</div>
)
```

* In your Babel configuration

```js
{
  "plugins": [
    ["@babel/plugin-transform-react-jsx", {
      "pragma": "createElement", // React will use style-sheet's createElement
    }]
  ]
}
```

or if you use `@babel/preset-react`

```js
{
  "presets": [
    [
      "@babel/preset-react",
      {
        "pragma": "createElement", // React will use style-sheet's createElement
      }
    ]
  ]
}
```

Note that currently the `css` props works only at runtime and styles defined with it cannot be extracted to static. We are going to add extraction soon though, it is just a matter of (free) time!

## Contributing

Since this is a side project and we don't want to burn out, we decided to disable the GitHub issues.

### Bugs

If you find a bug please submit a pull request with a failing test or a fix, and good description for the issue.

### Features request

Please submit a pull request with an RFC where you explain the why and the how you think this feature is useful. We'd be glad to start a conversation from there before moving on to implementation. Also please let us know if you would be up to implement the feature you are suggesting.

## Credits

Thanks to:

* [Matt Hamlin](https://twitter.com/immatthamlin) for transferring ownership of the npm package to us.
* [Callstack.io/linaria](https://github.com/callstack/linaria/issues/242) for providing the evaluation library to extract styles to static.

## License

MIT
