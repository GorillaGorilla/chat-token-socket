/**
 * Created by frederickmacgregor on 26/12/2016.
 */
Attack = require('mongoose').model('Attack');


exports.getRecentAttacks = function(input, callback){

    // param not used because cant be bothered to look at mongoose docs filter instead.
    var params = input.username ? {occurred : { $gte : input.dateFrom}, username: input.username } : {occurred : { $gte : input.dateFrom}};
    Attack.find({occurred : { $gte : input.dateFrom}, game: input.gameId}, function(err, docs){
        if(err){console.log('err', err);
        return callback(err);

        }

        docs.filter(function(doc){
            return (doc.owner === input.username || doc.target === input.username)
        });

        callback(null, docs);
        console.log('attacks since time given',docs); //prints empty arry []
    });


};



exports.formatAsMessages = function (attackArray,username){
    var messages = [];
    attackArray
        .forEach(function(att){
            if(att.type === 'FLAK HIT'){
                messages.push(writeMessageFlakHitString(att, username));
            }else if (att.type === "BOMBER DESTROYED"){
                messages.push(writeMessageBomberDestroyedString(att, username));
            }else if (att.type ==="BOMB HIT MOBILE AA"){
                messages.push(writeMessageBombHitAA(att, username));
            }

    });

    return messages;
};


function writeMessageFlakHitString(att, username){
    var result = "";
        if (username === att.owner){
            result += "Your mobile AA hit " + att.target + "'s bomber at x: " + att.x + " y: " + att.y + ".";
        }else if (username === att.target){
            result += "Your bomber was hit by flak at position x: " + att.x + " y: " + att.y + " fired by " + att.owner +"'s AA gun.";
        }
        result = {username: 'Game', message: result};
        return result;
};


function writeMessageBombHitAA(att, username){
    var result = "";
    if (username === att.owner){
        result += "Your bomb hit " + att.target + "'s mobile AA gun at x: " + att.x + " y: " + att.y + ".";
    }else if (username === att.target){
        result += "Your mobile AA was was bombed at position x: " + att.x + " y: " + att.y + " dropped by " + att.owner +"'s bomber.";
    }
    result = {username: 'Game', message: result};
    return result;
};


function writeMessageBomberDestroyedString(att, username){
    var result = "";
    if (username === att.owner){
        result += "You destroyed a bomber of " + att.target + " at x: " + att.x + " y: " + att.y + "!";
    }else if (username === att.target){
        result += att.owner + " shot down your bomber at position x: " + att.x + " y: " + att.y + "!";
    }
    result = {username: 'Game', message: result};
    return result;
};


exports.saveAttack = function(obj){
    var attackRecord = new Attack(obj);
    attackRecord.save(function(err){
        if (err){
            console.log('save err', err)
        }else{
            console.log('saved attack record');
        }
    });

};