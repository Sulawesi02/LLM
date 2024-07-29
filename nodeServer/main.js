const express = require("express")

const app = express()

const port = 80

app.use("/",express.static("static"))//配置服务器

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})