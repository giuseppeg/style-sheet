import test from 'ava'
import validate, { shortHandProperties } from '../src/validate'

test('simple object pass validation', t => {
  t.notThrows(() => {
    validate({
      color: 'red',
    })
  })
})

test('throws when using important', t => {
  t.throws(() => {
    validate({
      color: 'red !important',
    })
  }, /important/)
})

test('throws when using shorthands values', t => {
  shortHandProperties.forEach(prop => {
    t.throws(() => {
      validate({
        [prop]: 'mock',
      })
    }, /support shorthand properties/)
  })
})

test('nested: throws when grouping selectors', t => {
  t.throws(() => {
    validate({
      'a, b': {
        color: 'red',
      },
    })
  }, /Selectors cannot be grouped/)
})

test('nested: throws when using pseudo elements', t => {
  t.throws(() => {
    validate({
      ':before': {
        color: 'red',
      },
    })
  }, /Detected pseudo-element/)

  t.throws(() => {
    validate({
      '::after': {
        color: 'red',
      },
    })
  }, /Detected pseudo-element/)
})

test('nested: throws when using an unsupported pseudo-class', t => {
  t.throws(() => {
    validate({
      '&:matches(.foo)': {
        color: 'red',
      },
    })
  }, /Detected unsupported pseudo-class/)
})

test('nested: throws when using a pseudo-class without &', t => {
  t.throws(() => {
    validate({
      ':hover': {
        color: 'red',
      },
    })
  }, /pseudo-class selector should reference its parent/)
})

test('nested: the left part of a combinator must be a pseudo-class', t => {
  t.throws(() => {
    validate({
      'foo > &': {
        color: 'red',
      },
    })
  }, /left part of a combinator selector must be a pseudo-class/)

  t.notThrows(() => {
    validate({
      ':hover > &': {
        color: 'red',
      },
    })
  })
})

test('nested: the right part of a combinator must be &', t => {
  t.throws(() => {
    validate({
      ':hover > foo': {
        color: 'red',
      },
    })
  }, /right part of a combinator selector must be `&`/)

  t.notThrows(() => {
    validate({
      ':hover > &': {
        color: 'red',
      },
    })
  })
})

test('nested: does not allow nested selectors', t => {
  t.throws(() => {
    validate({
      'foo bar': {
        color: 'red',
      },
    })
  }, /Complex selectors are not supported/)
})

test('nested: media queries work', t => {
  t.notThrows(() => {
    validate({
      '@media (min-width: 30px)': {
        color: 'red',
      },
    })
  })
})

test('nested: throws with invalid nested inside of media queries', t => {
  t.throws(() => {
    validate({
      '@media (min-width: 30px)': {
        ':hover > foo': {
          color: 'red',
        },
      },
    })
  }, /right part of a combinator selector must be `&`/)
})

test('works with array values', t => {
  t.notThrows(() => {
    validate({
      color: ['red', 'rgba(255, 0, 0, 1)'],
    })
  })
})
