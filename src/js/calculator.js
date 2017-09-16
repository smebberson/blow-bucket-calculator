'use strict';

var calculator = require('../../calculator.marko');

calculator.renderSync({ name: 'Marko' }).appendTo(document.body);
