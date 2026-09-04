let DATA = {
  league: [],
  games: [],
  news: [],
  honors: []
};

let editing = {
  league: null,
  game: null,
  news: null,
  honor: null
};


// =========================
// API
// =========================

async function api(url, options = {}) {

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "خطا در ارتباط با سرور");
  }

  return data;
}


// =========================
// دریافت اطلاعات
// =========================

async function loadData() {

  try {

    DATA = await api("/api/data");

    render();

  } catch (error) {

    console.error(error);

  }
}


// =========================
// تغییر صفحه
// =========================

function show(id) {

  document
    .querySelectorAll(".section")
    .forEach(section => {
      section.classList.remove("active");
    });

  const section = document.getElementById(id);

  if (section) {
    section.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// =========================
// جدول لیگ
// =========================

function renderLeague() {

  const table = document.getElementById("leagueTable");

  if (!table) return;

  if (!DATA.league.length) {

    table.innerHTML = `
      <tr>
        <td colspan="7">
          هنوز اطلاعات جدول ثبت نشده است.
        </td>
      </tr>
    `;

    return;
  }

  const sorted = [...DATA.league].sort(
    (a, b) => Number(b.points) - Number(a.points)
  );

  table.innerHTML = sorted.map((player, index) => {

    return `
      <tr>

        <td>
          ${index + 1}
        </td>

        <td>
          ${safe(player.name)}
        </td>

        <td>
          ${player.games}
        </td>

        <td>
          ${player.wins}
        </td>

        <td>
          ${player.draws}
        </td>

        <td>
          ${player.losses}
        </td>

        <td>
          <b>${player.points}</b>
        </td>

      </tr>
    `;

  }).join("");
}


// =========================
// افتخارات
// =========================

function renderHonors() {

  const table = document.getElementById("honorsTable");

  if (!table) return;

  const searchInput =
    document.getElementById("honorSearch");

  const search = searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

  const filtered = DATA.honors.filter(honor => {

    return honor.name
      .toLowerCase()
      .includes(search);

  });

  table.innerHTML = filtered.map((honor, index) => {

    return `
      <tr>

        <td>
          ${index + 1}
        </td>

        <td>
          ${safe(honor.name)}
        </td>

        <td>
          <b>${honor.score}</b> ★
        </td>

      </tr>
    `;

  }).join("");
}


// =========================
// بازی‌ها
// =========================

function renderGames() {

  const box =
    document.getElementById("gamesList");

  if (!box) return;

  if (!DATA.games.length) {

    box.innerHTML = `
      <div class="box">
        هنوز بازی‌ای ثبت نشده است.
      </div>
    `;

    return;
  }

  box.innerHTML = DATA.games.map(game => {

    return `
      <div class="game-card">

        <span class="game-team">
          ${safe(game.team1)}
        </span>

        <span class="game-score">
          ${game.score1} - ${game.score2}
        </span>

        <span class="game-team">
          ${safe(game.team2)}
        </span>

      </div>
    `;

  }).join("");
}


// =========================
// اخبار
// =========================

function renderNews() {

  const box =
    document.getElementById("newsList");

  if (!box) return;

  if (!DATA.news.length) {

    box.innerHTML = `
      <div class="box">
        هنوز خبری منتشر نشده است.
      </div>
    `;

    return;
  }

  box.innerHTML = DATA.news.map(news => {

    return `
      <div class="news">

        <h3>
          ${safe(news.title)}
        </h3>

        <p>
          ${safe(news.text)}
        </p>

      </div>
    `;

  }).join("");
}


// =========================
// رندر اصلی
// =========================

function render() {

  renderLeague();
  renderHonors();
  renderGames();
  renderNews();

  renderAdmin();
}


// =========================
// ورود مدیریت
// =========================

async function login() {

  const password =
    document
      .getElementById("adminPassword")
      .value
      .trim();

  if (!password) {

    document.getElementById("loginError")
      .innerText =
      "رمز مدیریت را وارد کنید.";

    return;
  }

  try {

    await api("/api/login", {
      method: "POST",

      body: JSON.stringify({
        password: password
      })
    });

    document.getElementById("loginBox")
      .style.display = "none";

    document.getElementById("adminPanel")
      .style.display = "block";

    document.getElementById("loginError")
      .innerText = "";

    renderAdmin();

  } catch (error) {

    document.getElementById("loginError")
      .innerText =
      "❌ رمز مدیریت اشتباه است.";

  }
}


// =========================
// خروج
// =========================

async function logout() {

  try {

    await api("/api/logout", {
      method: "POST"
    });

    document.getElementById("loginBox")
      .style.display = "block";

    document.getElementById("adminPanel")
      .style.display = "none";

    clearForms();

  } catch (error) {

    console.error(error);

  }
}


// =========================
// افزودن جدول
// =========================

async function addLeague() {

  const name = value("lName");

  if (!name) {

    alert("نام را وارد کنید.");

    return;
  }

  try {

    await api("/api/league", {

      method: "POST",

      body: JSON.stringify({

        name: name,

        games:
          numberValue("lGames"),

        wins:
          numberValue("lWins"),

        draws:
          numberValue("lDraws"),

        losses:
          numberValue("lLosses"),

        points:
          numberValue("lPoints")

      })

    });

    clearLeagueForm();

    await loadData();

  } catch (error) {

    alert(error.message);

  }
}


// =========================
// ویرایش جدول
// =========================

async function editLeague(id) {

  const player =
    DATA.league.find(item => item.id === id);

  if (!player) return;

  const name =
    prompt(
      "نام مربی / تیم:",
      player.name
    );

  if (name === null) return;

  const games =
    prompt(
      "تعداد بازی:",
      player.games
    );

  if (games === null) return;

  const wins =
    prompt(
      "تعداد برد:",
      player.wins
    );

  if (wins === null) return;

  const draws =
    prompt(
      "تعداد مساوی:",
      player.draws
    );

  if (draws === null) return;

  const losses =
    prompt(
      "تعداد باخت:",
      player.losses
    );

  if (losses === null) return;

  const points =
    prompt(
      "امتیاز:",
      player.points
    );

  if (points === null) return;

  const confirmed =
    confirm(
      "آیا از ویرایش این مورد مطمئن هستید؟"
    );

  if (!confirmed) return;

  try {

    await api(`/api/league/${id}`, {

      method: "PUT",

      body: JSON.stringify({

        name: name,

        games: Number(games) || 0,

        wins: Number(wins) || 0,

        draws: Number(draws) || 0,

        losses: Number(losses) || 0,

        points: Number(points) || 0

      })

    });

    await loadData();

  } catch (error) {

    alert(error.message);

  }
}


// =========================
// حذف جدول
// =========================

async function deleteLeague(id) {

  const confirmed =
    confirm(
      "آیا مطمئن هستید که این بازیکن از جدول حذف شود؟"
    );

  if (!confirmed) return;

  try {

    await api(`/api/league/${id}`, {
      method: "DELETE"
    });

    await loadData();

  } catch (error) {

    alert(error.message);

  }
}


// =========================
// افزودن بازی
// =========================

async function addGame() {

  const team1 = value("gTeam1");
  const team2 = value("gTeam2");

  if (!team1 || !team2) {

    alert("نام هر دو تیم را وارد کنید.");

    return;
  }

  try {

    await api("/api/games", {

      method: "POST",

      body: JSON.stringify({

        team1: team1,

        team2: team2,

        score1:
          numberValue("gScore1"),

        score2:
          numberValue("gScore2")

      })

    });

    clearGameForm();

    await loadData();

  } catch (error) {

    alert(error.message);

  }
}


// =========================
// ویرایش بازی
// =========================

async function editGame(id) {

  const game =
    DATA.games.find(item => item.id === id);

  if (!game) return;

  const team1 =
    prompt(
      "تیم اول:",
      game.team1
    );

  if (team1 === null) return;

  const team2 =
    prompt(
      "تیم دوم:",
      game.team2
    );

  if (team2 === null) return;

  const score1 =
    prompt(
      "گل تیم اول:",
      game.score1
    );

  if (score1 === null) return;

  const score2 =
    prompt(
      "گل تیم دوم:",
      game.score2
    );

  if (score2 === null) return;

  const confirmed =
    confirm(
      "آیا از ویرایش نتیجه بازی مطمئن هستید؟"
    );

  if (!confirmed) return;

  try {

    await api(`/api/games/${id}`, {

      method: "PUT",

      body: JSON.stringify({

        team1: team1,

        team2: team2,

        score1: Number(score1) || 0,

        score2: Number(score2) || 0

      })

    });

    await loadData();

  } catch (error) {

    alert(error.message);

  }
}


// =========================
// حذف بازی
// =========================

async function deleteGame(id) {

  const confirmed =
    confirm(
      "آیا این بازی حذف شود؟"
    );

  if (!confirmed) return;

  try {

    await api(`/api/games/${id}`, {
      method: "DELETE"
    });

    await loadData();

  } catch (error) {

    alert(error.message);

  }
}


// =========================
// افزودن خبر
// =========================

async function addNews() {

  const title = value("nTitle");
  const text = value("nText");

  if (!title || !text) {

    alert("عنوان و متن خبر را وارد کنید.");

    return;
  }

  try {

    await api("/api/news", {

      method: "POST",

      body: JSON.stringify({

        title: title,
        text: text

      })

    });

    clearNewsForm();

    await loadData();

  } catch (error) {

    alert(error.message);

  }
}


// =========================
// ویرایش خبر
// =========================

async function editNews(id) {

  const news =
    DATA.news.find(item => item.id === id);

  if (!news) return;

  const title =
    prompt(
      "عنوان خبر:",
      news.title
    );

  if (title === null) return;

  const text =
    prompt(
      "متن خبر:",
      news.text
    );

  if (text === null) return;

  const confirmed =
    confirm(
      "آیا از ویرایش این خبر مطمئن هستید؟"
    );

  if (!confirmed) return;

  try {

    await api(`/api/news/${id}`, {

      method: "PUT",

      body: JSON.stringify({

        title: title,

        text: text

      })

    });

    await loadData();

  } catch (error) {

    alert(error.message);

  }
}


// =========================
// حذف خبر
// =========================

async function deleteNews(id) {

  const confirmed =
    confirm(
      "آیا این خبر حذف شود؟"
    );

  if (!confirmed) return;

  try {

    await api(`/api/news/${id}`, {
      method: "DELETE"
    });

    await loadData();

  } catch (error) {

    alert(error.message);

  }
}


// =========================
// افزودن افتخار
// =========================

async function addHonor() {

  const name = value("hName");

  if (!name) {

    alert("نام مربی را وارد کنید.");

    return;
  }

  try {

    await api("/api/honors", {

      method: "POST",

      body: JSON.stringify({

        name: name,

        score:
          numberValue("hScore")

      })

    });

    clearHonorForm();

    await loadData();

  } catch (error) {

    alert(error.message);

  }
}


// =========================
// ویرایش افتخار
// =========================

async function editHonor(id) {

  const honor =
    DATA.honors.find(item => item.id === id);

  if (!honor) return;

  const name =
    prompt(
      "نام مربی:",
      honor.name
    );

  if (name === null) return;

  const score =
    prompt(
      "امتیاز افتخارات:",
      honor.score
    );

  if (score === null) return;

  const confirmed =
    confirm(
      "آیا از ویرایش افتخار مطمئن هستید؟"
    );

  if (!confirmed) return;

  try {

    await api(`/api/honors/${id}`, {

      method: "PUT",

      body: JSON.stringify({

        name: name,

        score: Number(score) || 0

      })

    });

    await loadData();

  } catch (error) {

    alert(error.message);

  }
}


// =========================
// حذف افتخار
// =========================

async function deleteHonor(id) {

  const confirmed =
    confirm(
      "آیا این افتخار حذف شود؟"
    );

  if (!confirmed) return;

  try {

    await api(`/api/honors/${id}`, {
      method: "DELETE"
    });

    await loadData();

  } catch (error) {

    alert(error.message);

  }
}


// =========================
// پنل مدیریت
// =========================

function renderAdmin() {

  const leagueBox =
    document.getElementById("adminLeague");

  const gamesBox =
    document.getElementById("adminGames");

  const newsBox =
    document.getElementById("adminNews");

  const honorsBox =
    document.getElementById("adminHonors");


  if (leagueBox) {

    leagueBox.innerHTML =
      DATA.league.map(player => {

        return `
          <div class="admin-item">

            <b>
              ${safe(player.name)}
            </b>

            <br>

            بازی:
            ${player.games}
            |
            برد:
            ${player.wins}
            |
            مساوی:
            ${player.draws}
            |
            باخت:
            ${player.losses}
            |
            امتیاز:
            ${player.points}

            <br>

            <button
              onclick="editLeague(${player.id})"
            >
              ✏️ ویرایش
            </button>

            <button
              onclick="deleteLeague(${player.id})"
            >
              🗑️ حذف
            </button>

          </div>
        `;

      }).join("");
  }


  if (gamesBox) {

    gamesBox.innerHTML =
      DATA.games.map(game => {

        return `
          <div class="admin-item">

            <b>
              ${safe(game.team1)}
            </b>

            ${game.score1}

            -

            ${game.score2}

            <b>
              ${safe(game.team2)}
            </b>

            <br>

            <button
              onclick="editGame(${game.id})"
            >
              ✏️ ویرایش
            </button>

            <button
              onclick="deleteGame(${game.id})"
            >
              🗑️ حذف
            </button>

          </div>
        `;

      }).join("");
  }


  if (newsBox) {

    newsBox.innerHTML =
      DATA.news.map(news => {

        return `
          <div class="admin-item">

            <b>
              ${safe(news.title)}
            </b>

            <br>

            <button
              onclick="editNews(${news.id})"
            >
              ✏️ ویرایش
            </button>

            <button
              onclick="deleteNews(${news.id})"
            >
              🗑️ حذف
            </button>

          </div>
        `;

      }).join("");
  }


  if (honorsBox) {

    honorsBox.innerHTML =
      DATA.honors.map(honor => {

        return `
          <div class="admin-item">

            <b>
              ${safe(honor.name)}
            </b>

            -
            ${honor.score}
            ★

            <br>

            <button
              onclick="editHonor(${honor.id})"
            >
              ✏️ ویرایش
            </button>

            <button
              onclick="deleteHonor(${honor.id})"
            >
              🗑️ حذف
            </button>

          </div>
        `;

      }).join("");
  }
}


// =========================
// چت
// =========================

function sendChat() {

  const name =
    value("chatName");

  const text =
    value("chatText");

  if (!name || !text) {

    alert("نام و پیام را وارد کنید.");

    return;
  }

  const chatList =
    document.getElementById("chatList");

  if (!chatList) return;

  chatList.innerHTML += `
    <div class="box">

      <b>
        ${safe(name)}
      </b>

      <p>
        ${safe(text)}
      </p>

    </div>
  `;

  document.getElementById("chatText")
    .value = "";
}


// =========================
// نظرسنجی
// =========================

function vote(name) {

  const result =
    document.getElementById("voteResult");

  if (!result) return;

  result.innerHTML = `
    ✅ رأی شما به
    <b>${safe(name)}</b>
    ثبت شد.
  `;
}


// =========================
// پاک کردن فرم‌ها
// =========================

function clearLeagueForm() {

  [
    "lName",
    "lGames",
    "lWins",
    "lDraws",
    "lLosses",
    "lPoints"
  ].forEach(id => {

    const element =
      document.getElementById(id);

    if (element) {
      element.value = "";
    }

  });
}


function clearGameForm() {

  [
    "gTeam1",
    "gTeam2",
    "gScore1",
    "gScore2"
  ].forEach(id => {

    const element =
      document.getElementById(id);

    if (element) {
      element.value = "";
    }

  });
}


function clearNewsForm() {

  [
    "nTitle",
    "nText"
  ].forEach(id => {

    const element =
      document.getElementById(id);

    if (element) {
      element.value = "";
    }

  });
}


function clearHonorForm() {

  [
    "hName",
    "hScore"
  ].forEach(id => {

    const element =
      document.getElementById(id);

    if (element) {
      element.value = "";
    }

  });
}


function clearForms() {

  clearLeagueForm();
  clearGameForm();
  clearNewsForm();
  clearHonorForm();

}


// =========================
// ابزارها
// =========================

function value(id) {

  const element =
    document.getElementById(id);

  if (!element) return "";

  return element.value.trim();
}


function numberValue(id) {

  const number =
    Number(value(id));

  if (Number.isNaN(number)) {
    return 0;
  }

  return number;
}


function safe(text) {

  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// =========================
// شروع سایت
// =========================

loadData();
