/* global QUnit */
import Renderer from 'mobiledoc-markdown-renderer';
import ImageCard from 'mobiledoc-markdown-renderer/cards/image';
import {
  MARKUP_SECTION_TYPE,
  LIST_SECTION_TYPE,
  CARD_SECTION_TYPE,
  IMAGE_SECTION_TYPE
} from 'mobiledoc-markdown-renderer/utils/section-types';

const { test, module } = QUnit;
const MOBILEDOC_VERSION = '0.2.0';
const dataUri = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";

let renderer;
module('Unit: Mobiledoc Markdown Renderer - 0.2', {
  beforeEach() {
    renderer = new Renderer();
  }
});

test('renders an empty mobiledoc', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [], // markers
      []  // sections
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);

  assert.equal(rendered, '', 'output is empty');
});

test('renders a mobiledoc without markups', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [], // markers
      [   // sections
        [MARKUP_SECTION_TYPE, 'P', [
          [[], 0, 'hello world']]
        ]
      ]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered,
               'hello world\n');
});

test('renders a mobiledoc with simple (no attributes) markup', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [        // markups
        ['B'],
      ],
      [        // sections
        [MARKUP_SECTION_TYPE, 'P', [
          [[0], 1, 'hello world']]
        ]
      ]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered, '**hello world**\n');
});

test('renders a mobiledoc with complex (has attributes) markup', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [        // markers
        ['A', ['href', 'http://google.com']],
      ],
      [        // sections
        [MARKUP_SECTION_TYPE, 'P', [
            [[0], 1, 'hello world']
        ]]
      ]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered, '[hello world](http://google.com)\n');
});

test('renders a mobiledoc with multiple markups in a section', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [        // markers
        ['B'],
        ['I']
      ],
      [        // sections
        [MARKUP_SECTION_TYPE, 'P', [
          [[0], 0, 'hello '], // b
          [[1], 0, 'brave '], // b+i
          [[], 1, 'new '], // close i
          [[], 1, 'world'] // close b
        ]]
      ]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered, '**hello *brave new *world**\n');
});

test('renders a mobiledoc with image section', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],      // markers
      [        // sections
        [IMAGE_SECTION_TYPE, dataUri]
      ]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered, `![](${dataUri})`);
});

test('renders a mobiledoc with built-in image card', (assert) => {
  assert.expect(1);
  let cardName = ImageCard.name;
  let payload = { src: dataUri };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],      // markers
      [        // sections
        [CARD_SECTION_TYPE, cardName, payload]
      ]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);

  assert.equal(rendered, `![](${dataUri})`);
});

test('render mobiledoc with list section and list items', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [LIST_SECTION_TYPE, 'ul', [
          [[[], 0, 'first item']],
          [[[], 0, 'second item']]
        ]]
      ]
    ]
  };
  const { result: rendered } = renderer.render(mobiledoc);

  assert.equal(rendered,
               '* first item\n* second item\n');
});

test('renders a mobiledoc with card section', (assert) => {
  assert.expect(6);

  let cardName = 'title-card';
  let expectedPayload = {};
  let expectedOptions = {};
  let titleCard = {
    name: cardName,
    type: 'markdown',
    render: ({env, payload, options}) => {
      assert.deepEqual(payload, expectedPayload, 'correct payload');
      assert.deepEqual(options, expectedOptions, 'correct options');
      assert.equal(env.name, cardName, 'correct name');
      assert.ok(!env.isInEditor, 'isInEditor correct');
      assert.ok(!!env.onTeardown, 'has onTeardown hook');

      return 'Howdy friend';
    }
  };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],      // markers
      [        // sections
        [CARD_SECTION_TYPE, cardName, expectedPayload]
      ]
    ]
  };
  renderer = new Renderer({cards: [titleCard], cardOptions: expectedOptions});
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered, 'Howdy friend');
});

test('throws when given invalid card type', (assert) => {
  let card = {
    name: 'bad',
    type: 'other',
    render() {}
  };
  assert.throws(
    () => { new Renderer({cards:[card]}) }, // jshint ignore:line
    /Card "bad" must be of type "markdown"/);
});

test('throws when given card without `render`', (assert) => {
  let card = {
    name: 'bad',
    type: 'markdown',
    render: undefined
  };
  assert.throws(
    () => { new Renderer({cards:[card]}) }, // jshint ignore:line
    /Card "bad" must define.*render/);
});

test('throws if card render returns invalid result', (assert) => {
  let card = {
    name: 'bad',
    type: 'markdown',
    render() {
      return Object.create(null);
    }
  };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [], // markers
      [[CARD_SECTION_TYPE, card.name]]  // sections
    ]
  };
  renderer = new Renderer({cards: [card]});
  assert.throws(
    () => renderer.render(mobiledoc),
    /Card "bad" must render markdown/
  );
});

test('card may render nothing', (assert) => {
  let card = {
    name: 'ok',
    type: 'markdown',
    render() {}
  };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [CARD_SECTION_TYPE, card.name]
      ]
    ]
  };

  renderer = new Renderer({cards:[card]});
  renderer.render(mobiledoc);

  assert.ok(true, 'No error thrown');
});

test('rendering nested mobiledocs in cards', (assert) => {
  let cards = [{
    name: 'nested-card',
    type: 'markdown',
    render({payload}) {
      let {result: rendered} = renderer.render(payload.mobiledoc);
      return rendered;
    }
  }];

  let innerMobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [], // markers
      [   // sections
        [MARKUP_SECTION_TYPE, 'P', [
          [[], 0, 'hello world']]
        ]
      ]
    ]
  };

  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [], // markers
      [   // sections
        [CARD_SECTION_TYPE, 'nested-card', {mobiledoc: innerMobiledoc}]
      ]
    ]
  };

  renderer = new Renderer({cards});
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered, 'hello world\n');
});

test('rendering unknown card without unknownCardHandler throws', (assert) => {
  let cardName = 'missing-card';
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],      // markers
      [        // sections
        [CARD_SECTION_TYPE, cardName]
      ]
    ]
  };
  renderer = new Renderer({cards: [], unknownCardHandler: undefined});

  assert.throws(
    () => renderer.render(mobiledoc),
    /Card "missing-card" not found.*no unknownCardHandler/
  );
});

test('rendering unknown card uses unknownCardHandler', (assert) => {
  assert.expect(5);

  let cardName = 'missing-card';
  let expectedPayload = {};
  let cardOptions = {};
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],      // markers
      [        // sections
        [CARD_SECTION_TYPE, cardName, expectedPayload]
      ]
    ]
  };
  let unknownCardHandler = ({env, payload, options}) => {
    assert.equal(env.name, cardName, 'correct name');
    assert.ok(!env.isInEditor, 'correct isInEditor');
    assert.ok(!!env.onTeardown, 'onTeardown hook exists');

    assert.deepEqual(payload, expectedPayload, 'correct payload');
    assert.deepEqual(options, cardOptions, 'correct options');
  };
  renderer = new Renderer({cards: [], unknownCardHandler, cardOptions});
  renderer.render(mobiledoc);
});

test('throws if given an object of cards', (assert) => {
  let cards = {};
  assert.throws(
    () => { new Renderer({cards}) }, // jshint ignore: line
    new RegExp('`cards` must be passed as an array')
  );
});

test('teardown hook calls registered teardown methods', (assert) => {
  let didTeardown;
  let card = {
    name: 'hasteardown',
    type: 'markdown',
    render({env}) {
      env.onTeardown(() => didTeardown = true);
    }
  };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [], // markers
      [[CARD_SECTION_TYPE, card.name]]  // sections
    ]
  };
  renderer = new Renderer({cards: [card]});
  let { teardown } = renderer.render(mobiledoc);

  assert.ok(!didTeardown, 'precond - no teardown yet');

  teardown();

  assert.ok(didTeardown, 'teardown hook called');
});

test('throws when given an unexpected mobiledoc version', (assert) => {
  let mobiledoc = {
    version: '0.1.0',
    sections: [
      [], []
    ]
  };
  assert.throws(
    () => renderer.render(mobiledoc),
    /Unexpected Mobiledoc version.*0.1.0/);

  mobiledoc.version = '0.2.1';
  assert.throws(
    () => renderer.render(mobiledoc),
    /Unexpected Mobiledoc version.*0.2.1/);
});

test('XSS: unexpected markup and list section tag names are not renderered', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [MARKUP_SECTION_TYPE, 'script', [
          [[], 0, 'alert("markup section XSS")']
        ]],
        [LIST_SECTION_TYPE, 'script', [
          [[[], 0, 'alert("list section XSS")']]
        ]]
      ]
    ]
  };
  let { result } = renderer.render(mobiledoc);
  assert.ok(result.indexOf('script') === -1, 'no script tag rendered');
});

test('XSS: unexpected markup types are not rendered', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [
        ['b'], // valid
        ['em'], // valid
        ['script'] // invalid
      ],
      [
        [MARKUP_SECTION_TYPE, 'p', [
          [[0], 0, 'bold text'],
          [[1,2], 3, 'alert("markup XSS")'],
          [[], 0, 'plain text']
        ]]
      ]
    ]
  };
  let { result } = renderer.render(mobiledoc);
  assert.ok(result.indexOf('script') === -1, 'no script tag rendered');
});
