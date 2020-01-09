 const app = require('../server')

const port = 8181

app.listen(port, () => {
  console.log(`server started at localhost:${port}`)
})
