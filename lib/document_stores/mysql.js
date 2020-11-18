var mysql = require('mysql');
var winston = require('winston');

var MySQLDocumentStore = function (options) {
  this.pool = mysql.createPool({
    host: options.settings.host,
    user: options.settings.user,
    password: options.settings.password,
    database: options.settings.database
  });

  var tableQuery = 
  `CREATE TABLE IF NOT EXISTS \`pastes\` (
    \`id\` int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    \`key\` varchar(191) NOT NULL UNIQUE,
    \`value\` text NOT NULL
  );`;

  this.pool.query(tableQuery, (err, result) => {
    if (err) winston.error('MySQL: Error creating table', { error: err });
    if (result.warningCount === 0) {
      winston.info('MySQL: Database created: ' + options.settings.database);
    }
  });
};

MySQLDocumentStore.prototype = {
  set: function (key, data, callback) {
    this.pool.query('INSERT INTO pastes (`key`, `value`) VALUES (?, ?);', [ key, data ], function (err, result, fields) {
      if (err) {
        winston.error('MySQL: Error saving to database', { error: err });
        return callback(false);
      }

      callback(true);
    });
  },

  get: function (key, callback) {
    this.pool.query('SELECT `id`, `value` FROM pastes WHERE `key` = ?;', key, function (err, result) {
      if (err) {
        winston.error('MySQL: Error retrieving value', { error: err });
        return callback(false);
      }

      callback(result && result.length ? result[0].value : false);
    });
  },
};

module.exports = MySQLDocumentStore;
