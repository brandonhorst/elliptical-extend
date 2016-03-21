/** @jsx createElement */
import _ from 'lodash'
import {createOption, compile, createElement} from 'elliptical'
import createProcessor from '../src/processor'

export function text (input) {
  return _.map(input.words, 'text').join('')
}

export function compileAndTraverse (element, input, extensions = []) {
  const processor = createProcessor(extensions)
  const parse = compile(element, processor)
  return parse(input)
}
