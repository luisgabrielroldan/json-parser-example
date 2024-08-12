import { describe, it, expect } from 'vitest'
import { Alpha, Whitespace, ZeroOrMore, Digit, Alphanumeric, Literal, LiteralFromChars, AnyOf, AndThen } from './grammar'

describe('Literal', () => {
  it('returns a parser that matches a literal character', () => {
    const A = Literal('A')

    expect(A('A')).toEqual({ ok: true, value: 'A', rest: '' })
    expect(A('AB')).toEqual({ ok: true, value: 'A', rest: 'B' })
    expect(A('B')).toEqual({ ok: false, msg: 'Expected A' })

  })
  it('returns a parser that matches a literal string', () => {
    const ABC = Literal('ABC')

    expect(ABC('ABC')).toEqual({ ok: true, value: 'ABC', rest: '' })
    expect(ABC('ABCD')).toEqual({ ok: true, value: 'ABC', rest: 'D' })
    expect(ABC('BCD')).toEqual({ ok: false, msg: 'Expected ABC' })
  })
})

describe('LiteralFromChars', () => {
  it('returns a parser that matches any of the given characters', () => {
    const SomeLetters = LiteralFromChars('ABC')

    expect(SomeLetters('A')).toEqual({ ok: true, value: 'A', rest: '' })
    expect(SomeLetters('B')).toEqual({ ok: true, value: 'B', rest: '' })
    expect(SomeLetters('C')).toEqual({ ok: true, value: 'C', rest: '' })
    expect(SomeLetters('D')).toEqual({ ok: false, msg: 'No parsers matched' })
  })
})

describe('AnyOf', () => {
  it('returns a parser that matches any of the given parsers', () => {
    const AorB = AnyOf(Literal('A'), Literal('B'))

    expect(AorB('A')).toEqual({ ok: true, value: 'A', rest: '' })
    expect(AorB('B')).toEqual({ ok: true, value: 'B', rest: '' })
    expect(AorB('C')).toEqual({ ok: false, msg: 'No parsers matched' })
    expect(AorB('AB')).toEqual({ ok: true, value: 'A', rest: 'B' })
  })
})

describe('Alpha', () => {
  it('matches any letter', () => {
    expect(Alpha('A')).toEqual({ ok: true, value: 'A', rest: '' })
    expect(Alpha('Z')).toEqual({ ok: true, value: 'Z', rest: '' })
    expect(Alpha('a')).toEqual({ ok: true, value: 'a', rest: '' })
    expect(Alpha('z')).toEqual({ ok: true, value: 'z', rest: '' })
    expect(Alpha('0')).toEqual({ ok: false, msg: 'No parsers matched' })
  })
})

describe('Digit', () => {
  it('matches any digit', () => {
    expect(Digit('0')).toEqual({ ok: true, value: '0', rest: '' })
    expect(Digit('9')).toEqual({ ok: true, value: '9', rest: '' })
  })
})

describe('Alphanumeric', () => {
  it('matches any letter or digit', () => {
    expect(Alphanumeric('A')).toEqual({ ok: true, value: 'A', rest: '' })
    expect(Alphanumeric('Z')).toEqual({ ok: true, value: 'Z', rest: '' })
    expect(Alphanumeric('a')).toEqual({ ok: true, value: 'a', rest: '' })
    expect(Alphanumeric('z')).toEqual({ ok: true, value: 'z', rest: '' })
    expect(Alphanumeric('0')).toEqual({ ok: true, value: '0', rest: '' })
    expect(Alphanumeric('9')).toEqual({ ok: true, value: '9', rest: '' })
    expect(Alphanumeric('!')).toEqual({ ok: false, msg: 'No parsers matched' })
  })
})

describe('Whitespace', () => {
  it('matches any whitespace character', () => {
    expect(Whitespace(' ')).toEqual({ ok: true, value: ' ', rest: '' })
    expect(Whitespace('\t')).toEqual({ ok: true, value: '\t', rest: '' })
    expect(Whitespace('\n')).toEqual({ ok: true, value: '\n', rest: '' })
    expect(Whitespace('\r')).toEqual({ ok: true, value: '\r', rest: '' })
    expect(Whitespace('A')).toEqual({ ok: false, msg: 'No parsers matched' })
  })
})

describe('AndThen', () => {
  it('returns a parser that matches the given parsers in sequence', () => {
    const AandB = AndThen(Literal('A'), Literal('B'))
    expect(AandB('AB')).toEqual({ ok: true, value: ['A', 'B'], rest: '' })
    expect(AandB('AC')).toEqual({ ok: false, msg: 'Expected B' })
    expect(AandB('A')).toEqual({ ok: false, msg: 'Expected B' })
    expect(AandB('B')).toEqual({ ok: false, msg: 'Expected A' })
  })
})

describe('ZeroOrMore', () => {
  it('returns a parser that matches the given parser zero or more times', () => {
    const ZeroOrMoreA = ZeroOrMore(Literal('A'))

    expect(ZeroOrMoreA('')).toEqual({ ok: true, value: [], rest: '' })
    expect(ZeroOrMoreA('AAAA')).toEqual({ ok: true, value: ['A', 'A', 'A', 'A'], rest: '' })
  })
})

describe('ZeroOrMore+AnyOf', () => {
  it('returns a parser that matches the given parser zero or more times', () => {
    const ZeroOrMoreA = ZeroOrMore(AnyOf(Literal('A'), Literal('B')))
    expect(ZeroOrMoreA('')).toEqual({ ok: true, value: [], rest: '' })
    expect(ZeroOrMoreA('A')).toEqual({ ok: true, value: ['A'], rest: '' })
    expect(ZeroOrMoreA('ABA')).toEqual({ ok: true, value: ['A', 'B', 'A'], rest: '' })
  })
})

