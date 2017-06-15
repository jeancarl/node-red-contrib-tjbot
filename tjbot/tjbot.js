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
var listeners = {};

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

      this.configuration.listen = {
          language: config.listen
      };

      this.configuration.speak = {
          language: config.speak
      };

      if(this.credentials.taUsername && this.credentials.taUsername.length && this.credentials.taPassword && this.credentials.taPassword.length) {
        this.services.tone_analyzer = {
          username: this.credentials.taUsername,
          password: this.credentials.taPassword
        };
      }

      if(this.credentials.cUsername && this.credentials.cUsername.length &&
        this.credentials.cPassword && this.credentials.cPassword.length &&
        this.credentials.cWorkspaceId && this.credentials.cWorkspaceId.length) {
        this.services.conversation = {
          username: this.credentials.cUsername,
          password: this.credentials.cPassword,
          workspaceId: this.credentials.cWorkspaceId,
        };
      }

      if(this.credentials.ltUsername && this.credentials.ltUsername.length && this.credentials.ltPassword && this.credentials.ltPassword.length) {
        this.services.language_translator = {
    			username: this.credentials.ltUsername,
    			password: this.credentials.ltPassword
    		};
      }

      if(this.credentials.ttsUsername && this.credentials.ttsUsername.length && this.credentials.ttsPassword && this.credentials.ttsPassword.length) {
        this.services.text_to_speech = {
    			username: this.credentials.ttsUsername,
    			password: this.credentials.ttsPassword
    		};

        this.configuration.speak = {
          language: 'en-US'
        };

        this.hardware.push("speaker");
        console.log('Using TTS');
      }

      if(this.credentials.sttUsername && this.credentials.sttUsername.length && this.credentials.sttPassword && this.credentials.sttPassword.length) {
        this.services.speech_to_text = {
    			username: this.credentials.sttUsername,
    			password: this.credentials.sttPassword,

    		};

        this.configuration.listen = {
          language: 'en-US'
        };

        this.hardware.push("microphone");
        console.log('Using STT');
      }

      if(this.credentials.vrApiKey && this.credentials.vrApiKey.length) {
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
      ttsUsername: {type:"text"},
      ttsPassword: {type:"password"},
      sttUsername: {type:"text"},
      sttPassword: {type:"password"},
      vrApiKey: {type:"password"}
    }});

    function TJBotNodeWave(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      node.on("input", function(msg) {
        var motion = msg.motion||config.motion;

        switch(motion.toLowerCase()) {
          case "armback":
            bots[config.botId].armBack();
          break;
          case "lowerarm":
            bots[config.botId].lowerArm();
          break;
          case "raisearm":
            bots[config.botId].raiseArm();
          break;
          case "wave":
            bots[config.botId].wave();
          break;
        }

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
        var mode = msg.mode||config.mode;

        switch(mode.toLowerCase()) {
          case "read":
            bots[config.botId].read().then(function(texts) {
              msg.payload = texts;
              node.send(msg);
            });
          break;
          case "see":
            bots[config.botId].see().then(function(objects) {
              msg.payload = objects;
              node.send(msg);
            });
          break;
          case "takephoto":
            bots[config.botId].takePhoto().then(function(filePath) {
              msg.payload = filePath;
              node.send(msg);
            });
          break;
        }
      });
    }
    RED.nodes.registerType("tjbot-see", TJBotNodeSee);

    function broadcastText(botId, text) {
      for(var id in listeners[botId]) {
        console.log("sending text to: "+id);
        listeners[botId][id](text);
      }
    }

    function addListener(botId, nodeId, callback) {
      if(!listeners.hasOwnProperty(botId)) {
        console.log('creating listener list');
        listeners[botId] = {};
      }

      if(!isListening(botId, nodeId)) {
        listeners[botId][nodeId] = callback;

        console.log('added listener');
        console.log(listeners[botId]);
        // If this is the first listener, tell bot to start listening.
        if(Object.keys(listeners[botId]).length == 1) {
          console.log("started listening");
          bots[botId].listen(function(text) {
            console.log('calling broadcast');
            broadcastText(botId, text);
          });
        }
      }
    }

    function removeListener(botId, nodeId) {
      if(!listeners.hasOwnProperty(botId)) {
        console.log('cannot find node to remove');
        return;
      }

      if(isListening(botId, nodeId)) {
        console.log('deleting '+nodeId);
        delete listeners[botId][nodeId];

        console.log(listeners[botId]);

        // If this is the last listener, tell bot to stop listening.
        if(Object.keys(listeners[botId]).length == 0) {
          console.log("stop listening");
          bots[botId].stopListening();
        }
      }
    }

    function isListening(botId, nodeId) {
      return listeners.hasOwnProperty(botId) && listeners[botId].hasOwnProperty(nodeId);
    }

    function TJBotNodeListen(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      node.on("input", function(msg) {
        var bot = RED.nodes.getNode(config.botId);

        switch(msg.mode) {
          case "start":
          case "resume":
            bots[config.botId]._assertCapability('listen');
            console.log(config.id+' listening to '+config.botId);

            this.status({fill:"green",shape:"dot",text:"listening"});
            addListener(config.botId, config.id, function(text) {
              console.log(text);
              node.send({payload:text});
            });
          break;
          case "pause":
          case "stop":
            this.status({fill:"red",shape:"dot",text:msg.mode == "pause" ? "paused": "stopped"});
            console.log(config.id+' stops listening to '+config.botId);
            removeListener(config.botId, config.id);
          break;
          default:
            node.error("unknown mode passed");
          break;
        }
      });

      node.on("close", function() {
        if(isListening(config.botId, config.id)) {
          console.log("cleanup - removing "+config.botId+" "+config.id);
          removeListener(config.botId, config.id);
        }
      });
    }
    RED.nodes.registerType("tjbot-listen", TJBotNodeListen);

    function TJBotNodeSpeak(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      node.on("input", function(msg) {
        var bot = RED.nodes.getNode(config.botId);

        this.status({fill:"green",shape:"dot",text:"speaking"});
        bots[config.botId].speak(msg.payload).then(function() {
          node.send(msg);
          node.status({});
        });
      });
    }
    RED.nodes.registerType("tjbot-speak", TJBotNodeSpeak);
}
