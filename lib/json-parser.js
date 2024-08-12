import { Whitespace, Literal, Digit, LiteralFromChars, Alphanumeric, AnyOf, ZeroOrMore, Map, AndThen } from './grammar'

export const Symbol = LiteralFromChars('!@#$%^&*()_+-=[]{}|;:,.<>?/\\')
export const EscapedQuote = Literal('\\"')
export const Quote = Literal('"')
export const StringContent = AnyOf(
  Alphanumeric,
  EscapedQuote,
  Symbol,
)
export const QuotedString = Map(AndThen(
  Quote,
  ZeroOrMore(StringContent),
  Quote
), ({ value: [_qs, content, _qe] }) => {
    return content.flat(Infinity).join('')
})

export const Minus = Literal('-')
export const Plus = Literal('+')

export const Integer = Map(AndThen(
  ZeroOrMore(Minus),
  Digit,
  ZeroOrMore(Digit)
), ({ value }) => {
    return parseInt(value.flat(Infinity).join(''))
})

export const FloatSimple = Map(AndThen(
  Integer,
  AndThen(
    Literal('.'),
    Integer
  )
), ({ value }) => {
    return parseFloat(value.flat(Infinity).join(''))
})

export const FloatScientific = Map(AndThen(
  AnyOf(
    FloatSimple,
    Integer
  ),
  Literal('e'),
  AnyOf(
    Integer,
    AndThen(
      Plus,
      Integer
    ),
    AndThen(
      Minus,
      Integer
    ),
  )
), ({ value }) => {
    return parseFloat(value.flat(Infinity).join(''))
})

export const Float = AnyOf(
  FloatScientific,
  FloatSimple
)

export const CommaSeparatedValues = Map(AndThen(
  (input) => Value(input),
  ZeroOrMore(
    AndThen(
      Literal(','),
      ZeroOrMore(Whitespace),
      (input) => Value(input)
    )
  )
), ({ value: [first, rest] }) => {
    let values = [first]

    for (let [,,e] of rest) {
      values.push(e)
    }

    return values
  })


export const Array = Map(AndThen(
  Literal('['),
  ZeroOrMore(Whitespace),
  ZeroOrMore(CommaSeparatedValues),
  ZeroOrMore(Whitespace),
  Literal(']')
), ({ value }) => {
  return value[2].flat(1)
})

export const Value = AnyOf(
  (input) => JSONObject(input),
  Array,
  QuotedString,
  Integer
)

export const KeyValue = Map(AndThen(
  QuotedString,
  ZeroOrMore(Whitespace),
  Literal(':'),
  ZeroOrMore(Whitespace),
  Value
), ({ value }) => {
    const objKey = value[0]
    const objValue = value[4]
    return {
      type: 'key-value',
      key: objKey,
      value: objValue
    }
})

export const Attributes = Map(AndThen(
  KeyValue,
  ZeroOrMore(
    AndThen(
      Literal(','),
      ZeroOrMore(Whitespace),
      KeyValue
    )
  )
), ({ value }) => {
    let attrs = {}

    if (value.length === 0) {
      return attrs
    }

    const [first, ...rest] = value
    attrs[first.key] = first.value

    for (let e of rest.flat(Infinity)) {
      if (typeof e === 'object') {
        attrs[e.key] = e.value
      }
    }

    return attrs
})


export const JSONObject = Map(AndThen(
  ZeroOrMore(Whitespace),
  Literal('{'),
  ZeroOrMore(Whitespace),
  ZeroOrMore(Attributes),
  ZeroOrMore(Whitespace),
  Literal('}'),
), ({ value: [_a, _b, _c, content] }) => {
    const attrs = content.length === 0 ? {} : content[0]
    return attrs
})
