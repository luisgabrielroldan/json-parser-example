import { describe, it, expect } from 'vitest'
import { jsonParse } from './index'

describe('jsonParse', () => {
  it('parses an empty object', () => {
    expect(jsonParse('{}')).toEqual({})
  })
  it('parses an object with one attribute', () => {
    expect(jsonParse('{"key": "value"}')).toEqual({ key: 'value' })
  })
  it('parses an object with multiple attributes', () => {
    expect(jsonParse('{"key1": "value1", "key2": "value2"}')).toEqual({key1: 'value1', key2: 'value2'})
  })
  it('parses an object with nested objects', () => {
    const str = `{
      "key1": "value1",
      "key2": {
        "key3": "value3"
      },
      "key4": {
        "key5": {
        "key6": "value6"
        }
      }
    }`

    expect(jsonParse(str)).toEqual({
      key1: 'value1',
      key2: { key3: 'value3' },
      key4: { key5: { key6: 'value6' } }
    })
  })
  it('throws an error when the input is not a valid JSON object', () => {
    expect(() => jsonParse('{')).toThrowError('Expected }')
  })

})
