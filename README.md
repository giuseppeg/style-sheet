# StyleSheet ⚡️💨

<a href="https://travis-ci.org/giuseppeg/style-sheet"><img alt="Build Status" src="https://travis-ci.org/giuseppeg/style-sheet.svg?branch=master"></a> <a href="https://github.com/giuseppeg/style-sheet"><img width="18px" height="18px" alt="source code" src="https://github.com/fluidicon.png"></a>

StyleSheet is a library to author styles in JavaScript.

It is **fast** and generates optimized, tiny bundles by compiling rules to **atomic CSS** that can then be **extracted to .css file** with a Babel plugin.

[Play with StyleSheet on **CodeSandbox**](https://codesandbox.io/s/crazy-dubinsky-nrs7n?fontsize=14)!

```js
import { StyleSheet, StyleResolver } from 'style-sheet'

const styles = StyleSheet.create({
  one: {
    color: 'red',
  },
  another: {
    color: 'green'
  }
})

const className = StyleResolver.resolve([styles.one, styles.another])
```

Instead of making use of the Cascade, StyleSheet resolves styles deterministically based on their application order.

```js
StyleResolver.resolve([styles.one, styles.another])
// color is green

StyleResolver.resolve([styles.another, styles.one])
// color is red
```

`StyleResolver.resolve` works like `Object.assign` and merges rules right to left.

StyleSheet comes with built-in support for pseudo classes and media queries, i18n, React and customizable `css` prop.

The StyleSheet library API is highly inspired to React Native and React Native for Web's and implements a styling solution that is similar to the one used in the new facebook.com website:

> This sounds very similar to what we use internally at Facebook for the new version of the site :) &quot;Atomic&quot; CSS via a CSS-in-JS library, that&#39;s extracted to static CSS files.
[Building the New facebook.com](https://developers.facebook.com/videos/2019/building-the-new-facebookcom-with-react-graphql-and-relay/) touches on it (around 28:40 in the video).</p>&mdash; Daniel Lo Nigro (@Daniel15) Software Engineer at Facebook
> [August 12, 2019](https://twitter.com/Daniel15/status/1160980442041896961)

<img width="500" alt="" role="presentation" src="https://user-images.githubusercontent.com/711311/65828122-b704e080-e297-11e9-9659-4c177b60b42e.png">

## Getting started

Firstly, install the package:

```
npm i --save style-sheet
```

The package exposes a `StyleSheet` and `StyleResolver` instances that are used to respectively create rulesets and resolve (apply) them to class names.

```js
import { StyleSheet, StyleResolver } from 'style-sheet'
```

Use `StyleSheet.create` to create a style object of rules.

```js
const styles = StyleSheet.create({
  one: {
    color: 'red',
  },
  another: {
    color: 'green'
  }
})
```

And `StyleResolver.resolve` to consume the `styles`:

```js
StyleResolver.resolve([styles.one, styles.another])
```

Remember the order in which you pass rules to `StyleResolver.resolve` matters!

### Pseudo classes, media queries and other *selectors*

StyleSheet supports simple state selectors, media queries and shallow combinator selectors like:

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

## Styles resolution

`StyleSheet.create` converts rules to arrays of atomic CSS classes. Every atomic CSS class corresponds to a declaration inside of the rule:

```js
const rules = StyleSheet.create({
  rule: {
    display: 'block', // declaration
    color: 'green'    // declaration
  }
})
```

`StyleResolver.resolve` then, accepts a single rule or an array of rules and it will merge them deterministically in application order (left to right). Finally it inserts the computed styles into the page.

To make sure that styles are resolved deterministically some rules apply:

1. Shorthand properties are inserted first.
2. Longhand properties override shorthands, always!
3. States are sorted as follow: `link`, `visited`, `hover`, `focus-within`, `focus-visible`, `focus`, `active` meaning that `active` overrides `focus` and `hover` for example.
4. Shorthand and longhand properties used inside of combinator selectors are inserted after their corrispective regular groups.
5. Media queries are sorted in a mobile first manner.

For simplicity sake, generally we encourage not use these advanced selectors and simply resolve rules conditionally at runtime based on application state. Note that this won't stop you from extracting styles to .css file!


## Server side rendering

To render on the server, you can access the underlying style sheet that the library is using at any time with `StyleResolver.getStyleSheet()`.

This method returns an ordered StyleSheet that exploses two methods:

* `getTextContent` to get the atomic CSS for the rules that have been resolved.
* `flush` to `getTextContent` and clear the stylesheet - useful when a server deamon is rendering multiple pages.

```js
import { StyleResolver } from 'style-sheet'

const html = `
<!doctype html>
<html>
  <head>
    <meta charset=utf-8>
    <title>my app</title>
    <style id="__style_sheet__">${StyleResolver.getStyleSheet().flush()}</style>
  </head>
  <body>
    <main>${renderedHTML}</main>
  </body>
</html>
`
```

By setting the `id` attribute to `__style_sheet__` StyleSheet can hydrate styles automatically on the client.

## Extracting to static .css file

StyleSheet comes with a Babel plugin that can extract static rules. This means that your styles are not computed at runtime or in JavaScript and can be served via `link` tag.

Just add `style-sheet/babel` to `plugins` in your babel configuration:

```json
{
  "plugins": [
    "style-sheet/babel"
  ]
}
```

and compile your JavaScript files with Babel.

Once Babel is done compiling you can import the `getCss` function from `style-sheet/babel` to get the extracted CSS:

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
+    <link id="__style_sheet__" rel="stylesheet" href="./build/bundle.css">
  </head>
  <body>
    <main>${renderedHTML}</main>
  </body>
</html>
`
```

Note that StyleSheet **can also reconcile extracted styles!!!** You just need to make sure that the `link` tag has the `__style_sheet__` set, and keep in mind that CORS apply.

When the Babel plugin can't resolve styles to static, it flags them as dynamic and it leaves them in JavaScript. For this reason it is always a good idea to define dynamic styles in separate rules.

### Configuration

By default the plugin looks for references to `StyleSheet` when they are imported from `style-sheet`. However both can be configured, via plugin options:

* `importName` - default is `StyleSheet` and the plugin looks for `StyleSheet.create`.
* `packageName` - default is `style-sheet` but when using advanced features (see below) you can point to your custom setup.
* `stylePropName` - default is `css`. In React the plugin looks for inline styles defined via this prop and extracts them.
* `stylePropPackageName` - mandatory. When using the style prop you need to set this path to point to where you setup your custom `createElement` (see below).
* `rtl` - boolean. When set generates I18n styles and extracts them too.

```json
{
  "plugins": [
    [
      "style-sheet/babel",
      {
        "importName": "StyleSheet",
        "packageName": "./path/to/customInstance",
        "stylePropName": "css",
        "stylePropPackageName": "./path/to/createElement.js",
        "rtl": true
      }
    ]
  ]
}
```

This is useful when StyleSheet is useds in custom ways like described in the advanced usage section.

### Extracting styles with webpack

In your webpack configuration create a small plugin to wrap the `getCss` function:

```js
const styleSheet = require('style-sheet/babel')
const { RawSource } = require('webpack-sources')

const bundleFilenamePath = 'style-sheet-bundle.css'
class StyleSheetPlugin {
  apply(compiler) {
    compiler.plugin('emit', (compilation, cb) => {
      compilation.assets[bundleFilenamePath] = new RawSource(styleSheet.getCss())
      cb()
    })
  }
}
```

and register an instance of it in the `plugins` section of the webpack configuration:

```js
// class StyleSheetPlugin {
// ...
// }

module.exports = {
  // ...
  module: {
    rules: {
      test: /\.jsx?$/,
      use: {
        loader: 'babel-loader',
        options: {
          plugins: [styleSheet.default]
        }
      }
    }
  },
  plugins: [
    new StyleSheetPlugin()
  ],
  // ...
}
```

Remember to also register the Babel plugin if you are using Babel via webpack.

That's it! webpack will write `bundleFilenamePath` in your public assets folder.

## Advanced usage

StyleSheet ships with CommonJS, ESM and UMD bundles respectively available at:

* `lib/cjs`
* `lib/esm`
* `lib/umd`

Throughout the readme we will use `lib/esm` in the examples that require you to point to individual modules manually.

StyleSheet comes with a factory to generate an instance of `StyleSheet` and `StyleResolver`. The factory available at `style-sheet/lib/umd/factory` and can be used to have fine control over the style sheets creation and support unusual cases like rendering inside of iframes.

More documentation to come, please refer to the implementation in `src/factory.js` and see how it is used in `src/index.js`.

## Using StyleSheet with React

StyleSheet is framework agnostic but it works well with React.

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
    color: 'red',
  },
  another: {
    color: 'green'
  }
})
```

### The style (`css`) prop

StyleSheet provides an helper to create a custom `createElement` function that adds support for a styling prop to React. By default this prop is called `css` (but its name can be configured) and it allows you to define "inline styles" that get compiled to real CSS and removed from the element. These are also vendor prefixed and scoped.

Note that when applying styles, `className` takes always precedence over the style prop. This allows parent components to pass styles such as overrides to children.

To use this feature you need to create an empty file in your project, name it `createElement.js` and add the following code:

```jsx
import * as StyleSheet from 'style-sheet'
import setup from 'style-sheet/lib/esm/createElement'

const stylePropName = 'css'
export const createElement = setup(StyleSheet, stylePropName)
```

and then instruct Babel to use this method instead of the default `React.createElement`. This can be done in two ways:

* Adding the `/* @jsx createElement */` at the top of every file

```jsx
/* @jsx createElement */

import React from 'react'
import createElement from './path/to/createElement.js'

export default ({ children }) => (
  <div css={{ color: 'red' }}>{children}</div>
)
```

* In your Babel configuration

```js
{
  "plugins": [
    ["@babel/plugin-transform-react-jsx", {
      "pragma": "createElement" // React will use style-sheet's createElement
    }],
    ["style-sheet/babel", {
      "stylePropName": "css",
      "stylePropPackageName": "./path/to/createElement.js"
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
        "pragma": "createElement" // React will use style-sheet's createElement
      }
    ]
  ],
  "plugins": [
    ["style-sheet/babel", {
      "stylePropName": "css",
      "stylePropPackageName": "./path/to/createElement.js"
    }]
  ]
}
```

When possible, the Babel plugin will hoist and extract to .css file the style prop!

## i18n

StyleSheet comes with built-in support for i18n and RTL.

In order for i18n to work StyleSheet requires you to define and set an i18n manager that is an object with two properties:

```js
import { setI18nManager } from 'style-sheet'
const i18nManager = {
  isRTL: true, // Boolean
  doLeftAndRightSwapInRTL: true // Boolean
}

setI18nManager(i18nManager)
```

In your app you can then toggle `isRTL` and (important) you need to re-render the application yourself i.e. `isRTL` is not a reactive property and styles don't resolve automatically when you change direction in the i18n manager. In a React application the i18n manager would likely be kept in state and consumed via context.

I18n works with server side rendering and static extraction too!


## Contributing

Please refer to the [contributing guidelines document](https://github.com/giuseppeg/contributing).

### Roadmap

Feel free to contact [me](https://twitter.com/giuseppegurgone) if you want to help with any of the following tasks (sorted in terms on priority/dependency):

- [ ] Find a better/smaller deterministic name scheme for classes (right now it is `dss_hashedProperty-hashedValue`)
- [ ] Consider adding support for i18n properties like `marginHorizontal`
- [ ] Add support for `StyleSheet.createPrimitive` (or `createRule`) to generate non-atomic rules that can be used for the primitives' base styling (and avoid too many atomic classes on elements)

## Credits

Thanks to:

* [Matt Hamlin](https://twitter.com/immatthamlin) for transferring ownership of the npm package to us.
* [Callstack.io/linaria](https://github.com/callstack/linaria/issues/242) for providing the evaluation library to extract styles to static.

## License

MIT
