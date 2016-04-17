const api = require('./src/rehab-api')

//find all the articles within the first two pages by Creative Technologists

var creative_tech_articles = api.articles(2)
            .map(api.findBy({author: {description: 'Creative Technologist'}}))


//run the computation
creative_tech_articles.fork(
    (err) => console.log('ERROR:', err)
  , (done) => console.log(
                'Articles written by Creative Technologists include:'
              , done.results.map(f => f.title).join(', '))
)


//all the triage projects which
var triageCross = api.projects(3)
              .map(api.findBy({project_type: 'triage', client: {name: 'Disney'}}))

triageCross.fork(
  (err) => console.log(err),
  (projects) => console.log('projects:', projects))
