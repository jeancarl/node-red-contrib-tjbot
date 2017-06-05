#TJBot Node-RED nodes

Node-RED nodes that can be used with the TJBot running on a Raspberry Pi. 

Nodes include:

* analyze tone - analyzes the tone (emotion, language, and social tones) of the payload using the Watson Tone Analyzer service
* converse - analyzes natural language using the Watson Conversation service
* see - classifies a photo taken using the camera via Watson Visual Recognition service
* shine - controls the LED to shine a color
* take photo - captures a photo taken using the camera
* translate - translates content via the Watson Language Translator service
* wave - controls the servo to wave the arm



# Installation

```
cd nodes
npm install node-red-contrib-tjbot
sudo node-red
```

The TJBot requires running Node-RED via sudo.

```
sudo node-red
```

This may use the Settings file at /root/.node-red/settings.js. Modify the file with the following to point back to the original Node-RED directory (under the user pi):

```
    // By default, all user data is stored in the Node-RED install directory. To
    // use a different location, the following property can be used
    userDir: '/home/pi/.node-red/',

    // Node-RED scans the `nodes` directory in the install directory to find nodes.
    // The following property can be used to specify an additional directory to scan.
    nodesDir: '/home/pi/.node-red/nodes',
```

# Contributions

Contributions and enhancements are welcomed. Please create a pull request.


