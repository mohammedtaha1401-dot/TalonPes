const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false
});

async function initDatabase() {

  await pool.query(`
    CREATE TABLE IF NOT EXISTS league (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      games INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      draws INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      team1 TEXT NOT NULL,
      team2 TEXT NOT NULL,
      score1 INTEGER DEFAULT 0,
      score2 INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS honors (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      score INTEGER DEFAULT 0
    );
  `);

  const result = await pool.query(
    "SELECT COUNT(*) FROM honors"
  );

  if (Number(result.rows[0].count) === 0) {

    const honors = [
      ["رویس وفادار",106],
      ["مارال",75],
      ["ماتیاس",55],
      ["رافی",54],
      ["لوک",45],
      ["تئو",38],
      ["زلاتان",33],
      ["امین اودین",30],
      ["دارک کینگ",27],
      ["دنی والورده",24],
      ["مهدی تئو",22],
      ["مجی",20],
      ["لوکاس",20],
      ["مارکوس",20],
      ["محسن",18],
      ["اسلیوکا",17],
      ["امیر دیبروین",16],
      ["سام فودن",16],
      ["امیر بلینگهام",13],
      ["کینگ مستر",12],
      ["طاها تالون",11],
      ["تریکانو",11],
      ["طاها",10],
      ["طاها اس ای اس",10],
      ["امیر اگوئرو(خولیان)",9],
      ["ساواک",8],
      ["یونس",8],
      ["گاردین",8],
      ["امیر ولیکس",8],
      ["فرساد",7],
      ["جیمی",7],
      ["مجنون",6],
      ["ایلیا",6],
      ["تیلمانس",6],
      ["شیخ",5],
      ["فینیکس",5],
      ["مودریک",5],
      ["بنی",5],
      ["ریرسون",5],
      ["تورک(تاکاز)",5],
      ["عرفان فلادیوس",5],
      ["مهدی زد ایکس",4],
      ["ژنرال",4],
      ["فرهان",3],
      ["مانی",3],
      ["طاها بیگ",3],
      ["کارلتو پرز",3],
      ["ژاکروک",3],
      ["سیانور",3],
      ["هاورتز",3],
      ["ممد رضا",3],
      ["ممفیس",2],
      ["لوکاس",2],
      ["ممد جونیور",1],
      ["امیر دیبالا",1],
      ["فانتوم",1],
      ["ییلدیز",1],
      ["ماهان گواردیولا",1],
      ["تایان(بائنا)",1]
    ];

    for (const [name, score] of honors) {
      await pool.query(
        "INSERT INTO honors (name, score) VALUES ($1,$2)",
        [name, score]
      );
    }
  }
}

module.exports = {
  pool,
  initDatabase
};
