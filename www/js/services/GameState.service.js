/**
 * Created by frederickmacgregor on 05/12/2016.
 */
angular.module('map').service('GameState', function(){
    this.state = null;
    var setGameState = function(state){
        this.state = state;
    };
    var getGameState = function(){
        return this.state;
    };
    return {
        getGameState: getGameState,
        setGameState: setGameState
    };
});
