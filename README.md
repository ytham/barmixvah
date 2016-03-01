Bar Mixvah
----------

***THIS FORK IS BASED ON Yu Jiang Tham's [Barmixvah](https://github.com/ytham/barmixvah)***

The client and server code have a few bugs which are fixed in this fork.

Bar Mixvah is an automated drink mixing robot that is controlled via a beautiful web interface.  Users can select a drink, select a size, and have their drink made for them in front of their eyes!


Requirements
------------

This is not magic.  A not-so-insignificant amount of hardware, soldering, and wiring is required for this to work.  Follow along with the tutorials on my website here:

http://yujiangtham.com/2014/05/25/build-your-very-own-drink-mixing-robot-part-1/
http://yujiangtham.com/2014/05/30/build-your-very-own-drink-mixing-robot-part-2/
http://yujiangtham.com/2014/06/12/build-your-very-own-drink-mixing-robot-part-3/

Caveats
-------

A few parts of the interface are incomplete or not very well-implemented at the moment.  Currently, only 5 pumps are supported (although you should be able to add as many as you want, up to the number of digital out pins on the Arduino).  You'll have to change the code in /public/javascripts/robot/backend.js to support this, but it's a quick and easy change.  Also, the add pumps button should be removed or greyed out when the max number of pumps is reached, but I have no code in place to do that yet currently.  In the add screen, there is no confirmation when a drink is added.  In the edit screen, the +/- buttons are not functional as of yet.  


Usage
-----

First change into whichever directory you develop in and clone the repository
```shell
$ cd the-directory-you-want-to-work-in
$ git clone https://github.com/marcusmolchany/barmixvah.git
```

Run npm install for dependencies
```shell
$ npm install
```

The app connects to your local mongo database on startup.  You should have mongo running first, or it will throw an error. To run local mongo use this command:
```shell
$ mongod
```

You'll likely want to import example drinks collection that I made.  It doesn't contain drinks for all combos, but it'll have a few examples.  You can add more by following the information at the bottom of this section.  Import the drinks collection with this command:
```shell
$ mongoimport --db barmixvah --collection drinks --file drinks.json
```

The web interface is located at [http://localhost:3000](http://localhost:3000) (or if you are connecting via a different device, you can point that device to http://x.x.x.x:3000, the IP address of the machine that the node.js app is running on). To run the web server use this command:
```shell
$ npm start
```

Navigate to [http://localhost:3000](http://localhost:3000) and you should see something that resembles this:
<img width="889" alt="screen shot 2016-02-29 at 4 04 57 pm" src="https://cloud.githubusercontent.com/assets/2160046/13409044/e6b30848-defe-11e5-9782-7dc891f4df6b.png">

Pump controls are accessed in the top-right corner by clicking the PUMP button.  You can add/remove pumps with the (+) and (-) buttons and select ingredients for each of those pumps as they appear in the center of the screen.

Drinks can be added by pointing your browser to localhost:3000/add, and can be edited at localhost:3000/edit.  Drink images can be added to /public/image/drinks/.


Yu Jiang Tham, 2014 (original)
