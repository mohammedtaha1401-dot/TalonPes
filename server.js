const express = require("express");
const session = require("express-session");
const path = require("path");

const { pool, initDatabase } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

// =========================
// تنظیمات
// =========================

const ADMIN_PASSWORD = "Taha92mm";

app.use(express.json());

app.use(
  session({
    secret: "talon-session-secret-2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));

// =========================
// بررسی مدیریت
// =========================

function adminOnly(req, res, next) {

  if (!req.session.admin) {
    return res.status(401).json({
      error: "دسترسی مدیریت لازم است."
    });
  }

  next();
}

// =========================
// ورود مدیریت
// =========================

app.post("/api/login", (req, res) => {

  const password = req.body.password || "";

  if (password === ADMIN_PASSWORD) {

    req.session.admin = true;

    return res.json({
      success: true
    });
  }

  res.status(401).json({
    error: "رمز مدیریت اشتباه است."
  });
});

// =========================
// خروج مدیریت
// =========================

app.post("/api/logout", (req, res) => {

  req.session.destroy(() => {
    res.json({
      success: true
    });
  });

});

// =========================
// وضعیت مدیریت
// =========================

app.get("/api/me", (req, res) => {

  res.json({
    admin: !!req.session.admin
  });

});

// =========================
// دریافت همه اطلاعات
// =========================

app.get("/api/data", async (req, res) => {

  try {

    const league = await pool.query(
      "SELECT * FROM league ORDER BY points DESC, id ASC"
    );

    const games = await pool.query(
      "SELECT * FROM games ORDER BY created_at DESC"
    );

    const news = await pool.query(
      "SELECT * FROM news ORDER BY created_at DESC"
    );

    const honors = await pool.query(
      "SELECT * FROM honors ORDER BY score DESC, id ASC"
    );

    res.json({
      league: league.rows,
      games: games.rows,
      news: news.rows,
      honors: honors.rows
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "خطا در دریافت اطلاعات."
    });

  }

});

// =========================
// جدول لیگ
// =========================

app.post("/api/league", adminOnly, async (req, res) => {

  const {
    name,
    games = 0,
    wins = 0,
    draws = 0,
    losses = 0,
    points = 0
  } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "نام را وارد کنید."
    });
  }

  await pool.query(
    `INSERT INTO league
    (name, games, wins, draws, losses, points)
    VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      name,
      games,
      wins,
      draws,
      losses,
      points
    ]
  );

  res.json({
    success: true
  });

});

app.put("/api/league/:id", adminOnly, async (req, res) => {

  const {
    name,
    games,
    wins,
    draws,
    losses,
    points
  } = req.body;

  await pool.query(
    `UPDATE league
     SET name=$1,
         games=$2,
         wins=$3,
         draws=$4,
         losses=$5,
         points=$6
     WHERE id=$7`,
    [
      name,
      games,
      wins,
      draws,
      losses,
      points,
      req.params.id
    ]
  );

  res.json({
    success: true
  });

});

app.delete("/api/league/:id", adminOnly, async (req, res) => {

  await pool.query(
    "DELETE FROM league WHERE id=$1",
    [req.params.id]
  );

  res.json({
    success: true
  });

});

// =========================
// بازی‌ها
// =========================

app.post("/api/games", adminOnly, async (req, res) => {

  const {
    team1,
    team2,
    score1 = 0,
    score2 = 0
  } = req.body;

  if (!team1 || !team2) {
    return res.status(400).json({
      error: "نام تیم‌ها را وارد کنید."
    });
  }

  await pool.query(
    `INSERT INTO games
    (team1, team2, score1, score2)
    VALUES ($1,$2,$3,$4)`,
    [
      team1,
      team2,
      score1,
      score2
    ]
  );

  res.json({
    success: true
  });

});

app.put("/api/games/:id", adminOnly, async (req, res) => {

  const {
    team1,
    team2,
    score1,
    score2
  } = req.body;

  await pool.query(
    `UPDATE games
     SET team1=$1,
         team2=$2,
         score1=$3,
         score2=$4
     WHERE id=$5`,
    [
      team1,
      team2,
      score1,
      score2,
      req.params.id
    ]
  );

  res.json({
    success: true
  });

});

app.delete("/api/games/:id", adminOnly, async (req, res) => {

  await pool.query(
    "DELETE FROM games WHERE id=$1",
    [req.params.id]
  );

  res.json({
    success: true
  });

});

// =========================
// اخبار
// =========================

app.post("/api/news", adminOnly, async (req, res) => {

  const {
    title,
    text
  } = req.body;

  if (!title || !text) {
    return res.status(400).json({
      error: "عنوان و متن خبر لازم است."
    });
  }

  await pool.query(
    "INSERT INTO news (title,text) VALUES ($1,$2)",
    [
      title,
      text
    ]
  );

  res.json({
    success: true
  });

});

app.put("/api/news/:id", adminOnly, async (req, res) => {

  await pool.query(
    `UPDATE news
     SET title=$1,
         text=$2
     WHERE id=$3`,
    [
      req.body.title,
      req.body.text,
      req.params.id
    ]
  );

  res.json({
    success: true
  });

});

app.delete("/api/news/:id", adminOnly, async (req, res) => {

  await pool.query(
    "DELETE FROM news WHERE id=$1",
    [req.params.id]
  );

  res.json({
    success: true
  });

});

// =========================
// افتخارات
// =========================

app.post("/api/honors", adminOnly, async (req, res) => {

  const {
    name,
    score
  } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "نام مربی لازم است."
    });
  }

  await pool.query(
    "INSERT INTO honors (name,score) VALUES ($1,$2)",
    [
      name,
      score || 0
    ]
  );

  res.json({
    success: true
  });

});

app.put("/api/honors/:id", adminOnly, async (req, res) => {

  await pool.query(
    `UPDATE honors
     SET name=$1,
         score=$2
     WHERE id=$3`,
    [
      req.body.name,
      req.body.score,
      req.params.id
    ]
  );

  res.json({
    success: true
  });

});

app.delete("/api/honors/:id", adminOnly, async (req, res) => {

  await pool.query(
    "DELETE FROM honors WHERE id=$1",
    [req.params.id]
  );

  res.json({
    success: true
  });

});

// =========================
// شروع سرور
// =========================

initDatabase()
  .then(() => {

    app.listen(PORT, "0.0.0.0", () => {

      console.log(
        `🦅 TALON League is running on port ${PORT}`
      );

    });

  })
  .catch((error) => {

    console.error(
      "Database error:",
      error
    );

    process.exit(1);

  });
