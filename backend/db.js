import mysql2 from "mysql2";

const connection = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "Prathaphb@13",
  database: "quiz_app_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default connection;
