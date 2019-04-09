var xray = require('aws-xray-sdk');
var mysql = xray.captureMySQL(require('mysql'));

var { Driver } = require('orm/lib/Drivers/DML/mysql');

// Copied from https://github.com/dresende/node-orm2/blob/master/lib/Drivers/DML/mysql.js#L63-L81, needed so we can trace mysql
Driver.prototype.reconnect = function (cb, connection) {
  var connOpts = this.config.href || this.config;

  // Prevent noisy mysql driver output
  if (typeof connOpts == 'object') {
    connOpts = _.omit(connOpts, 'debug');
  }
  if (typeof connOpts == 'string') {
    connOpts = connOpts.replace("debug=true", "debug=false");
  }

  this.db = (connection ? connection : mysql.createConnection(connOpts));
  if (this.opts.pool) {
    this.db.pool = (connection ? connection : mysql.createPool(connOpts));
  }
  if (typeof cb == "function") {
    this.connect(cb);
  }
};

module.exports = Driver;
