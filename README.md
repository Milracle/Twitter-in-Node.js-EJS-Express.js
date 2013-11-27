Twitter Client API for Node.js and EJS 
=================================

OAuth Twitter Implementation for Node.js using EJS in Express.js

<b>Caution</b> : This example is just to have an idea of twitter oauth implementaion and also how to render ejs in Express.js. It will be very useful for beginner as well. 


Installation
-------------

Change config.js configuration elements that also includes 
- Twitter Consumer Key  
- Twitter Consumer Secret

Requirements
--------------

Install dependencies used here with npm 
- <code> npm install oauth </code>
- <code> npm install request </code>
- <code> npm install qs </code>
- <code> npm install express  </code>
- <code> npm install ejs </code>


Boot the app
--------------

That's all the setup you need. Phew. Now you can boot the app:

<code> node Config.js </code>

Now, if you open http://127.0.0.1:3000 you'll see the default express page with different options. Click on "connect" link to authenticate twitter, once its done "Universe is yours" !  
