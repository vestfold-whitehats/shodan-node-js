'use strict';
var express = require('express');
var router = express.Router();

var ShodanClient = require('shodan-client');
var options = {};
try {
    options = require('../config/key');
}catch (e){
    console.log("mangler fil med api nøkkel..");
    options.key = "empty";
}
var client = new ShodanClient(options);

router.use(function(req, res, next){
    if(options.key == "empty") res.send("Sorry, du må legge inn API key for shodan..");
    else next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/ip', function (req, res, next) {
    var scanOpts = { ips: '62.92.155.77' };

    client.scan(scanOpts, function(err, data) {
        if(err) return res.json(data);
        return res.json(data);
    });

});

router.get('/do', function(req, res, next){

    var searchOpts = {
        query: 'geo:59.26750000000001,10.407600000000002,2 port:80',
        limit: 5,
        minify: false
    };

    if(req.query.q){
        searchOpts.query = req.query.q;
    }
    if(req.query.f){
        searchOpts.facets = req.query.f;
    }

    console.log("Doing query with params: ");
    console.log(searchOpts);

    client.search(searchOpts, function(err, data){

        var returnArr = [];
        console.log(data);

        if(!data)return res.send("No data");
        for(var i=0;i<data.matches.length;i++){
            if(data.matches[i].ip_str){
                returnArr.push("http://" + data.matches[i].ip_str + ":" + data.matches[i].port);
            }
        }
        if (err) {
            res.json(err);
        } else {
            res.render('list', {data:data, links:returnArr, query: searchOpts.query});
        }
    });
});

module.exports = router;
