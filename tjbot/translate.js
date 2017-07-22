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
  function TJBotNodeTranslate(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on("input", function(msg) {
      var mode = msg.mode||config.mode;

      switch(mode.toLowerCase()) {
        case "identifylanguage":
          tj.bots[config.botId].identifyLanguage(msg.payload).then(function(languages) {
            msg.response = languages;
            node.send(msg);
          });
        break;
        case "istranslatable":
          var srcLang = msg.srcLang||config.srcLang;
          var targetLang = msg.targetLang||config.targetLang;

          tj.bots[config.botId].isTranslatable(srcLang, targetLang).then(function(result) {
            msg.response = result;
            node.send(msg);
          });
        break;
        case "translate":
          var srcLang = msg.srcLang||config.srcLang;
          var targetLang = msg.targetLang||config.targetLang;

          tj.bots[config.botId].translate(msg.payload, srcLang, targetLang).then(function(translation) {
            msg.response = translation;
            node.send(msg);
          });
        break;
      }
    });
  }
  RED.nodes.registerType("tjbot-translate", TJBotNodeTranslate);
}
