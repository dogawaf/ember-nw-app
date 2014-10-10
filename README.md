Test application with ember-cli and node-webkit
==========

This repo was created to illustrate [my response in this thread](http://discuss.emberjs.com/t/node-webkit-es6-amd-and-commonjs-resolved/4750/26).

---

[Download and unpack node-webkit](https://github.com/rogerwang/node-webkit) somewhere on your computer.

Install ember-cli (globally) : 

```
npm -g install ember-cli
```

Move to a directory in where you want to create your app

```
$ cd ~/Sites
$ ember new ember-nw-app
$ cd ember-nw-app
```

Node-webkit requires a package.json file in the public root of the application:

```
$ vi public/package.json
```

Put the desired configuration. Please note that the important property is main`.
`main` tells which file node-webkit should load. 
_I choose to use the [app:// protocol](https://github.com/rogerwang/node-webkit/wiki/App%20protocol), 
because I need to use absolute path in my application._

Now, you need to tell ember-cli what is the `baseURL of the application, and to use the `hash` (or `none`)
for managing the url. We must not use `auto` or `history` because node-webkit 
will load the index.html file, and need to stay in it.

```
$ vi config/environment.js
  
  baseURL: 'app://localhost/',
  locationType: 'hash'
```

Now, you should be able to run the node-webkit app.
Please note that the app to be run is built by ember-cli in `dist/`.

```
$ ember build
$ ~/Downloads/node-webkit-v0.10.5-osx-x64/node-webkit.app/Contents/MacOS/node-webkit dist/
```

You should see "Welcome to emberjs".
Quit the app with CTRL+C in the terminal.

Now, lets execute some "node" code from within your "ember" code.
For that, we create a route to show some OS information, grabbed from nodejs' Os api.
Within this route, we will also check that the navigation works correctly.

```
$ ember g route os
$ vi app/templates/os.hbs

  <h2>OS informations</h2>
  {{content}}
  {{#link-to 'index'}}Home{{/link-to}}
```

```
$ vi app/templates/index.hbs

  {{#link-to 'os'}}OS informations{{/link-to}}
```

Now we create our usefull node module:

```
$ mkdir -p public/node_modules/my-node-module
$ vi public/node_modules/my-node-module/index.js

  var os = require('os');
  module.exports = function(){
    return os.type();
  };

```

In order to load this module, we can use `require('my-node-module')`.
But, nodejs' `require` will conflict emberjs' `require`.
So we have to free this namespace before loading emberjs.

Add this before any other script tag:

```
$ vi app/index.html
	
  <script type="text/javascript">
    // get a copy of nw.gui before deleting require reference  
    var gui = window.gui = require('nw.gui');

    // leave the require namespace to ember
    window.node_require = window.require;
    delete window.require;
  </script>
```

You will do the same in `tests/index.html`.

Now we can use our module in our route:

```
$ vi app/routes/os.js

  model: function(){
    var myNodeModule = window.node_require('my-node-module');
    return myNodeModule();
  }
```

and display information in our ember app from our node module:

```
$ ember build
$ ~/Downloads/node-webkit-v0.10.5-osx-x64/node-webkit.app/Contents/MacOS/node-webkit dist/
```

Voilà.
