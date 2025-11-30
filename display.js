// display.js — GitHub Pages に置く
(async function() {
  // ▼ ここに GAS の実行URL を貼る（最後の/exec）
  const apiUrlBase = "https://script.google.com/macros/s/AKfycbzJzsU4z9cH6Qu_lChrqd1UQ_wAOl6y77QTfE3ejhtPR0AiuPoxd396XGoLwc5Si1_mag/exec";

  // ページ上のすべてのウィジェット（data-shop-id を持つ要素）を検索
  const widgets = document.querySelectorAll('[data-shop-id]');

  if (!widgets || widgets.length === 0) return;

  // キャッシュ回避クエリ
  const url = apiUrlBase + "?_=" + Date.now();

  // 取得（全データ）
  let data;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("fetch failed: " + res.status);
    data = await res.json();
  } catch (e) {
    console.error("GAS fetch error:", e);
    widgets.forEach(w => w.innerText = "データ取得失敗");
    return;
  }

  // data は配列 of objects（ヘッダー名をキーにしたオブジェクト群）
  widgets.forEach(widget => {
    const shopId = widget.dataset.shopId;
    // フィルタしてその店舗の最新時刻データを選ぶ（曜日・時刻の絞り込みを行う）
    // ここでは「今日の曜日」と「30分丸め時刻」に一致する行を探す例
    const now = new Date();
    const weekdayNames = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const weekday = weekdayNames[now.getDay()];
    const roundedMin = now.getMinutes() < 30 ? "00" : "30";
    const timeKey = `${String(now.getHours()).padStart(2,"0")}:${roundedMin}`;

    const rowsForShop = data.filter(r => String(r["店舗ID"]) === String(shopId));
    // rowsForShop の中から weekday と 時刻が一致する行を探す
    const target = rowsForShop.find(r => String(r["曜日"]) === weekday && String(r["時刻"]) === timeKey);

    if (!target) {
      // 見つからなければ「データなし」
      widget.innerText = "データなし";
      return;
    }

    // 値取り出し
    const people = target["並び"];
    const wait = Number(target["待ち時間"]);

    // 色分け（あなたのルール）
    function getColor(wait) {
      if (wait === 0) return "blue";
      if (wait < 10) return "green";
      if (wait < 20) return "orange";
      if (wait < 30) return "red";
      return "purple";
    }
    const color = getColor(wait);

    // 現在時刻は1分単位で表示
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const timeText = `${hh}時${mm}分現在`;

    // 出力（HTMLはブログ側で自由に整形できるように、ここでは3つのspanを用意する）
    widget.innerHTML = `
      <span class="wt_time">${timeText}</span>
      <span class="wt_people" style="margin:0 8px; color:${color}; font-weight:700;">並び：約${people}名</span>
      <span class="wt_wait" style="color:${color}; font-weight:700;">待ち時間：約${wait}分</span>
    `;
  });

  // （任意）毎分更新したければ下を有効にする（ページが開いているとき）
  // setInterval(async () => { location.reload(); }, 60 * 1000);
})();
