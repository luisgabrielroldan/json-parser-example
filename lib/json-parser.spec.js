import { describe, it, expect } from 'vitest'
import { Value, Integer, Array, Float, Attributes, QuotedString, KeyValue, JSONObject } from './json-parser'

describe('QuotedString', () => {
  it('matches a string surrounded by quotes', () => {
    expect(QuotedString('""')).toEqual({ ok: true, value: '', rest: '' })
    expect(QuotedString('"hello"')).toEqual({ ok: true, value: 'hello', rest: '' })
    expect(QuotedString('"hello" world')).toEqual({ ok: true, value: 'hello', rest: ' world' })
    expect(QuotedString('hello')).toEqual({ ok: false, msg: 'Expected "' })
  })

  it('matches a string with escaped quotes', () => {
    expect(QuotedString('"\\""')).toEqual({ ok: true, value: '\\"', rest: '' })
  })
})

describe('Integer', () => {
  it('matches an integer', () => {
    expect(Integer('123')).toEqual({ ok: true, value: 123, rest: '' })
  })
  it('matches a negative integer', () => {
    expect(Integer('-123')).toEqual({ ok: true, value: -123, rest: '' })
  })
})

describe('Float', () => {
  it('matches a float', () => {
    expect(Float('123.45')).toEqual({ ok: true, value: 123.45, rest: '' })
  })
  it('matches a negative float', () => {
    expect(Float('-123.45')).toEqual({ ok: true, value: -123.45, rest: '' })
  })
  it('matches a scientific notation float', () => {
    expect(Float('1.23e4')).toEqual({ ok: true, value: 12300, rest: '' })
    expect(Float('1.23e-4')).toEqual({ ok: true, value: 0.000123, rest: '' })
    expect(Float('1.23e+4')).toEqual({ ok: true, value: 12300, rest: '' })
  })
})

describe('Array', () => {
  it('matches an empty array', () => {
    expect(Array('[]')).toEqual({ ok: true, value: [], rest: '' })
  })
  it('matches an array with one element', () => {
    expect(Array('[1]')).toEqual({ ok: true, value: [1], rest: '' })
  })
  it('matches an array with multiple elements', () => {
    expect(Array('[1, 2, 3]')).toEqual({ ok: true, value: [1, 2, 3], rest: '' })
  })
  it('matches an array with nested arrays', () => {
    expect(Array('[[1], [2, 3]]')).toEqual({ ok: true, value: [[1], [2, 3]], rest: '' })
  })
  it('matches an array with nested objects', () => {
    expect(Array('[{"key": "value"}, {"key": "value"}]')).toEqual({
      ok: true,
      value: [{ key: 'value' }, { key: 'value' }],
      rest: ''
    })
  })
  it('matches an array with whitespaces', () => {
    expect(Array('[ 1, 2, 3 ]')).toEqual({ ok: true, value: [1, 2, 3], rest: '' })
  })
  it('matches an array with nested arrays and whitespaces', () => {
    expect(Array('[ [1], [2, 3] ]')).toEqual({ ok: true, value: [[1], [2, 3]], rest: '' })
  })
  it('fails when the array is not closed', () => {
    expect(Array('[')).toEqual({ ok: false, msg: 'Expected ]' })
  })
  it('fails when the inner array is not closed', () => {
    expect(Array('[1, [2, 3]')).toEqual({ ok: false, msg: 'Expected ]' })
  })
})

describe('Value', () => {
  it('matches a quoted string', () => {
    expect(Value('"hello"')).toEqual({ ok: true, value: 'hello', rest: '' })
  })
  it('matches an integer', () => {
    expect(Value('123')).toEqual({ ok: true, value: 123, rest: '' })
  })
  it('matches a JSON object', () => {
    expect(Value('{"key": "value"}')).toEqual({
      ok: true, value: { key: 'value' }, rest: ''
    })
  })
  it('matches an array', () => {
    expect(Value('[1, 2, 3]')).toEqual({ ok: true, value: [1, 2, 3], rest: '' })
  })

})

describe('KeyValue', () => {
  it('matches a key value pair', () => {
    expect(KeyValue('"key": "value"')).toEqual({
      ok: true, value: {
        type: 'key-value',
        key: 'key',
        value: 'value'
      }, rest: '' 
    })
  })
})

describe('Attributes', () => {
  it('matches a single key value pair', () => {
    expect(
      Attributes('"key1": "value1"')
    ).toEqual({
        ok: true,
        value: { key1: 'value1' }, 
        rest: ''
      })
  })

  it('matches multiple key value pairs', () => {
    expect(
      Attributes('"key1": "value1", "key2": 234')
    ).toEqual({
        ok: true,
        value: {
          key1: 'value1',
          key2: 234
        }, 
        rest: ''
      })
  })
})

describe('JSONObject', () => {
  it('fails when the input is not an object', () => {
    expect(JSONObject('123')).toEqual({ ok: false, msg: 'Expected {' })
  })
  it('fails when the object is not closed', () => {
    expect(JSONObject('{')).toEqual({ ok: false, msg: 'Expected }' })
  })
  // it('fails when inner array is not closed', () => {
  //   expect(JSONObject('{ "key": [1, 2, 3 }')).toEqual({ ok: false, msg: 'Expected ]' })
  // })

  it('matches an empty object', () => {
    expect(JSONObject('{}')).toEqual({
      ok: true,
      value: {},
      rest: ''
    })
  })
  it('matches an empty object and whitespaces', () => {
    expect(JSONObject('{   }')).toEqual({
      ok: true, 
      value: {},
      rest: ''
    })
  })
  it('matches an object with one attribute', () => {
    expect(JSONObject('{"key": "value"}')).toEqual({
      ok: true,
      value: { key: 'value' },
      rest: ''
    })
  })
  it('matches an object with multiple attributes', () => {
    expect(JSONObject('{"key1": "value1", "key2": "value2"}')).toEqual({
      ok: true,
      value: {
        key1: 'value1',
        key2: 'value2'
      },
      rest: ''
    })
  })
  it('matches an object with whitespaces and multiple attributes', () => {
    expect(JSONObject('  {   "key1": "value1", "key2": "value2"   }')).toEqual({
      ok: true,
      value: {
        key1: 'value1',
        key2: 'value2'
      },
      rest: ''
    })
  })
  it('matches an object with nested objects', () => {
    const str = `{
"key1": "value1",
"key2": {
"key3": "value3"
}
}`

    expect(JSONObject(str)).toEqual({
      ok: true,
      value: {
        key1: 'value1',
        key2: {
          key3: 'value3'
        }
      },
      rest: ''
    })
  })
})

