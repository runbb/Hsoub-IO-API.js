var io = require("../").io;
var s = new io();
s.post(55633, (err, res) => {
    if (err) {
        console.log(err)
        return;
    }
    console.log(JSON.stringify(res,null,4));
});
