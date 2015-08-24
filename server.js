var express = require("express"),
    app = express(),
    hostname = process.env.HOSTNAME || '127.0.0.1',
    port = parseInt(process.env.PORT, 10) || 4567,
    publicDir = process.argv[2] || __dirname;

app.use(express.static(publicDir));

app.listen(port, hostname, function(){
  console.log("Static server showing %s listening at http://%s:%s", publicDir, hostname, port);
});
