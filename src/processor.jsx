/** @jsx createElement */
import _ from 'lodash'
import {createElement} from 'elliptical'

export default function createProcessor (extensions) {
  return function process (element) {
    // you can't extend builtins
    if (_.isString(element)) return element

    const theseExtensions = _.chain(extensions)
      .filter((extension) => _.includes(extension.extends, element.type.id))
      .map((extension) => {
        const newProps = _.assign({}, element.props, {id: undefined})
        return _.assign({}, element, {type: extension}, {props: newProps})
      })
      .map((extension) => {
        let final = extension

        if (element.type.mapResult) {
          function map (option) {
            const result = element.type.mapResult(option.result, extension)
            return _.assign({}, option, {result})
          }
          final = <map outbound={map} skipIncomplete>{final}</map>
        }
        if (element.type.filterResult) {
          function filter (option) {
            return element.type.filterResult(option.result, extension)
          }
          final = <filter outbound={filter} skipIncomplete>{final}</filter>
        }

        return final
      })
      .value()

    if (theseExtensions.length) {
      const newPhrase = _.assign({}, element.type, {id: undefined}) // to prevent duplicate extension
      const newProps = _.assign({}, element.props, {id: undefined})
      const newElement = _.assign({}, element, {type: newPhrase}, {props: newProps})
      function describe (model) {
        return (
          <choice>
            {newElement}
            {theseExtensions}
          </choice>
        )
      }
      return _.assign({}, element, {type: {describe}})
    } else {
      return element
    }
  }
}