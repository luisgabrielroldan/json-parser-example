const Err = (message) => {
  return {
    ok: false,
    msg: message
  }
}

const Ok = (value, rest) => {
  return {
    ok: true ,
    value: value, 
    rest: rest,
  }
}

export const ToString = (e) => {
  if (e instanceof Array) {
    return e.map(v => v.toString()).join('')
  } if (typeof e === 'string') {
    return e
  } if (typeof e === 'object' && e.value) {
    return e
  } else {
    throw new Error(`Can't convert to string!: ${JSON.stringify(e)}`)
  }
}

export const isError = (result) => {
  return !result.ok
}

export const Literal = (value) => {
  return (input) => {
    if (input.startsWith(value)) {
      return Ok(value, input.slice(value.length))
    }
    return Err(`Expected ${value}`)
  }
}

export const LiteralFromChars = (str) => {
  let parser = null

  for (let char of str) {
    if (parser) {
      parser = AnyOf(parser, Literal(char))
    } else {
      parser = Literal(char)
    }
  }

  return parser
}

export const AnyOf = (...parsers) => {
  return (input) => {
    for (let parser of parsers) {
      const result = parser(input)
      if (!isError(result)) return result
    }
    return Err('No parsers matched')
  }
}

export const AndThen = (...parsers) => {
  return (input) => {
    let results = []
    let rest = input
    for (let parser of parsers) {
      const result = parser(rest)
      if (isError(result)) return result
      results.push(result.value)
      rest = result.rest
    }
    return Ok(results, rest)
  }
}

export const ZeroOrMore = (parser) => {
  return (input) => {
    let results = []
    let rest = input

    while (true) {
      const result = parser(rest)
      if (isError(result)) break
      results.push(result.value)
      rest = result.rest
    }

    return Ok(results, rest)
  }
}

export const Map = (parser, fn) => {
  return (input) => {
    const result = parser(input)
    if (isError(result)) return result
    return Ok(fn(result), result.rest)
  }
}

export const Alpha = LiteralFromChars('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
export const Digit = LiteralFromChars('0123456789')
export const Alphanumeric = AnyOf(Alpha, Digit)
export const Whitespace = LiteralFromChars(' \t\n\r')

