// v15: the batteries-included preprocessor no longer shims `querystring`
// (and other Node built-ins). If a spec needs it, configure resolve.fallback.
import qs from 'querystring'

it('parses a query string', () => {
  const parsed = qs.parse('a=1&b=2')
  expect(parsed.a).to.eq('1')
})
