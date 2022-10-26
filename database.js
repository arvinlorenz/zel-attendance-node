var mysql = require('mysql')
var dbConfig = {
  host: process.env.DB_URI,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
}
var connection
connection.connect(function (err) {
  if (err) throw err
  console.log('Connected!')
  console.log('Running in Port', process.env.PORT)
})

function handleDisconnect() {
  connection = mysql.createConnection(dbConfig) // Recreate the connection, since the old one cannot be reused.
  connection.connect(function onConnect(err) {
    // The server is either down
    if (err) {
      // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err)
      setTimeout(handleDisconnect, 5000) // We introduce a delay before attempting to reconnect,
    } // to avoid a hot loop, and to allow our node script to  // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    console.log('Connected!')
    console.log('Running in Port', process.env.PORT)
  })
  connection.on('error', function onError(err) {
    console.log('db error', err)
    if (err.code == 'PROTOCOL_CONNECTION_LOST') {
      // Connection to the MySQL server is usually
      handleDisconnect() // lost due to either server restart, or a
    } else {
      // connnection idle timeout (the wait_timeout
      throw err // server variable configures this)
    }
  })
}
handleDisconnect()

module.exports = connection
