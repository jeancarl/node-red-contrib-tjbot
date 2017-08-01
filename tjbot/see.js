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
  function TJBotNodeSee(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on("input", function(msg) {
      var mode = msg.mode||config.mode;

      switch(mode.toLowerCase()) {
        case "read":
          tj.bots[config.botId].read().then(function(texts) {
            msg.payload = texts;
            node.send(msg);
          });
        break;
        case "see":
          tj.bots[config.botId].see().then(function(objects) {
            msg.payload = objects;
            node.send(msg);
          });
        break;
        case "takephoto":
          var width = msg.hasOwnProperty("width") ? msg.width : config.width;
          var height = msg.hasOwnProperty("height") ? msg.height : config.height;
          var verticalFlip = msg.hasOwnProperty("verticalFlip") ? msg.verticalFlip : config.verticalFlip;
          var horizontalFlip = msg.hasOwnProperty("horizontalFlip") ? msg.horizontalFlip : config.horizontalFlip;

          tj.bots[config.botId].configuration.see.camera.width = width;
          tj.bots[config.botId].configuration.see.camera.height = height;
          tj.bots[config.botId].configuration.see.camera.verticalFlip = verticalFlip;
          tj.bots[config.botId].configuration.see.camera.horizontalFlip = horizontalFlip;

          tj.bots[config.botId].takePhoto().then(function(filePath) {
            msg.filename = filePath;
            node.send(msg);
          });
        break;
      }
    });
  }
  RED.nodes.registerType("tjbot-see", TJBotNodeSee);
}
