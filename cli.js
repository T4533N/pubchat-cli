#!/usr/bin/env node
"use strict";
const React = require("react");
const importJsx = require("import-jsx");
const { render } = require("ink");
const meow = require("meow");

const ui = importJsx("./ui");

const cli = meow(`
	Usage:
	  $ pubchat-cli 
	
 	Example:
      $ pubchat-cli
	    username: (put your username)
	    channelName: (put the channelName you wanna join)

	[enjoy chatting like a hacker :D]
`);

render(React.createElement(ui, cli.flags));
