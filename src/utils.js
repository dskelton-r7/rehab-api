const Task = require('data.task')
const request = require('request')
const curry = require('ramda').curry;
const Maybe = require('ramda-fantasy').Maybe;

const Http = function(baseURL){
    return {
       get: function(url){
          return new Task(function(rej, res){
              request(baseURL + url, function(err, response, body){
                  if(err) return rej(err)
                  res(JSON.parse(body))
              })
          })
       }
    }
}

const Debug = curry(function debug(x){
  console.log('DEBUG::: ', x)
  return x
})


const liftA2 = curry(function liftA2(f, functor1, functor2) {
  return functor1.map(f).ap(functor2);
});

module.exports = {
    Http    : Http
  , Debug   : Debug
  , liftA2 : liftA2
}
