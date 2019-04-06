var sqlite3 = require('sqlite3').verbose();
var mysql = require('mysql');
var async = require('async');

var settings = require('./settings');
var db;

if (settings.type === 'mysql') {
  db = mysql.createConnection(settings);
} else {
  db = new sqlite3.Database(settings.db);
}

function query(sql, params, cb) {
  if (settings.type === 'mysql') {
    sql = sql.replace(/AUTOINCREMENT/g, 'AUTO_INCREMENT');
    return db.query(sql, params, (error) => {
      if (error) {
        console.log(error);
      }

      cb();
    });
  }

  return db.run(sql, params, cb);
}

var functions = {
  createTables: function(next) {
    async.series({
      createUsers: function(callback) {
        query("CREATE TABLE IF NOT EXISTS users (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL," +
            "email VARCHAR(75) NOT NULL," +
            "password VARCHAR(128) NOT NULL);", [],
            function() { callback(null); });
      },
      createPads: function(callback) {
        query("CREATE TABLE IF NOT EXISTS pads (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL," +
            "name VARCHAR(100) NOT NULL," +
            "user_id INTEGER NOT NULL REFERENCES users(id));", [],
            function() { callback(null); })
      },
      createNotes: function(callback) {
        query("CREATE TABLE IF NOT EXISTS notes (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL," +
            "pad_id INTEGER REFERENCES pads(id)," +
            "user_id INTEGER NOT NULL REFERENCES users(id)," +
            "name VARCHAR(100) NOT NULL," +
            "text text NOT NULL," +
            "created_at datetime default current_timestamp," +
            "updated_at datetime default current_timestamp);", [],
            function() { callback(null); });
      }
    },
    function(err, results) {
      next();
    });
  },

  applyFixtures: function(next) {
    this.truncateTables(function() {
      async.series([
        function(callback) {
          query("INSERT INTO users VALUES (1, 'user1@example.com', " +
                 "'$2a$10$mhkqpUvPPs.zoRSTiGAEKODOJMljkOY96zludIIw.Pop1UvQCTx8u')", [],
                function() { callback(null) });
        },
        function(callback) {
          query("INSERT INTO users VALUES (2, 'user2@example.com', " +
                 "'$2a$10$mhkqpUvPPs.zoRSTiGAEKODOJMljkOY96zludIIw.Pop1UvQCTx8u')", [],
                function() { callback(null) });

        },
        function(callback) {
          query("INSERT INTO pads VALUES (1, 'Pad 1', 1)", [],
                function() { callback(null) });
        },
        function(callback) {
          query("INSERT INTO pads VALUES (2, 'Pad 2', 1)", [],
                function() { callback(null) });
        },
        function(callback) {
          query("INSERT INTO notes VALUES (1, 1, 1, 'Note 1', 'Text', 1, 1)", [],
                function() { callback(null) });
        },
        function(callback) {
          query("INSERT INTO notes VALUES (2, 1, 1, 'Note 2', 'Text', 1, 1)", [],
                function() { callback(null) });
        }
      ], function(err, results) {
        next();
      })
    });
  },

  truncateTables: function(next) {
    async.series([
      function(callback) {
        query("DELETE FROM users;", [],
              function() { callback(null) });
      },
      function(callback) {
        query("DELETE FROM notes;", [],
              function() { callback(null) });

      },
      function(callback) {
        query("DELETE FROM pads;", [],
              function(result) { callback(null); });
      }
    ], function(err, results) {
      next();
    })
  }
}


if (require.main === module) {
  functions.createTables(function() {
    console.log("DB successfully initialized");

    if (settings.type === 'mysql') {
      db.destroy();
    }
  });
}

module.exports = functions;
