const STORAGE_KEY_CONTESTS = "cachedContests";
const STORAGE_KEY_POTD = "potdState";
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

const elList = document.getElementById("contestList");
const elUpdated = document.getElementById("updatedAt");
const btnRefresh = document.getElementById("refresh");
const chkLeet = document.getElementById("potd-leetcode");
const chkGfg = document.getElementById("potd-gfg");

// --- POTD Links ---
const btnLeet = document.getElementById("btn-leetcode");
const btnGfg = document.getElementById("btn-gfg");

// platform icons
const resourceIcons = {
  "leetcode.com": "icons/leetcode.png",
  "codechef.com": "icons/leetcode.png",
  "codeforces.com": "icons/codeforce.png"
};

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

// --- Format UTC ISO string to IST with AM/PM ---
function fmt(dtStr) {
  const d = new Date(dtStr);

  // shift to IST (+5:30)
  d.setMinutes(d.getMinutes() + 330);

  return d.toLocaleString("en-IN", {
    hour12: true,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function siteBadge(resource) {
  if (resource.includes("codeforces"))
    return `<span class="badge resource-CF">
              <img src="icons/codeforces.png" class="icon" /> Codeforces
            </span>`;
  if (resource.includes("codechef"))
    return `<span class="badge resource-CC">
              <img src="icons/codechef.png" class="icon" /> CodeChef
            </span>`;
  if (resource.includes("leetcode"))
    return `<span class="badge resource-LC">
              <img src="icons/leetcode.png" class="icon" /> LeetCode
            </span>`;
  return `<span class="badge">
            <img src="icons/default.png" class="icon" /> ${resource}
          </span>`;
}

function renderContests(payload) {
  const contests = (payload && payload.contests) || [];
  const updatedAt = payload && payload.updatedAt;
  elUpdated.textContent = updatedAt
    ? "Updated " +
      new Date(updatedAt).toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: false
      })
    : "—";
  elList.innerHTML =
    contests
      .map((c) => {
        const startMs = new Date(c.start).getTime();
        const isSoon = startMs - Date.now() <= SIX_HOURS_MS;
        const blinkClass = isSoon ? "blink" : "";
        return `
      <div class="card contest-card ${blinkClass}">
        <div class="row" style="justify-content: space-between;">
          <h3>${c.event}</h3>
          ${siteBadge(c.resource)}
        </div>
        <div class="times">Start: ${fmt(c.start)} &nbsp; • &nbsp; End: ${fmt(c.end)}</div>
        <div style="margin-top:8px;">
          <a href="${c.href}" target="_blank" rel="noreferrer">Open contest page</a>
        </div>
      </div>
    `;
      })
      .join("") || `<div class="small">No contests in the next 36 hours.</div>`;
}

async function loadAndRender() {
  const data = await chrome.storage.local.get(STORAGE_KEY_CONTESTS);
  renderContests(data[STORAGE_KEY_CONTESTS]);
}

btnRefresh.addEventListener("click", async () => {
  btnRefresh.disabled = true;
  try {
    const resp = await chrome.runtime.sendMessage({ type: "REFRESH_CONTESTS" });
    if (resp && resp.ok) {
      renderContests({ contests: resp.contests, updatedAt: Date.now() });
    }
  } catch (e) {
    console.error(e);
  } finally {
    btnRefresh.disabled = false;
  }
});

async function initPOTD() {
  const d = await chrome.storage.local.get(STORAGE_KEY_POTD);
  const state =
    d[STORAGE_KEY_POTD] || { date: todayKey(), leetcode: false, gfg: false };
  if (state.date !== todayKey()) {
    state.date = todayKey();
    state.leetcode = false;
    state.gfg = false;
    await chrome.storage.local.set({ [STORAGE_KEY_POTD]: state });
  }
  chkLeet.checked = !!state.leetcode;
  chkGfg.checked = !!state.gfg;

  chkLeet.addEventListener("change", () => {
    state.leetcode = chkLeet.checked;
    state.date = todayKey();
    chrome.storage.local.set({ [STORAGE_KEY_POTD]: state });
  });
  chkGfg.addEventListener("change", () => {
    state.gfg = chkGfg.checked;
    state.date = todayKey();
    chrome.storage.local.set({ [STORAGE_KEY_POTD]: state });
  });

  // --- Attach links for POTD buttons ---
  btnLeet.addEventListener("click", () => {
    window.open("https://leetcode.com/problemset/all/?listId=wpwgkgt", "_blank");
  });
  btnGfg.addEventListener("click", () => {
    window.open("https://practice.geeksforgeeks.org/problem-of-the-day", "_blank");
  });
}

(async function init() {
  await initPOTD();
  await loadAndRender();
})();
