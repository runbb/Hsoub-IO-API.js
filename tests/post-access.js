var io = require("../").io;
var s = new io();
s.post(55633, (err, res) => {
    if (err) {
        console.log(err)
        return;
    }
    console.dir(res);
    // res = res;
    // console.log("\x1b[1mid\x1b[0m\t\t"+res.id);
    // console.log("\x1b[1mname\x1b[0m\t\t"+res.name);
    // console.log("\x1b[1mpoints\x1b[0m\t\t"+res.points);
    // console.log("\x1b[1mregister date\x1b[0m\t"+res.register_date);
    // console.log("-------------------------------------------------------")
    // console.log("\x1b[1mid\x1b[0m\t| \x1b[1mcomments\x1b[0m\t| \x1b[1mtitle\x1b[0m");
    // res.results.forEach(item => {
    //     if(res.results[0] == item){
    //       console.log("\x1b[5m" + item.post.id + "\x1b[0m" + "\t| " + "\x1b[5m" + item.commants_count + "\x1b[0m" + "\t\t| " + "\x1b[5m" + item.post.title + "\x1b[0m" );
    //     }else{
    //       console.log(item.post.id + "\t| " + item.commants_count + "\t\t| " + item.post.title );
    //     }
    // });
});
