/**
 * Created by GB115151 on 04/06/2016.
 */

var mongo = process.env.VCAP_SERVICES;
var port = process.env.PORT || 3030;
var conn_str = "";
if (mongo) {
    var env = JSON.parse(mongo);
    if (env['mongodb']) {
        mongo = env['mongodb'][0]['credentials'];
        if (mongo.url) {
            conn_str = mongo.url;
            console.log("conn_str: " + conn_str);
        }
    }
}else{
    console.log("no mongodb -------=---=-=-------");
}

// var test = mongo && JSON.parse(mongo)['mongodb'] && JSON.parse(mongo)['mongodb'][0]['credentials'];
// console.log("test: " + test);

module.exports = {
    // Development configuration options
    sessionSecret: "1234",
    db: conn_str
};
