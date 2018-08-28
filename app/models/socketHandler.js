const { assetSchema, playerSchema, objSchema } = require('./js-binary-schemas');
const debug = require('debug')

module.exports = {
  players: {},
  addPlayer : function(player){
      this.players[player.username] = player;
  },
  sendMessages: function(msg){
      var self = this;
      for (var playerId in self.players){
          debug('player', playerId);
          self.emit(playerId, 'new message', msg);  //^^1
      }
  },
  sendGameState: function(msg){
      var self = this;
      const compressedMsg = objSchema.encode({
          players: msg.players.map(player => playerSchema.encode(player)),
          assets: msg.assets.map(asset => assetSchema.encode(asset)),
      });

      for (var playername in self.players){
          debug('player', playername);
          self.emit(playername, 'gameState', { stuff: compressedMsg });  //^^1
      }
  },
  emit :function(name, event, msg){
      console.log('msg', msg);
      this.players[name].emit(event, msg);
  },
  removePlayer : function(player){
      delete this.players[player.username];
  }


};