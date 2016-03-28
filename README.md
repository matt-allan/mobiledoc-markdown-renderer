## Mobiledoc Markdown Renderer

This is a markdown renderer for the [Mobiledoc format](https://github.com/bustlelabs/mobiledoc-kit/blob/master/MOBILEDOC.md) used
by [Mobiledoc-Kit](https://github.com/bustlelabs/mobiledoc-kit).

To learn more about Mobiledoc cards and renderers, see the **[Mobiledoc Cards docs](https://github.com/bustlelabs/mobiledoc-kit/blob/master/CARDS.md)**.

The renderer is a small library intended for use in servers that are building
markdown documents. It may be of limited use inside browsers as well.

### Usage

```javascript
var mobiledoc = {
  "version": "0.3.0",
  "atoms": [],
  "cards": [],
  "markups": [
    [
      "strong"
    ]
  ],
  "sections": [
    [
      1,
      "p",
      [
        [
          0,
          [],
          0,
          "Hello "
        ],
        [
          0,
          [
            0
          ],
          1,
          "world!"
        ]
      ]
    ]
  ]
};
var renderer = new MobiledocMarkdownRenderer({cards: []});
var rendered = renderer.render(mobiledoc);
console.log(rendererd.result); // "Hello **world!**"
```
The Renderer constructor accepts a single object with the following optional properties:
  * `cards` [array] - The list of card objects that the renderer may encounter in the mobiledoc
  * `cardOptions` [object] - Options to pass to cards when they are rendered
  * `unknownCardHandler` [function] - Will be called when any unknown card is enountered
  * `unknownAtomHandler` [function] - Will be called when any unknown atom is enountered

The return value from `renderer.render(mobiledoc)` is an object with two properties:
  * `result` [string] - The rendered result
  * `teardown` [function] - When called, this function will tear down the rendered mobiledoc and call any teardown handlers that were registered by cards when they were rendered

### Tests

Command-line:

 * `npm test`

Or in the browser:

 * `broccoli serve`
 * visit http://localhost:4200/tests


### Credits

This library is based on the [mobiledoc-html-renderer](https://github.com/bustlelabs/mobiledoc-html-renderer) by Cory Forsyth.
