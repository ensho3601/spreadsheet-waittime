(async function() {
  // ▼ ここに GAS の実行URL を貼る（最後の/exec）
  const apiUrlBase = "https://script.google.com/macros/s/AKfycbxa34Pv1hwUGUYMeJKNk_0udXyWsRMUCBY4eWGZ6afp/dev";

  // ページ上のすべてのウィジェット（data-shop-id を持つ要素）を検索
  const widgets = document.querySelectorAll('[data-shop-id]');
  if (!widgets || widgets.length === 0) return;

  // キャッシュ回避クエリ
  const url = apiUrlBase + "?_=" + Date.now();

  // データ取得
  let data;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed: " + res.status);
    data = await res.json();
  } catch (e) {
    console.error("GAS fetch error:", e);
    widgets.forEach(w => w.innerText = "データ取得失敗");
    return;
  }

  widgets.forEach(widget => {
    const shopId = widget.dataset.shopId;
    const now = new Date();
    const weekdayNames = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const weekday = weekdayNames[now.getDay()];
    const roundedMin = now.getMinutes() < 30 ? "00" : "30";
    const timeKey = `${String(now.getHours()).padStart(2,"0")}:${roundedMin}`;

    const rowsForShop = data.filter(r => String(r["店舗ID"]) === String(shopId));
    const target = rowsForShop.find(r => String(r["曜日"]) === weekday && String(r["時刻"]) === timeKey);

    if (!target) {
      widget.innerText = "データなし";
      return;
    }

    const people = target["並び"];
    const wait = Number(target["待ち時間"]);

    function getColor(wait) {
      if (wait === 0) return "blue";
      if (wait < 10) return "green";
      if (wait < 30) return "orange";
      if (wait < 50) return "red";
      return "purple";
    }
    const color = getColor(wait);

    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const timeText = `${hh}時${mm}分現在`;

    widget.innerHTML = `
      <span class="wt_time">${timeText}</span>
      <span class="wt_people" style="margin:0 8px; color:${color}; font-weight:700;">並び：約${people}名</span>
      <span class="wt_wait" style="color:${color}; font-weight:700;">待ち時間：約${wait}分</span>
    `;
  });
})();
