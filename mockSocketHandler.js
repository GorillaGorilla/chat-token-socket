/**
 * Created by frederickmacgregor on 22/11/2016.
 */
module.exports = {
    players: {},
    addPlayer : function(player){
        this.players[player.username] = player;
    },
    sendMessages: function(msg){
        var self = this;
        for (var playerId in self.players){
            // debug('player', playerId);
            self.emit(playerId, 'new message', msg);  //^^1
        }
    },
    sendGameState: function(msg){
        var self = this;
        for (var playerId in self.players){
            // debug('player', playerId);
            self.emit(playerId, 'gameState', msg);  //^^1
        }
    },
    emit : function(id, event, msg) {
        var emitted = {
            id: id,
            type: event,
            data: msg,
            timestamp: Date.now(),
            log: function () {
                console.log(this.type + " emitted to player " + this.id + " with data: ", data);
            }
        };
        if (this.events[id]){
            this.events[id].push(emitted);
        }else{
            this.events[id] = [];
            this.events[id].push(emitted);
        }

    },
    removePlayer : function(player){
        delete this.players[player.username];
    },
    events : {},
    reset : function(){
        var self = this;
        self.players = {};
        self.events = {};
    }

};