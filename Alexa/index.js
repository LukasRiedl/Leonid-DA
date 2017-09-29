var request = require("request")

var teachers = {
    "professor stütz" : {
        "Fach" : "Tschawa Programmieren"
    },
    "professor bucek" : {
        "Fach" : "SieScharb Programmieren"
    },
    "professor hofer" : {
        "Fach" : "Mathematik"
    },
    "professor stöttinger" : {
        "Fach" : "C Programmieren"
    },
    "professor ruckerbauer" : {
        "Fach" : "Physik"
    }
}


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

    // if (event.session.application.applicationId !== "") {
    //     context.fail("Invalid Application ID");
    //  }

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

    var intent = intentRequest.intent
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here

    if(intentName === "TeacherIntent")
    {
        handleTeacherIntent(intent, session, callback)

    }else if(intentName === "AMAZON.YesIntent")
    {
        handleYesIntent(intent, session, callback)
    }else if(intentName === "AMAZON.NoIntent")
    {
        handleNoIntent(intent, session, callback)
    }else if(intentName === "AMAZON.StopIntent")
    {
        handleFinishSessionRequest(intent, session,callback)
    }else if(intentName === "GetRequestIntent")
    {
        handleInfoIntent(intent,session,callback)
    }else
    {
        throw "invalid Intent"
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {

}

// ------- Skill specific logic -------

function getWelcomeResponse(callback) {
    var speechOutput = "Hallo Ich bin Leonid. Ich kann ihnen sagen welches Fach welcher Professor unterrichtet. " +
     "Sagen Sie zum Beispiel: Welches Fach unterrichtet Professor Stütz ";

     var reprompt = "Sagen Sie Welches Fach unterrichtet Professor Stütz";

     var header = "HTL Leonding Info"; 

     var shouldEndSession = false;

     var sessionAttributes = {
        "speechOutput" : speechOutput,
        "repromptText" : reprompt
     }

     callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));
    
}

function handleTeacherIntent(intent, session, callback)
{
    var teacher = intent.slots.Teacher.value.toLowerCase();

    if(!teachers[teacher])
    {
        var speechOutput = "Dieser Professor ist mir leider nicht bekannt."
        var reprompt = "Versuche es mit einem anderen Professor"
        var header = "Kenne ich nicht"
    }
    else
    {
        var fach = teachers[teacher].Fach
         speechOutput = teacher + " unterrichtet " + fach + ". Wollen Sie noch nach einem anderen Professor fragen?"
         reprompt = "Wollen Sie noch nach einem anderen Professor fragen?"
         header = teacher
    }

    var shouldEndSession = false

callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))

}

function handleYesIntent(intent, session, callback)
{
    speechOutput = "Super! Welcher Professor?";
    reprompt = speechOutput;
    shouldEndSession = false;

     callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, reprompt,shouldEndSession))
}

function handleNoIntent(intent, session, callback)
{
    handleFinishSessionRequest(intent, session, callback)
}

function handleInfoIntent(intent,session,callback)
{
    var speechOutput = " Wir haben einen Error"
    
    getJSON(function(data)
    {
        if(data != "ERROR")
        {
            var speechOutput = data
        }

        callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", false))
    })

}

function url()
{
  //  return "http://192.168.56.1:8080/leonid/rs/leonid";
   return "https://jsonplaceholder.typicode.com/users/1";
   // return "http://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch=Albert+Einstein";
   //return "http://localhost:8080/leonid/rs/leonid";
}

function getJSON(callback)
{
    request.get(url(), function(error, response, body){
        var d = JSON.parse(body)
       // var result = d.query.search.counters[0].title
       //var result = d.query.searchinfo.totalhits
       var result = d.name
       //var result = body
        if(result != "")
        {
            callback(result)
        }
        else
        {
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
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Auf Wiedersehen! Ich hoffe ich konnte ihnen helfen.", "", true));
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

