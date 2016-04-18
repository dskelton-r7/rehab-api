const api = require('./src/rehab-api')
const liftA2 = require('./src/utils').liftA2
const curry = require('ramda').curry


/*
The examples below provide a simple way to interface with the rehabstudio api
by building up a set of computations by declartively describing what you want.
These are all lazily evaluated, therefore nothing will run until you invoke fork() on the task monad
*/




/*
*****
Example 1.
Find all the articles within the first two pages that have been written by Creative Technologists
******
*/



var creative_tech_articles = api.articles(2)
            .map(api.findBy({author: {description: 'Creative Technologist'}}))
            .map(api.sortBy('-date'))


creative_tech_articles.fork(
    (err) => console.log('ERROR:', err)
  , (done) => console.log(
                'Articles written by Creative Technologists include:'
              , done.results.map(f => f.title).join(', '), done.results.length)
)




/*
*****
Example 2.
Find the triangle project for the Disney client within the first three pages
******
*/



var triage = api.projects(3)
              .map(api.findBy({project_type: 'triage', client: {name: 'Disney'}}))


triage.fork(
    (err) => console.log(err)
  , (projects) => console.log('projects:', projects))





/*
*****
Example 3.
Return an array of both the creative_tech_articles and triage
liftA2 is a pointfree way to write these applicative calls
the lifted function needs to be curried to wait for both calls to finish
******
*/


var zip = curry(function(a, b){
    return [a, b]
})

var articles_projects = liftA2(zip, creative_tech_articles, triage);

articles_projects.fork(
    (err) => console.log(err)
  , (both) => console.log(both))
