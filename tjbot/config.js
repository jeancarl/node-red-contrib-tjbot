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

    if(this.credentials.ltApikey && this.credentials.ltApikey.length) {
      this.services.language_translator = {
        apikey: this.credentials.ltApikey,
      };
    }

    if(this.credentials.ttsUsername && this.credentials.ttsUsername.length && this.credentials.ttsPassword && this.credentials.ttsPassword.length) {
      this.services.text_to_speech = {
        username: this.credentials.ttsUsername,
        password: this.credentials.ttsPassword
      };
    }

    this.configuration.speak = {
      language: config.speak,
      speakerDeviceId: config.speakerDeviceId
    };

    if(this.credentials.sttUsername && this.credentials.sttUsername.length && this.credentials.sttPassword && this.credentials.sttPassword.length) {
      this.services.speech_to_text = {
        username: this.credentials.sttUsername,
        password: this.credentials.sttPassword,
      };

      this.configuration.listen = {
        language: config.listen
      };
    }

    if(this.credentials.vrApiKey && this.credentials.vrApiKey.length) {
      this.services.visual_recognition = {
        api_key: this.credentials.vrApiKey
      };
    }

    tj.bots[this.id] = new TJBot(this.hardware, this.configuration, this.services);
  }

  RED.nodes.registerType("tjbot-config", TJBotNodeConfig, {credentials: {
    taUsername: {type:"text"},
    taPassword: {type:"password"},
    cUsername: {type:"text"},
    cPassword: {type:"password"},
    cWorkspaceId: {type:"text"},
    ltApikey: {type:"password"},
    ttsUsername: {type:"text"},
    ttsPassword: {type:"password"},
    sttUsername: {type:"text"},
    sttPassword: {type:"password"},
    vrApiKey: {type:"password"}
  }});
}
