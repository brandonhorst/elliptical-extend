/** @jsx createElement */
import _ from 'lodash'
import {createOption, compile, createElement} from 'elliptical'
import createProcess from '../src/process'

export function text (input) {
  return _.map(input.words, 'text').join('')
}

export function compileAndTraverse (element, input, extensions = []) {
  const process = createProcess(extensions)
  const traverse = compile(<base>{element}</base>, process)
  return Array.from(traverse(createOption({text: input})))
}
