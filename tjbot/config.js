/***************************************************************************
* Copyright 2018 IBM
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
var TJBot = require("tjbot");

module.exports = function(RED) {
  function TJBotNodeConfig(config) {
    RED.nodes.createNode(this, config);
    this.botGender = config.botGender;
    this.name = config.name;
    this.services = {};
    this.hardware = [];
    this.name = config.name;

    this.configuration = {
      robot: {
        gender: this.botGender,
        name: this.name
      }
    };

    if(config.hasServo) {
      this.hardware.push("servo");
    }

    if(config.hasLED) {
      this.hardware.push("led");
    }

    if(config.hasSpeaker) {
      this.hardware.push("speaker");
    }

    if(config.hasMicrophone) {
      this.hardware.push("microphone");
    }

    if(config.hasCamera) {
      this.hardware.push("camera");
    }

    if(this.credentials.taApiKey && this.credentials.taApiKey.length) {
      this.services.tone_analyzer = {
        apikey: this.credentials.taApiKey
      };
    }

    if(this.credentials.cApiKey && this.credentials.cApiKey.length &&
      this.credentials.cWorkspaceId && this.credentials.cWorkspaceId.length) {
      this.services.conversation = {
        apikey: this.credentials.cApiKey,
        workspaceId: this.credentials.cWorkspaceId,
      };
    }

    if(this.credentials.ltApiKey && this.credentials.ltApiKey.length) {
      this.services.language_translator = {
        apikey: this.credentials.ltApiKey
      };
    }

    if(this.credentials.ttsApiKey && this.credentials.ttsApiKey.length) {
      this.services.text_to_speech = {
        apikey: this.credentials.ttsApiKey
      };
    }

    this.configuration.speak = {
      language: config.speak,
      speakerDeviceId: config.speakerDeviceId
    };

    if(this.credentials.sttApiKey && this.credentials.sttApiKey.length) {
      this.services.speech_to_text = {
        apikey: this.credentials.sttApiKey
      };

      this.configuration.listen = {
        language: config.listen,
        microphoneDeviceId: config.microphoneDeviceId        
      };
    }

    if(this.credentials.vrApiKey && this.credentials.vrApiKey.length) {
      this.services.visual_recognition = {
        apikey: this.credentials.vrApiKey
      };
    }    

    tj.bots[this.id] = new TJBot(this.hardware, this.configuration, this.services);
  }

  RED.nodes.registerType("tjbot-config", TJBotNodeConfig, {credentials: {
    taApiKey: {type:"password"},
    cApiKey: {type:"password"},
    cWorkspaceId: {type:"text"},
    ltApiKey: {type:"password"},
    ttsApiKey: {type:"password"},
    sttApiKey: {type:"password"},
    vrApiKey: {type:"password"}
  }});
}
