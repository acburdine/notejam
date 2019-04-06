var settings = {
  test: {
    type: 'sqlite3',
    db: "notejam_test.db",
    dsn: "sqlite://notejam_test.db"
  }
};

var env = process.env.NODE_ENV || 'development';

module.exports = settings[env] || {
  type: 'mysql',
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dsn: `mysql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`
};
