import { JSONObject } from './json-parser';
import { isError } from './grammar';

export const jsonParse = (input) => {
  const result = JSONObject(input)
  if (isError(result)) {
    throw new Error(result.msg)
  }

  return result.value
}
