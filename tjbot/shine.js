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
  function TJBotNodeShine(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    tj.bots[config.botId].shine("off");

    node.on("input", function(msg) {
      var color = msg.color||config.color;
      var duration = parseFloat(msg.duration||config.duration);
      var mode = msg.mode||config.mode;

      switch(mode.toLowerCase()) {
        case "shine":
          if(color == "random") {
            tj.bots[config.botId].shine(tj.bots[config.botId].randomColor());
          } else {
            tj.bots[config.botId].shine(color);
          }
        break;
        case "pulse":
          tj.bots[config.botId].pulse(color, duration);
        break;
      }

    });
  }
  RED.nodes.registerType("tjbot-shine", TJBotNodeShine);
}
