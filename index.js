"use strict";

var _ = require('lodash');
var Alexa = require('alexa-app');
var Promise = require('promise');
var httpRequest = require('request');

// client key
var cik = process.env.cik || 0;

// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;

var app = new Alexa.app('garage');

//
//
//
app.launch(function(req, res) {
    var prompt = 'What would you like to know?';
    res.say(prompt).reprompt(prompt).shouldEndSession(false).send();
});

//
//
//
app.intent('TempIntent', {
    "utterances": ['{for|to get|what is} the {current|} temperature']
}, function(req, res){
    dataCheck()
    .done(function(result) {
        var str = "The garage temperature is currently " + result.Temp + " degrees";
        res.say(str).send();
    });

    // signal that we will send the response asynchronously    
    return false;
});

//
//
//
app.intent('DoorIntent', {
    "utterances": ['if {|the} doors are closed','are {|the} doors closed']
}, function(req, res){
    dataCheck()
    .done(function(result) {
        if ('1' == result.LeftDoor && '1' == result.RightDoor) {
            res.say("Both of the garage doors are open").send();
        } else if ('1' == result.LeftDoor ) {
            res.say("The left garage door is open").send();
        } else if ('1' == result.RightDoor ) {
            res.say("The right garage door is open").send();
        } else {
            res.say("Both of the garage doors are closed").send();
        }
    });

    // signal that we will send the response asynchronously    
    return false;
});

//
//
//
function dataCheck() {
    return new Promise(function(fulfill, reject) {
        var options = {
            url: "http://m2.exosite.com/onep:v1/stack/alias?Temp&LeftDoor&RightDoor",
            responseType: "json",
            type: "GET",
            headers: {
                "X-Exosite-CIK": cik,
                "Accept": "application/x-www-form-urlencoded; charset=utf-8"
            }
        }
            
        httpRequest.get(options, function(err, response, body) {
            if (err) {
                reject(err);
//                console.log("unable to connect to service");
            } else if (response.statusCode !== 200) {
                reject("bad request");
//                console.log("bad request");
            } else {
//                console.log("request success");
                
                var values = parseQueryString(body);
                values["timestamp"] = new Date().getTime();

                fulfill(values);                            
                console.log("insert success ", values);
            }
        });
    });
}

//
//
//
function parseQueryString(query) {
    var entityPairs = query.split("&");

    var values = {};
    for (var i = 0; i < entityPairs.length; i++) {
        var entity = entityPairs[i].split("=");
        values[entity[0]] = entity[1];
    }

    return values;
}

module.exports = app;