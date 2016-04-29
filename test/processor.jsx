/** @jsx createElement */
/* eslint-env mocha */
import { createElement, compile } from 'elliptical'
import { text, compileAndTraverse } from './_util'
import { expect } from 'chai'

describe('extends', () => {
  it('allows phrases that return null (for classes to be extended)', () => {
    const Noop = {
      describe () {
        return null
      }
    }

    const data = compileAndTraverse(<Noop />, '')
    expect(data).to.have.length(0)
  })

  it('handles phrases that return null to be extended', () => {
    const Noop = {
      id: 'noop',
      describe () {
        return null
      }
    }

    const Extender = {
      extends: [Noop],
      describe () {
        return <literal text='test' />
      }
    }

    const data = compileAndTraverse(<Noop />, '', [Extender])
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')
  })


  it('matches phrases that do not have an id', () => {
    const Noop = {
      describe () {
        return null
      }
    }

    const Extender = {
      extends: [Noop],
      describe () {
        return <literal text='test' />
      }
    }

    const data = compileAndTraverse(<Noop />, '', [Extender])
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')
  })

  it('handles phrases that have the same id, even if they are different instances', () => {
    const NoopReal = {
      id: 'noop',
      describe () {
        return null
      }
    }

    const NoopFake = {
      id: 'noop',
      describe () {
        return null
      }
    }

    const Extender = {
      extends: [NoopFake],
      describe () {
        return <literal text='test' />
      }
    }

    const data = compileAndTraverse(<NoopReal />, '', [Extender])
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')
  })

  it('does not match phrases if they are different and do not share id', () => {
    const NoopReal = {
      id: 'noop-real',
      describe () {
        return null
      }
    }

    const NoopFake = {
      id: 'noop-fake',
      describe () {
        return null
      }
    }

    const Extender = {
      extends: [NoopFake],
      describe () {
        return <literal text='test' />
      }
    }

    const data = compileAndTraverse(<NoopReal />, '', [Extender])
    expect(data).to.have.length(0)
  })

  it('handles phrases with extends', () => {
    const Extended = {
      id: 'extended',
      describe () { return <literal text='test a' value='a' /> }
    }

    const Extender = {
      extends: [Extended],
      describe () { return <literal text='test b' value='b' /> }
    }

    const data = compileAndTraverse(<Extended />, '', [Extender])
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('test a')
    expect(data[0].result).to.equal('a')
    expect(data[1].result).to.equal('b')
  })

  it('handles phrases extended multiple times', () => {
    const Extended = {
      id: 'extended',
      describe () { return <literal text='test a' value='a' /> }
    }

    const Extender1 = {
      extends: [Extended],
      describe () { return <literal text='test b' value='b' /> }
    }

    const Extender2 = {
      extends: [Extended],
      describe () { return <literal text='test c' value='c' /> }
    }

    const data = compileAndTraverse(<Extended />, '', [Extender1, Extender2])
    expect(data).to.have.length(3)
    expect(text(data[0])).to.equal('test a')
    expect(data[0].result).to.equal('a')
    expect(text(data[1])).to.equal('test b')
    expect(data[1].result).to.equal('b')
    expect(text(data[2])).to.equal('test c')
    expect(data[2].result).to.equal('c')
  })

  it('handles recursive phrases with extends', () => {
    const Extended = {
      id: 'extended',
      describe ({props}) {
        return (
          <sequence>
            <literal text='a' value='a' id='a' />
            {props.allowRecurse ? <Extended allowRecurse={false} id='b' /> : null}
          </sequence>
        )
      }
    }

    const Extender = {
      extends: [Extended],
      describe () {
        return <literal text='b' value='b' />
      }
    }

    const data = compileAndTraverse(<Extended allowRecurse />, 'ab', [Extender])
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('ab')
    expect(data[0].result).to.eql({a: 'a', b: 'b'})
  })

  it('handles phrases with extends in sequence', () => {
    const Test = {
      describe () {
        return (
          <sequence>
            <literal text='test ' />
            <Extended id='test' />
          </sequence>
        )
      }
    }

    const Extended = {
      id: 'extended',
      describe () { return <literal text='a' value='a' /> }
    }

    const Extender = {
      extends: [Extended],
      describe () { return <literal text='b' value='b' /> }
    }

    const data = compileAndTraverse(<Test />, '', [Extender])
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('test a')
    expect(data[0].result.test).to.equal('a')
    expect(text(data[1])).to.equal('test b')
    expect(data[1].result.test).to.equal('b')
  })

  it('respects filterResult of extended', () => {
    const Noop = {
      id: 'noop',
      filterResult (result) {
        return result === 'test2'
      },
      describe () {
        return null
      }
    }

    const Extender = {
      extends: [Noop],
      describe () {
        return <list items={[
          {text: 'test1', value: 'test1'},
          {text: 'test2', value: 'test2'}
        ]} />
      }
    }

    const data = compileAndTraverse(<Noop />, '', [Extender])
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test2')
    expect(data[0].result).to.equal('test2')
  })

  it('does mapResult of extended', () => {
    const Extended = {
      id: 'extended',
      mapResult (result) {
        return result + 'x'
      },
      describe () {
        return <literal text='test1' value='test1' />
      }
    }

    const Extender = {
      extends: [Extended],
      describe () {
        return <literal text='test2' value='test2' />
      }
    }

    const data = compileAndTraverse(<Extended />, '', [Extender])
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('test1')
    expect(data[0].result).to.equal('test1x')
    expect(text(data[1])).to.equal('test2')
    expect(data[1].result).to.equal('test2x')
  })

  it('calls mapResult of extender', () => {
    const Extended = {
      id: 'extended',
      mapResult (result) {
        return result + 'x'
      },
      describe () {
        return <literal text='test1' value='test1' />
      }
    }

    const Extender = {
      extends: [Extended],
      mapResult (result, element) {
        expect(element).to.eql({
          type: Extender,
          props: {id: undefined},
          children: []
        })
        return result + 'y'
      },
      describe () {
        return <literal text='test2' value='test2' />
      }
    }

    const data = compileAndTraverse(<Extended />, '', [Extender])
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('test1')
    expect(data[0].result).to.equal('test1x')
    expect(text(data[1])).to.equal('test2')
    expect(data[1].result).to.equal('test2yx')
  })
})