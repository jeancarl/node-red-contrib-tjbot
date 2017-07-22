/***************************************************************************
* Copyright 2017 IBM
*
*   TJBot Nodes for Node-RED
*
*   By JeanCarl Bisson (@dothewww)
*   More info: https://ibm.biz/node-red-contrib-tjbot
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
****************************************************************************/

var tj = require("./tjbot.js");

module.exports = function(RED) {
  function broadcastText(botId, text) {
    for(var id in tj.listeners[botId]) {
      tj.listeners[botId][id](text);
    }
  }

  function addListener(botId, nodeId, callback) {
    if(!tj.listeners.hasOwnProperty(botId)) {
      tj.listeners[botId] = {};
    }

    if(!isListening(botId, nodeId)) {
      tj.listeners[botId][nodeId] = callback;

      // If this is the first listener, tell bot to start listening.
      if(Object.keys(tj.listeners[botId]).length == 1) {
        tj.bots[botId].listen(function(text) {
          broadcastText(botId, text);
        });
      }
    }
  }

  function removeListener(botId, nodeId) {
    if(!tj.listeners.hasOwnProperty(botId)) {
      return;
    }

    if(isListening(botId, nodeId)) {
      delete tj.listeners[botId][nodeId];

      // If this is the last listener, tell bot to stop listening.
      if(Object.keys(tj.listeners[botId]).length == 0) {
        tj.bots[botId].stopListening();
      }
    }
  }

  function isListening(botId, nodeId) {
    return tj.listeners.hasOwnProperty(botId) && tj.listeners[botId].hasOwnProperty(nodeId);
  }

  function TJBotNodeListen(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on("input", function(msg) {
      switch(msg.mode) {
        case "start":
        case "resume":
          this.status({fill:"green", shape:"dot", text:"listening"});

          addListener(config.botId, config.id, function(text) {
            node.send({payload:text});
          });
        break;
        case "pause":
        case "stop":
          this.status({fill:"red", shape:"dot", text:msg.mode == "pause" ? "paused": "stopped"});

          removeListener(config.botId, config.id);
        break;
        default:
          node.error("unknown mode passed");
        break;
      }
    });

    node.on("close", function() {
      if(isListening(config.botId, config.id)) {
        removeListener(config.botId, config.id);
      }
    });
  }
  RED.nodes.registerType("tjbot-listen", TJBotNodeListen);
}
