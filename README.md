Bar Mixvah
----------

Bar Mixvah is an automated drink mixing robot that is controlled via a beautiful web interface.  Users can select a drink, select a size, and have their drink made for them in front of their eyes!


Requirements
------------

This is not magic.  A not-so-insignificant amount of hardware, soldering, and wiring is required for this to work.  Follow along with the tutorial on my website here:
http://yujiangtham.com/2014/05/25/build-your-very-own-drink-mixing-robot-part-1/


Caveats
-------

A few parts of the interface are incomplete or not very well-implemented at the moment.  Currently, only 5 pumps are supported (although you should be able to add as many as you want, up to the number of digital out pins on the Arduino).  You'll have to change the code in /public/javascripts/robot/backend.js to support this, but it's a quick and easy change.  Also, the add pumps button should be removed or greyed out when the max number of pumps is reached, but I have no code in place to do that yet currently.  In the add screen, there is no confirmation when a drink is added.  In the edit screen, the +/- buttons are not functional as of yet.  


Usage
-----

The app connects to your local mongo database on startup.  You should have mongo running first, or it will throw an error.  The web interface is located at http://localhost:3000 (or if you are connecting via a different device, you can point that device to http://x.x.x.x:3000, the IP address of the machine that the node.js app is running on).

Pump controls are accessed in the top-right corner by clicking the PUMP button.  You can add pumps and select ingredients for each of those pumps.  

Drinks can be added by pointing your browser to localhost:3000/add, and can be edited at localhost:3000/edit.  Drink images can be added to /public/image/drinks/.


Yu Jiang Tham, 2014