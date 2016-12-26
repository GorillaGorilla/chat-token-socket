/**
 * Created by frederickmacgregor on 20/12/2016.
 */

var ConversationV1 = require('watson-developer-cloud/conversation/v1'),
    Attack = require('./attack.controller');

// Set up Conversation service wrapper.
var conversation = new ConversationV1({
    username: '9cce8b2c-68b1-4037-82fd-033ca612689b', // replace with username from service key
    password: 'EFfR1a5Z0VET', // replace with password from service key
    path: { workspace_id: 'd7b2070c-66cb-4757-b54a-4a723ab06a97' }, // replace with workspace ID
    version_date: '2016-07-11'
});

// Start conversation with empty message.
// conversation.message({}, processResponse);


exports.passToWatson = function(input, callback){

    var messageStuff = {
        input: { text: input.text },
        context : input.context
    };

    conversation.message(messageStuff, function(err, response){
        if (err) {
            console.error(err); // something went wrong
            return callback(err);
        }
        if (response.intents.length > 0) {
            console.log('Detected intent: #' + response.intents[0].intent);
        }

        // if (response.intents[0].intent === 'missedevents'){
        //     Attack.getRecentAttacks({},function(err, result){
        //
        //     });
        // }

        if (response.output.text.length != 0) {
            console.log(response.output.text[0]);
            callback(null,{
                chatResponse: response.output.text[0],
                context: response.context,
                raw: response
            });
        }
    });

};