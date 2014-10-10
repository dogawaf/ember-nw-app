import Ember from 'ember';

export default Ember.Route.extend({
  model: function(){
    var myNodeModule = window.node_require('my-node-module');
    return myNodeModule();
  }
});
