/** @jsx createElement */
import _ from 'lodash'
import {createElement} from 'elliptical'

export default function createProcessor (extensions) {
  return function process (element) {
    // you can't extend builtins or element without describe
    if (_.isString(element) || !element.type.describe) return element

    const theseExtensions = _.chain(extensions)
      .filter(Extension => _.includes(Extension.extends, element.type))
      .map(Extension => (
        <Extension {...element.props} id={undefined}>
          {element.children}
        </Extension>
      ))
      .value()

    if (theseExtensions.length) {
      function newDescribe (model) {
        const description = element.type.describe(model)
        let outputElement = description
        if (element.type.mapResult) {
          function mapResult (option) {
            const result = element.type.mapResult(option.result)
            return _.assign({}, option, {result})
          }
          outputElement = (
            <map outbound={mapResult} skipIncomplete>
              {description}
            </map>
          )
        }
        return (
          <choice>
            {outputElement}
            {theseExtensions}
          </choice>
        )
      }
      const newPhrase = _.assign({}, element.type, {
        describe: newDescribe,
        mapResult: undefined
      })
      return _.assign({}, element, {type: newPhrase})
    } else {
      return element
    }
  }
}