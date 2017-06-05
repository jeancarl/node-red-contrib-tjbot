/***************************************************************************
* Copyright 2017 IBM
*
*   TJ Bot Nodes for Node-RED
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

var fs = require("fs");
var bots = {};
var TJBot = require("tjbot");

module.exports = function(RED) {
    function TJBotNodeConfig(config) {
      RED.nodes.createNode(this, config);
      this.botGender = config.botGender;
      this.name = config.name;
      this.services = {};
      this.hardware = ["led", "servo"];
      this.name = config.name;

      this.configuration = {
        robot: {
          gender: this.botGender,
          name: this.name
        }
      };

      if(this.credentials.taUsername.length && this.credentials.taPassword.length) {
        this.services.tone_analyzer = {
          username: this.credentials.taUsername,
          password: this.credentials.taPassword
        };
      }

      if(this.credentials.cUsername.length && this.credentials.cPassword.length && this.credentials.cWorkspaceId.length) {
        this.services.conversation = {
          username: this.credentials.cUsername,
          password: this.credentials.cPassword,
          workspaceId: this.credentials.cWorkspaceId,
        };
      }

      if(this.credentials.ltUsername.length && this.credentials.ltPassword.length) {
        this.services.language_translator = {
    			username: this.credentials.ltUsername,
    			password: this.credentials.ltPassword
    		};
      }

      if(this.credentials.vrApiKey.length) {
        this.services.visual_recognition = {
          api_key: this.credentials.vrApiKey
        };
        this.hardware.push("camera");
      }

      bots[this.id] = new TJBot(this.hardware, this.configuration, this.services);
    }
    RED.nodes.registerType("tjbot-config", TJBotNodeConfig, {credentials: {
      taUsername: {type:"text"},
      taPassword: {type:"password"},
      cUsername: {type:"text"},
      cPassword: {type:"password"},
      cWorkspaceId: {type:"text"},
      ltUsername: {type:"text"},
      ltPassword: {type:"password"},
      vrApiKey: {type:"password"}
    }});

    function TJBotNodeWave(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      node.on("input", function(msg) {
        bots[config.botId].wave();
      });
    }
    RED.nodes.registerType("tjbot-wave", TJBotNodeWave);

    function TJBotNodeLED(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      bots[config.botId].shine("off");

      node.on("input", function(msg) {
        var color = msg.color||config.color;
        bots[config.botId].shine(color);
      });
    }
    RED.nodes.registerType("tjbot-led", TJBotNodeLED);

    function TJBotNodeAnalyzeTone(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      node.on("input", function(msg) {
        bots[config.botId].analyzeTone(msg.payload).then(function(response) {
          msg.response = response;
          node.send(msg);
        });
      });
    }
    RED.nodes.registerType("tjbot-analyze-tone", TJBotNodeAnalyzeTone);

    function TJBotNodeConverse(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      node.on("input", function(msg) {
  		  var bot = RED.nodes.getNode(config.botId);

  		  var workspaceId = bot.services.conversation.workspaceId;
  		  var payload = msg.payload;

        bots[config.botId].converse(workspaceId, payload, function(response) {
          msg.response = response;
          node.send(msg);
        }, function(error) {
          node.error(error);
        });
      });
    }
    RED.nodes.registerType("tjbot-converse", TJBotNodeConverse);

    function TJBotNodeTranslate(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      node.on("input", function(msg) {
  		  var bot = RED.nodes.getNode(config.botId);

  		  var payload = msg.payload||config.payload;
  		  var srcLang = msg.srcLang||config.srcLang;
  		  var targetLang = msg.targetLang||config.targetLang;

        bots[config.botId].translate(payload, srcLang, targetLang).then(function(translation) {
  			  msg.response = translation;
  			  node.send(msg);
        });
      });
    }
    RED.nodes.registerType("tjbot-translate", TJBotNodeTranslate);

    function TJBotNodeSee(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      node.on("input", function(msg) {
        var bot = RED.nodes.getNode(config.botId);

        bots[config.botId].see().then(function(objects) {
          msg.payload = objects;
          node.send(msg);
        });
      });
    }
    RED.nodes.registerType("tjbot-see", TJBotNodeSee);

    function TJBotNodeTakePhoto(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      node.on("input", function(msg) {
        var bot = RED.nodes.getNode(config.botId);

        bots[config.botId].takePhoto().then(function(filePath) {
          msg.payload = filePath;
          node.send(msg);
        });
      });
    }
    RED.nodes.registerType("tjbot-takephoto", TJBotNodeTakePhoto);
}
