const express = require('express')

const app = express()
app.set('view engine', 'ejs');
app.use(express.static('public'));
const port = 3000

app.get('/', (req, res) => {
  const username = 'John Doe'; // Replace with your desired dynamic data
  res.render('home', { username });
})

app.get('/test', (req, res) => {
    const username2  = 'John Doe'; // Replace with your desired dynamic data
    res.render('test',{ username2 });
  })
  app.get('/send', (req, res) => {
    const username2  = 'John Doe'; // Replace with your desired dynamic data
    res.set('Content-Type', 'text/plain')
    res.send("test");
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})