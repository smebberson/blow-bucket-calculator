'use strict';

import Cookie from 'js-cookie';

// Store the Cookie class for later use.
window.Cookie = Cookie;

var calculator = require('../../calculator.marko');

calculator.renderSync().appendTo(document.body);
