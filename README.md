# Vue.js find components

Adds global helper function for finding Vue components

```js
window.vueFind ~= querySelector for VDOM
window.vueFindAll ~= querySelectorAll for VDOM

window.vueFind('Card CardDialog[model=isCardDialogVisible]').model
```

- Simple selectors:

    `window.vueFind('missing')` prints a warning with a tree of supported selectors

- Attribute selectors:

    only `[attr=fullvalue]` and `[attr="full value"]` operators are supported

- Combinators:

    simple selectors can only be combined with a descendant combinator (a space)


## Development

    npm install
    npm run dev chrome
    npm run dev firefox
    npm run dev opera
    npm run dev edge

## Build

    npm run build chrome
    npm run build firefox
    npm run build opera
    npm run build edge

## Screenshot

![Console](./console.png)
