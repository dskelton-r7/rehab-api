const R = require('ramda')
const Maybe = require('ramda-fantasy').Maybe
const Either = require('data.either');
const Task = require('data.task')
const request = require('request')
const Async = require('control.async')(Task)
const utils = require('./utils')
const {Debug, merge} = utils;
const {last, range, curry, compose, concat, prop, lensProp, filter, over, map, reduce, where, equals} = R
const set = R.set
const flatMap = R.chain


const Http = utils.Http('http://rehabstudio.com/api')


const Lenses = {
    'results' : lensProp('results')
  , 'count'   : lensProp('count')
  , 'next'    : lensProp('next')
  , 'previous': lensProp('previous')
}

const Props = {
    'results' : prop('results')
  , 'count'   : prop('count')
  , 'next'    : prop('next')
  , 'previous': prop('previous')
}


/**
 *
 *
 *
 * @summary identity :: x Any -> x
 */


const identity = (x) => x



/**
 *
 *
 *
 * @summary mergeResult :: Function(a Function, b Any) -> Function JSON
 */



const mergeResult = reduce((a, {results}) => concat(a, results), [])


/**
 * 
 *
 *
 * @summary setter :: Function(a Function, b Any, c JSON) -> Function(x Function, y Any, z JSON)
 */


const setter = curry(function setter(lensProp, val, data){
    return set.apply(null, arguments)
})


/**
 *
 *
 *
 * @summary lastOf :: Function
 */


const lastOf = compose(last, filter(Props.results))


/**
 *
 *
 *
 * @summary nextOf :: Function JSON
 */



const nextOf = compose(Props.next, lastOf)



/**
 *
 *
 *
 * @summary prevOf :: Function JSON
 */

const prevOf = compose(Props.previous, lastOf)


/**
 * Higher Order function or applying a filter predicate
 * updates the meta data in the response after applying the filter
 * @summary find :: Function -> Function(Function)
 */


const find = function find(predicate){
    return compose(
        (x) =>
        set(Lenses.count
              , compose(R.length, Props.results, identity)(x)
              , x)
      , set(Lenses.previous, null)
      , set(Lenses.next, null)
      , over(Lenses.results, filter(predicate)))
}


/**
 *
 *
 *
 * @summary mergeTask :: a JSON -> b JSON -> Task(_, Success JSON)
 */

const mergeTask = curry(function mergeTask(f, rest){
  return compose(Task.of
    , setter(Lenses.next, nextOf(rest))
    , setter(Lenses.previous, prevOf(rest))
    , over(
          Lenses.results
        , concat(compose(mergeResult, filter(Props.results))(rest))
      )
  )(f)
})


/**
 *
 *
 *
 * @summary takeN :: String -> Function([] Int)
 */

const takeN = function takeN(src){
    return compose(
        Async.parallel
      , map(compose(Http.get, concat(`/${src}/?page=`))))
}


/**
 *
 *
 *
 * @summary makeRange :: Int -> [Int]
 */

const makeRange = function makeRange(n){
    return R.range(2, ++n)
}


/**
 *
 *
 *
 * @summary fetch :: a String -> b Int -> Task (Error String, Success [x])
 */

const fetch = curry(function fetch(resource, n){
    return (n == 1
            ? Http.get(`/${resource}/?page=1`)
            : Http.get(`/${resource}/?page=1`).
                chain(function(f){
                    return compose(
                        flatMap(mergeTask(f)), takeN(resource))(makeRange(n))
            }))
})


function rehabstudio(options){
   this.version = options.version
}


rehabstudio.prototype.of = function of(options){
   return new rehabstudio(options)
}


rehabstudio.of = rehabstudio.prototype.of


rehabstudio.prototype.findBy = curry(function(obj, f){
    //TODO: Add cases for matching against nested values such as clients or authors
    const lookup = curry(function lookup(spec, testObj){
        return where(map(curry((left, right) => {
                  return (right === Object(right) ? lookup : equals)(left, right)
              }), spec)
            , testObj)
          })
    return find(lookup(obj))(f)
})


rehabstudio.prototype.articles = fetch('articles')
rehabstudio.prototype.projects = fetch('projects')
rehabstudio.prototype.featured = fetch('featured')
rehabstudio.prototype.offices = (_) => fetch('offices', 1)
rehabstudio.prototype.jobs = (_) => fetch('jobs', 1)


module.exports = rehabstudio.of({version:1})
