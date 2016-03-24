/** @jsx createElement */
import _ from 'lodash'
import {createElement} from 'elliptical'

export default function createProcessor (extensions) {
  return function process (element) {
    // you can't extend builtins
    if (_.isString(element)) return element

    const theseExtensions = _.chain(extensions)
      .filter((Extension) => _.includes(Extension.extends, element.type))
      .map(Extension => (
        <Extension {...element.props} id={undefined}>
          {element.children}
        </Extension>
      ))
      .map((extension) => {
        let result = extension

        if (element.type.mapResult) {
          function map (option) {
            const result = element.type.mapResult(option.result, extension)
            return _.assign({}, option, {result})
          }
          result = <map outbound={map} skipIncomplete>{result}</map>
        }
        if (element.type.filterResult) {
          function filter (option) {
            return element.type.filterResult(option.result, extension)
          }
          result = <filter outbound={filter} skipIncomplete>{result}</filter>
        }

        return result
      })
      .value()

    if (theseExtensions.length) {
      const NewPhrase = _.clone(element.type) // to prevent duplicate extension
      function describe (model) {
        return (
          <choice>
            <NewPhrase {...element.props} id={undefined}>
              {element.children}
            </NewPhrase>
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