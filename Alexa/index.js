var request = require("request")
var https = require("https")
var fs = require('fs');
var csv = require('fast-csv');


exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);


        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    // add any session init logic here

}

function onSessionEnded(sessionEndedRequest, session) {


}


/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    getWelcomeResponse(callback);


}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {

    var intent = intentRequest.intent;
    var intentName = intentRequest.intent.name;


    // dispatch custom intents to handlers here

    if (intentName === "TeacherIntent" || intentName === "LehrerIntent") {
        handleTeacherIntent(intent, session, callback);
        //handleYesIntent(intent,session,callback);

    } else if (intentName === "AMAZON.YesIntent") {
        handleYesIntent(intent, session, callback)
    } else if (intentName === "AMAZON.NoIntent") {
        handleNoIntent(intent, session, callback)
    } else if (intentName === "AMAZON.StopIntent") {
        handleFinishSessionRequest(intent, session, callback)
    } else if (intentName === "GetRequestIntent") {
        handleInfoIntent(intent, session, callback)
    } else if (intentName === "InHouseIntent") {
        handleInHouseIntent(intent, session, callback)
    } else if (intentName === "PostRequestIntent") {
        handlePostRequest(intent, session, callback)
    } else if (intentName === "StartAnimationIntent") {
        handleStartAnimation(intent, session, callback)

    } else if (intentName === "TestWebUntisIntent") {
        WebUntisPost(intent, session, callback)

    }
    else if (intentName === "WhereIsProfIntent") {
        handleWhereIsProfIntent(intent, session, callback);
    }
    else if (intentName === "AVIntent") {
        handleAvIntent(intent, session, callback);
    }
    else if (intentName === "DirektorIntent") {
        handleDirektorIntent(intent, session, callback);
    } else if (intentName === "GetNextHolidayIntent") {
        GetNextHoliday(intent, session, callback)
    } else if (intentName === "GetTimetableIntent") {
        getTimetable(intent, session, callback)
    } else if (intentName === "GetKlasses") {
        getKlassen(intent, session, callback);
    }
    else if(intentName === "WhereIsProfessor")
    {
        handleWhereIsProfIntent(intent, session, callback);

    }
    else {
        handleerror(session, callback)
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */


function handleerror(session, callback) {
    var speechOutput = "Was hast du gesagt? Versuchs nochmal";
    var reprompt = "Was?";
    var header = "Was?";

    var shouldEndSession = false;

    callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))

}

// ------- Skill specific logic -------

function getWelcomeResponse(callback) {


    request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidStandUp", function (error, response, body) {


        setTimeout(function () {
            console.log('Waiting');
            request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSpeak", function (error, response, body) {

                var speechOutput = "Hallo Ich bin Leonie. Willkommen zum Tag der offenen Tür. Wie kann ich ihnen helfen?";

                var reprompt = "Sagen Sie zum Beispiel, Welches Fach unterrichtet Professor Stütz";

                var header = "HTL Leonding Info";

                var shouldEndSession = false;

                var sessionAttributes = {
                    "speechOutput": speechOutput,
                    "repromptText": reprompt
                }

                callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));
            });
        }, 1500);


    });


}

function handleWhereIsProfIntent(intent, session, callback) {

   // console.log(intent.slots.Prof)
    var count1;
    var count2;
    var teacherfull;
    


    if(intent.name === "WhereIsProfIntent")
{
    count1 = Object.keys(intent.slots.Prof).length;
    count2 = Object.keys(intent.slots.Time).length;
      teacherfull = intent.slots.Prof.value
}else if(intent.name ==="WhereIsProfessor")
{

    count1 = Object.keys(intent.slots.Professor).length;
    count2 = Object.keys(intent.slots.Time).length;
      teacherfull = intent.slots.Professor.value
}


    if (count1 === 1 || count2 === 1) {
        
         request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSpeak", function (error, response, body) {

        var speechOutput = "Bitte versuche es noch einmal. Probiere zum Beispiel: In welcher Klasse unterrichtet Professor Stütz in der ersten Stunde"

        var reprompt = "Möchten sie noch etwas wissen?";

        var header = "HTL Leonding Teacher";

        var shouldEndSession = false;

        var sessionAttributes = {
            "speechOutput": speechOutput,
            "repromptText": reprompt


        }

        callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));
        
         });

    }


   


    var teacher = teacherfull.substring(teacherfull.indexOf(' ') + 1);

    console.log(teacher);
    console.log("-------------------------")

    while (teacher.includes('.')) {
        teacher = teacher.replace('.', '')
    }
    while (teacher.includes(' ')) {
        teacher = teacher.replace(' ', '')
    }

    teacher = teacher.toLowerCase();

    var starttime;
    var timeString = intent.slots.Time.value

    switch (intent.slots.Time.value) {
        case "ersten":
            starttime = 800;
            break;
        case "zweiten":
            starttime = 855;
            break;
        case "dritten":
            starttime = 1000;
            break;
        case "vierten":
            starttime = 1055;
            break;
        case "fünften":
            starttime = 1150;
            break;
        case "sechsten":
            starttime = 1245;
            break;
        case "siebten":
            starttime = 1340;
            break;
        case "achten":
            starttime = 1435;
            break;
        case "neunten":
            starttime = 1530;
            break;
        case "zehnten":
            starttime = 1625;
            break;
        case "elften":
            starttime = 1720;
            break;
        case "zwölften":
            starttime = 1815;
            break;
        case "dreizentehn":
            starttime = 1910;
            break;

    }


    var myJSON = {
        "id": "LUKI",
        "method": "authenticate",
        "params": {"user": "in120083", "password": "luki05525252", "client": "CLIENT"},
        "jsonrpc": "2.0"
    };

    var getTeachersJSON = {
        "id": "LUKI",
        "method": "getTeachers",
        "params": {},
        "jsonrpc": "2.0"
    };

    var getKlassenJSON = {
        "id": "LUKI",
        "method": "getKlassen",
        "params": {},
        "jsonrpc": "2.0"
    };


    request({
        url: "https://mese.webuntis.com/WebUntis/jsonrpc.do?school=htbla%20linz%20leonding",
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: myJSON

    }, function (error, response, body) {

 var sessionid = body.result.sessionId;

       // request.get("https://leonid-da.herokuapp.com/rs/leonidserver/query?msg=" + body.result.sessionId, function (error, response, body) {


          //  request.get("https://leonid-da.herokuapp.com/rs/leonidserver", function (error, response, body) {


               
                
             

                request.post(
                    'https://mese.webuntis.com/WebUntis/jsonrpc.do;jsessionid=' + sessionid,
                    {json: getTeachersJSON},
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {

                            console.log(body);

                            var arrFound = body.result.filter(function (item) {
                                return item.longName.toLowerCase() == teacher;
                            });


                            var getTimetableJson = {
                                "id": "LUKI",
                                "method": "getTimetable",
                                "params": {"type": 2, "id": arrFound[0].id},
                                "jsonrpc": "2.0"
                            };


                            request.post(
                                'https://mese.webuntis.com/WebUntis/jsonrpc.do;jsessionid=' + sessionid,
                                {json: getTimetableJson},
                                function (error, response, body) {
                                    if (!error && response.statusCode == 200) {

                                        console.log(body.result)


                                        //   console.log(body);
                                        var arrFound = body.result.filter(function (item) {
                                            return item.startTime == starttime;
                                        });


                                        if (arrFound.length != 0) {


                                            var klassenid = arrFound[0].kl[0].id

                                            request.post(
                                                'https://mese.webuntis.com/WebUntis/jsonrpc.do;jsessionid=' + sessionid,
                                                {json: getKlassenJSON},
                                                function (error, response, body) {
                                                    if (!error && response.statusCode == 200) {

                                                        //console.log(body);


                                                        var arrFound = body.result.filter(function (item) {
                                                            return item.id == klassenid;
                                                        });

                                                        console.log(arrFound[0].name)
                                                        
                                                         request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSpeak", function (error, response, body) {
                                                             
                                                        var speechOutput;
                                                    
                                                        if(arrFound[0].name.substring(1,2) === "B")
                                                        {
                                                        speechOutput = "Professor " + teacher + " unterrichtet in der " + timeString + " Stunde in der " 
                                                        + arrFound[0].name.substring(0,1)+" " + arrFound[0].name.substring(1,2) + "E " + arrFound[0].name.substring(2,3)
                                                        + " " +arrFound[0].name.substring(3,4) +" " + arrFound[0].name.substring(4,5)
                                                        }
                                                        else if(arrFound[0].name.substring(1,2) === "C"){
                                                            speechOutput = "Professor " + teacher + " unterrichtet in der " + timeString + " Stunde in der " 
                                                        + arrFound[0].name.substring(0,1)+" " + arrFound[0].name.substring(1,2) + " " + arrFound[0].name.substring(2,3)
                                                        + " " +arrFound[0].name.substring(3,4) +" " + arrFound[0].name.substring(4,5)
                                                        }else{
                                                             speechOutput = "Professor " + teacher + " unterrichtet in der " + timeString + " Stunde in der " 
                                                        + arrFound[0].name;
                                                        }

                                                        var reprompt = "Möchten sie noch etwas wissen?";

                                                        var header = "HTL Leonding Teacher";

                                                        var shouldEndSession = false;

                                                        var sessionAttributes = {
                                                            "speechOutput": speechOutput,
                                                            "repromptText": reprompt


                                                        }

                                                        callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));
                                                        
                                                         });

                                                    }
                                                });
                                        }
                                        else {
                                            
                                             request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSpeak", function (error, response, body) {
                                                 
                                                 
                                            var speechOutput = "Professor " + teacher + " unterrichtet in der " + timeString + " Stunde in keiner Klasse"

                                            var reprompt = "Möchten sie noch etwas wissen?";

                                            var header = "HTL Leonding Teacher";

                                            var shouldEndSession = false;

                                            var sessionAttributes = {
                                                "speechOutput": speechOutput,
                                                "repromptText": reprompt


                                            }

                                            callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));
                                            
                                             });
                                        }

                                    }


                                });


                        }


                    });

            });


     //   });


  //  });

}


function handleTeacherIntent(intent, session, callback) {
    var count1;
    
    
       if(Object.keys(intent.slots).length === 0)
    {
        count1 = 1;
    }
    else
    {
    
    count1 = Object.keys(intent.slots.Lehrer).length
    }
 
    
    
    if(count1 === 1 || count1 === 0)
    {
       
        
          request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSpeak", function (error, response, body) {

                        var speechOutput = "Ich habe den Professor Namen leider nicht richtig verstanden";


                        var reprompt = "Möchten sie noch etwas wissen?";

                        var header = "HTL Leonding Teacher";

                        var shouldEndSession = false;

                        var sessionAttributes = {
                            "speechOutput": speechOutput,
                            "repromptText": reprompt


                        }

                        callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));
                    });
                    
    }
    else
    {
    
         var lehrer = intent.slots.Lehrer.value.toLowerCase();
            
            
            var teacher = lehrer.substring(lehrer.indexOf(' ') + 1);

 

    while (teacher.includes('.')) {
        teacher = teacher.replace('.', '')
    }
    while (teacher.includes(' ')) {
        teacher = teacher.replace(' ', '')
    }

    teacher = teacher.toLowerCase();
    var found = false;


    fs.createReadStream('Professoren.csv')
        .pipe(csv())
        .on('data', function (data) {

            var arr = data.toString().split(";");
            var name = arr[0];
            var arr1 = name.split(" ");
            var teachername = arr1[1].toLowerCase();

       
            

            if (intent.name === "LehrerIntent") {

                if (teacher === teachername) {


                    
        

                    request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSpeak", function (error, response, body) {

                        var speechOutput = "Professor "+ teacher  + " unterrichtet " + arr[1];


                        var reprompt = "Möchten sie noch etwas wissen?";

                        var header = "HTL Leonding Teacher";

                        var shouldEndSession = false;

                        var sessionAttributes = {
                            "speechOutput": speechOutput,
                            "repromptText": reprompt


                        }

                        callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));
                        
                    
                        found = true;
                        
                        
                    });


                }

            }
           /* else if (intent.name === "TeacherIntent") {
                if (intent.slots.Teacher.value.toLowerCase() === name.toLowerCase()) {

                    request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSpeak", function (error, response, body) {

                        var speechOutput = intent.slots.Teacher.value + " unterrichtet " + arr[1];


                        var reprompt = "Möchten sie noch etwas wissen?";

                        var header = "HTL Leonding Teacher";

                        var shouldEndSession = false;

                        var sessionAttributes = {
                            "speechOutput": speechOutput,
                            "repromptText": reprompt


                        }

                        callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));

                    });

                }
            }*//* else {

                request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSpeak", function (error, response, body) {

                    var speechOutput = "Dieser Professor ist mir nicht bekannnt";


                    var reprompt = "Unbekannter Professor";

                    var header = "HTL Leonding Teacher";

                    var shouldEndSession = false;

                    var sessionAttributes = {
                        "speechOutput": speechOutput,
                        "repromptText": reprompt
                    }


                    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));
                });*/
            //}

        })
        .on('end', function (data) {
            
            if(found === false)
            {
            
                       
                            request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSpeak", function (error, response, body) {
            
            
                            var speechOutput = "Diesen Professor kenne ich nicht";
                            var reprompt = "Möchten sie noch etwas wissen?";
            
                            var header = "HTL Leonding Teacher";
            
                            var shouldEndSession = false;
            
                            var sessionAttributes = {
                                "speechOutput": speechOutput,
                                "repromptText": reprompt
            
            
                            }
            
                            callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));
                             
            });
                }
                
           


        });
        
    }

}


function handleYesIntent(intent, session, callback) {
    var speechOutput = "Super! Was?";
    var reprompt = speechOutput;
    var shouldEndSession = false;

    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, reprompt, shouldEndSession))
}

function handleAvIntent(intent, session, callback) {
    request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSpeak", function (error, response, body) {

        if (intent.slots.Abteilung.value.toLowerCase() === "elektronik") {
            var speechOutput = "Der Abteilungsvorstand der Elektronik ist Diplom Ingenieur Alfred Wiedermann";
            var reprompt = speechOutput;
            var shouldEndSession = false;
        }
        else {
            var speechOutput = "Der Abteilungsvorstand der Informatik ist Diplom Ingenieur Richard Kainerstorfer";
            var reprompt = speechOutput;
            var shouldEndSession = false;
        }


        callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, reprompt, shouldEndSession));

    });

}


function handleDirektorIntent(intent, session, callback) {
    request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSpeak", function (error, response, body) {

        var speechOutput = "Der Direktor der HTL Leonding ist Diplom Ingenieur Wolfgang Holzer";
        var reprompt = speechOutput;
        var shouldEndSession = false;

        callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, reprompt, shouldEndSession));

    });
}


function handleNoIntent(intent, session, callback) {
    handleFinishSessionRequest(intent, session, callback)
}

function handleInfoIntent(intent, session, callback) {
    var speechOutput = " Wir haben einen Error"

    getJSON(function (data) {
        if (data != "ERROR") {
            var speechOutput = data
        }

        callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", false))
    })

}

function url() {

    return "https://leonid-da.herokuapp.com/rs/leonidserver";


}

function getJSON(callback) {
    request.get(url(), function (error, response, body) {
        var d = JSON.parse(body)

        var result = d.message


        if (result != "") {
            callback(result)
        }
        else {
            callback("ERROR")
        }
    })
}

function handleGetHelpRequest(intent, session, callback) {
    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};

    }
}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
       request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSpeak", function (error, response, body) {
           
           setTimeout(function () {
               
               ;

    request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSitDown", function (error, response, body) {
        
      callback(session.attributes,
            buildSpeechletResponseWithoutCard("Auf wiedersehen! Ich hoffe ich konnte ihnen helfen.", "", true))

        
            
         });
         
           },1500);
    });

}


function handleInHouseIntent(intent, session, callback) {
    if (intent.slots.Teacher.value != null) {
        var teacher = intent.slots.Teacher.value.toLowerCase();

        if (!teachers[teacher]) {
            var speechOutput = "Dieser Professor ist mir leider nicht bekannt."
            var reprompt = "Versuche es mit einem anderen Professor"
            var header = "Kenne ich nicht"
        }
        else {

            speechOutput = "Ich weiß nicht ob Professor " + teacher + " im Haus ist"
            reprompt = "NotReallyImplemented"
            header = teacher
        }

        var shouldEndSession = false

        callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))
    }
    else {
        var speechOutput = "Was hast du gesagt? Versuchs nochmal";
        var repromt = "Was?";
        var header = "Was?";

        var shouldEndSession = false;

        callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))
    }
}


function handlePostRequest(intent, session, callback) {
    if (intent.slots.Something.value != null) {

        var message = intent.slots.Something.value.toLowerCase();


        request.get("https://leonid-da.herokuapp.com/rs/leonidserver/query?msg=" + message, function (error, response, body) {

            var d = JSON.parse(body)
            var speechOutput = message;
            callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", false));
        });

    }
    else {
        var speechOutput = "Was hast du gesagt? Versuchs nochmal";


        callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", false))
    }


}


function WebUntisPost(intent, session, callback) {

    var myJSON = {
        "id": "LUKI",
        "method": "authenticate",
        "params": {"user": "in120083", "password": "luki05525252", "client": "CLIENT"},
        "jsonrpc": "2.0"
    };

    var myJSONObject = {
        "id": "LUKI",
        "method": "getTeachers",
        "params": {},
        "jsonrpc": "2.0"
    };


    request({
        url: "https://mese.webuntis.com/WebUntis/jsonrpc.do?school=htbla%20linz%20leonding",
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",  // <--Very important!!!
        },
        body: myJSON

    }, function (error, response, body) {


        request.get("https://leonid-da.herokuapp.com/rs/leonidserver/query?msg=" + body.result.sessionId, function (error, response, body) {


            request.get("https://leonid-da.herokuapp.com/rs/leonidserver", function (error, response, body) {


                request.post(
                    'https://mese.webuntis.com/WebUntis/jsonrpc.do;jsessionid=' + body,
                    {json: myJSONObject},
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {


                            console.log(body)
                            var speechOutput = body.id;
                            callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", false));
                        }
                    }
                );

            });


        });

    });


}


function GetNextHoliday(intent, session, callback) {
    var items = [];

    var myJSON = {
        "id": "LUKI",
        "method": "authenticate",
        "params": {"user": "in120083", "password": "luki05525252", "client": "CLIENT"},
        "jsonrpc": "2.0"
    };

    var myJSONObject = {
        "id": "LUKI",
        "method": "getHolidays",
        "params": {},
        "jsonrpc": "2.0"
    };


    request({
        url: "https://mese.webuntis.com/WebUntis/jsonrpc.do?school=htbla%20linz%20leonding",
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: myJSON

    }, function (error, response, body) {

        var sessionid = body.result.sessionId;

        request.get("https://leonid-da.herokuapp.com/rs/leonidserver/query?msg=" + body.result.sessionId, function (error, response, body) {


            request.get("https://leonid-da.herokuapp.com/rs/leonidserver", function (error, response, body) {


                request.post(
                    'https://mese.webuntis.com/WebUntis/jsonrpc.do;jsessionid=' + sessionid,
                    {json: myJSONObject},
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {


                            //  console.log("------------------------------------")

                            Date.prototype.yyyymmdd = function () {
                                var mm = this.getMonth() + 1;
                                var dd = this.getDate();

                                return [this.getFullYear(),
                                    (mm > 9 ? '' : '0') + mm,
                                    (dd > 9 ? '' : '0') + dd
                                ].join('');
                            };

                            var date = new Date();

                            date = date.yyyymmdd()
                            console.log(date);
                            var helper = false;
                            Boolean(helper);

                            // console.log("---------------------------------")


                            for (var i = 1; i <= body.result.length - 1; i++) {


                                console.log(parseInt(body.result[i].startDate))
                                var startDay, startMonth, endDay, endMonth;

                                var x = parseInt(body.result[i].startDate)
                                var y = parseInt(body.result[i].endDate)

                                if (x > parseInt(date) && helper === false) {
                                    helper = "true";

                                    startDay = x.toString().substring(6, 8)
                                    startMonth = x.toString().substring(4, 6)
                                    endDay = y.toString().substring(6, 8);
                                    endMonth = y.toString().substring(4, 6);

                                    if (startDay.includes(0)) {
                                        startDay = x.toString().substring(7, 8);
                                    }
                                    if (startMonth.includes(0)) {
                                        startMonth = x.toString().substring(5, 6);
                                    }
                                    if (endDay.includes(0)) {
                                        endDay = y.toString().substring(7, 8);
                                    }
                                    if (endMonth.includes(0)) {
                                        endMonth = y.toString().substring(5, 6);
                                    }


                                    var speechOutput = "Die nächsten Ferien sind: " + body.result[i].longName + " und beginnen am  "
                                        + startDay + " ten " + startMonth + " ten und enden am " + endDay + " ten " + endMonth + " ten";


                                    request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSpeak", function (error, response, body) {

                                        callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", false));


                                    });


                                    //  callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", false));


                                }


                            }


                        }


                    });

            });


        });

    });

}


function getTimetable(intent, session, callback) {

    var Klasse = intent.slots.Klasse.value


    console.log(Klasse.toLowerCase())


    if (Klasse.toString().toLowerCase().includes("eins") && Klasse.toString().toLowerCase().includes("a") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("g")) {
        Klasse = "1ahbg"
    }
    else if (Klasse.toString().toLowerCase().includes("zwei") && Klasse.toString().toLowerCase().includes("a") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("g")) {
        Klasse = "2ahbg"
    }
    else if (Klasse.toString().toLowerCase().includes("drei") && Klasse.toString().toLowerCase().includes("a") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("g")) {
        Klasse = "3ahbg"
    }
    else if (Klasse.toString().toLowerCase().includes("vier") && Klasse.toString().toLowerCase().includes("a") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("g")) {
        Klasse = "4ahbg"
    }
    else if (Klasse.toString().toLowerCase().includes("fünf") && Klasse.toString().toLowerCase().includes("a") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("g")) {
        Klasse = "5ahbg"
    }
    else if (Klasse.toString().toLowerCase().includes("eins") && Klasse.toString().toLowerCase().includes("c") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("f")) {
        Klasse = "1chif"
    }
    else if (Klasse.toString().toLowerCase().includes("zwei") && Klasse.toString().toLowerCase().includes("c") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("f")) {
        Klasse = "2chif"
    }
    else if (Klasse.toString().toLowerCase().includes("drei") && Klasse.toString().toLowerCase().includes("c") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("f")) {
        Klasse = "3chif"
    }
    else if (Klasse.toString().toLowerCase().includes("fünf") && Klasse.toString().toLowerCase().includes("c") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("f")) {
        Klasse = "5chif"
    }
    else if (Klasse.toString().toLowerCase().includes("eins") && Klasse.toString().toLowerCase().includes("b") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("f")) {
        Klasse = "1bhif"
    }
    else if (Klasse.toString().toLowerCase().includes("zwei") && Klasse.toString().toLowerCase().includes("b") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("f")) {
        Klasse = "2bhif"
    }
    else if (Klasse.toString().toLowerCase().includes("drei") && Klasse.toString().toLowerCase().includes("b") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("f")) {
        Klasse = "3bhif"
    }
    else if (Klasse.toString().toLowerCase().includes("vier") && Klasse.toString().toLowerCase().includes("b") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("f")) {
        Klasse = "4bhif"
    }
    else if (Klasse.toString().toLowerCase().includes("fünf") && Klasse.toString().toLowerCase().includes("b") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("f")) {
        Klasse = "5bhif"
    }
    else if (Klasse.toString().toLowerCase().includes("eins") && Klasse.toString().toLowerCase().includes("a") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("f")) {
        Klasse = "1ahif"
    }
    else if (Klasse.toString().toLowerCase().includes("zwei") && Klasse.toString().toLowerCase().includes("a") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("f")) {
        Klasse = "2ahif"
    }
    else if (Klasse.toString().toLowerCase().includes("drei") && Klasse.toString().toLowerCase().includes("a") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("f")) {
        Klasse = "3ahif"
    }
    else if (Klasse.toString().toLowerCase().includes("vier") && Klasse.toString().toLowerCase().includes("a") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("f")) {
        Klasse = "4ahif"
    }
    else if (Klasse.toString().toLowerCase().includes("fünf") && Klasse.toString().toLowerCase().includes("a") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("f")) {
        Klasse = "5ahif"
    }
    else if (Klasse.toString().toLowerCase().includes("eins") && Klasse.toString().toLowerCase().includes("d") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("f")) {
        Klasse = "1dhif"
    } else if (Klasse.toString().toLowerCase().includes("eins") && Klasse.toString().toLowerCase().includes("a") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("e")) {
        Klasse = "1ahel"
    } else if (Klasse.toString().toLowerCase().includes("zwei") && Klasse.toString().toLowerCase().includes("a") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("e")) {
        Klasse = "2ahel"
    } else if (Klasse.toString().toLowerCase().includes("drei") && Klasse.toString().toLowerCase().includes("a") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("e")) {
        Klasse = "3ahel"
    } else if (Klasse.toString().toLowerCase().includes("vier") && Klasse.toString().toLowerCase().includes("a") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("e")) {
        Klasse = "4ahel"
    } else if (Klasse.toString().toLowerCase().includes("fünf") && Klasse.toString().toLowerCase().includes("a") &&
        Klasse.toString().toLowerCase().includes("h") && Klasse.toString().toLowerCase().includes("e")) {
        Klasse = "5ahel"
    }
    else {
        request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSpeak", function (error, response, body) {


            var speechOutput = "Diese Klasse kenne ich noch nicht. Tut mir leid";

            buildSpeechletResponseWithoutCard(speechOutput, "", false)


            callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", false));

        });
    }


    Klasse = Klasse.toUpperCase();

    console.log(Klasse)
    var speechOutput = "";
    var timetable = "";

    var myJSON = {
        "id": "LUKI",
        "method": "authenticate",
        "params": {"user": "in120083", "password": "luki05525252", "client": "CLIENT"},
        "jsonrpc": "2.0"
    };


    var JSONObjectSubjects = {
        "id": "LUKI",
        "method": "getSubjects",
        "params": {},
        "jsonrpc": "2.0"
    };

    var JSONObjectKlassen = {
        "id": "LUKI",
        "method": "getKlassen",
        "params": {},
        "jsonrpc": "2.0"
    };


    request({
        url: "https://mese.webuntis.com/WebUntis/jsonrpc.do?school=htbla%20linz%20leonding",
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: myJSON

    }, function (error, response, body) {


        request.get("https://leonid-da.herokuapp.com/rs/leonidserver/query?msg=" + body.result.sessionId, function (error, response, body) {


            request.get("https://leonid-da.herokuapp.com/rs/leonidserver", function (error, response, body) {


                var sessionid = body;


                request.post(
                    'https://mese.webuntis.com/WebUntis/jsonrpc.do;jsessionid=' + sessionid,
                    {json: JSONObjectKlassen},
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {


                            var klassen = body;

                            for (var i = 0; i <= klassen.result.length - 1; i++) {
                                var newklasse = klassen.result[i].name.toUpperCase();

                                if (newklasse === Klasse) {

                                    // console.log("___________________________")


                                    var myJSONObject = {
                                        "id": "LUKI",
                                        "method": "getTimetable",
                                        "params": {"id": body.result[i].id, "type": 1},
                                        "jsonrpc": "2.0"
                                    };


                                    request.post(
                                        'https://mese.webuntis.com/WebUntis/jsonrpc.do;jsessionid=' + sessionid,
                                        {json: myJSONObject},
                                        function (error, response, body) {
                                            if (!error && response.statusCode == 200) {

                                                console.log(body.result)

                                                var timetable = body;

                                                var timetablelength = body.result.length;


                                                request.post(
                                                    'https://mese.webuntis.com/WebUntis/jsonrpc.do;jsessionid=' + sessionid,
                                                    {json: JSONObjectSubjects},
                                                    function (error, response, body) {
                                                        if (!error && response.statusCode == 200) {


                                                            var subjectlength = body.result.length;


                                                            for (var i = 0; i <= timetablelength - 1; i++) {


                                                                for (var x = 0; x <= subjectlength - 1; x++) {

                                                                    if (body.result[x].id === timetable.result[i].su[0].id) {

                                                                        if (timetable.result[i].startTime < 1000) {
                                                                            var startTimeHour = timetable.result[i].startTime.toString().substring(0, 1);
                                                                            var startTimeMinute = timetable.result[i].startTime.toString().substring(1, 3)
                                                                        }
                                                                        else {
                                                                            startTimeHour = timetable.result[i].startTime.toString().substring(0, 2);
                                                                            startTimeMinute = timetable.result[i].startTime.toString().substring(2, 4)
                                                                        }
                                                                        if (timetable.result[i].endTime < 1000) {
                                                                            var endTimeHour = timetable.result[i].endTime.toString().substring(0, 1);
                                                                            var endTimeMinute = timetable.result[i].endTime.toString().substring(1, 3)
                                                                        }
                                                                        else {
                                                                            endTimeHour = timetable.result[i].endTime.toString().substring(0, 2);
                                                                            endTimeMinute = timetable.result[i].endTime.toString().substring(2, 4)
                                                                        }


                                                                        speechOutput = speechOutput + " Von " + startTimeHour + " Uhr " + startTimeMinute + " bis " +
                                                                            endTimeHour + " Uhr " + endTimeMinute + " ist " + body.result[x].longName + ".";
                                                                    }
                                                                }

                                                            }

                                                            request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSpeak", function (error, response, body) {


                                                                callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", false));

                                                            });
                                                        }


                                                    });


                                            }
                                        });

                                }
                            }
                        }
                    });


            });


        });

    });
}


function getKlassen(intent, session, callback) {
    
    
    if (intent.slots.Schueler.value == null) {
        var speechOutput = "Diesen Schüler kenne ich nicht";

                var reprompt = "Möchten sie noch etwas wissen?";

                var header = "HTL Leonding Schüler";

                var shouldEndSession = false;

                var sessionAttributes = {
                    "speechOutput": speechOutput,
                    "repromptText": reprompt


                }

                callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));

    }
    
    var found= false;

    fs.createReadStream('Schueler.csv')
        .pipe(csv())
        .on('data', function (data) {

            var arr = data.toString().split(";");
            var name = arr[1] + " " + arr[2];
            

            var array = arr[0].split()

            if (intent.slots.Schueler.value.toLowerCase() === name.toLowerCase()) {

                request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSpeak", function (error, response, body) {


                    var speechOutput = intent.slots.Schueler.value + " geht in die " + arr[0].substring(0, 2) + " " + arr[0].substring(2, 5);

                    var header = "HTL Leonding Schüler";

                var shouldEndSession = false;

                var sessionAttributes = {
                    "speechOutput": speechOutput,
                    "repromptText": reprompt


                }
                found=true;

                callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));
                
                

                });
            }


        })
        .on('end', function (data) {
            
            if(found === false)
            {
            request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=LeonidSpeak", function (error, response, body) {


                var speechOutput = "Diesen Schüler kenne ich nicht";

                var header = "HTL Leonding Schüler";

                var shouldEndSession = false;

                var sessionAttributes = {
                    "speechOutput": speechOutput,
                    "repromptText": reprompt


                }

                callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));

            });
            
            }
        });


}


function handleStartAnimation(intent, session, callback) {


    request.get("http://leonid-da.herokuapp.com/rs/leonidserver/animation/?name=wakeup", function (error, response, body) {

        var speechOutput = "Ich winke weil ich es gerne mache, nicht weil du es mir sagst";

        buildSpeechletResponseWithoutCard(speechOutput, "", false)


        callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", false));
    });


}


// ------- Helper functions to build responses for Alexa -------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}


function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
