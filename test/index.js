const assert = require('chai').assert
const expect = require('chai').expect
const api = require('../src/rehab-api')
const Task = require('data.task')


//test assertion
describe('Array', () => {
    describe('#indexOf()', () => {
        it('Should return -1 when the value is not present', () => {
            assert.equal(-1, [1,2,3].indexOf(5))
            assert.equal(-1, [1,2,3].indexOf(0))
        })
    })
})

describe('makeRange', () => {
  it('Should return a range from values in array format from 2 to x', () => {
      expect(api.makeRange(5)).to.deep.equal([2,3,4,5])
  })
  it('Should return a single array if called with 1 or 2', () => {
      expect(api.makeRange(1)).to.deep.equal([1])
      expect(api.makeRange(2)).to.deep.equal([2])
  })
})


describe('sequence', () => {
    it('Should return instance of the Task monad', () => {
        expect(api.sequence('projects', 1)).to.be.instanceof(Task);
    })
    it('Should iterate through each page in a resource and join their results', (done) => {
        api.sequence('projects', 1).fork(
            done
          , (res) => done()
        )
    })
})

describe('fetch', () => {
    it('Should return an instance of the Task monad', () => {
        expect(api.fetch('articles', 2)).to.be.instanceof(Task);
    })
    it('Should fetch upto n number of pages specified', (done) => {
        api.fetch('articles', 2).fork(done, (res) => done())
    })
})
