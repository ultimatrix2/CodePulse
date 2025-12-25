const STORAGE_KEY_CONTESTS = "cachedContests";
const CLIST_USER = "ultimatrix";
const CLIST_API_KEY = "414d29f61678c9f49a110ff270894c33e225eeb3";
const HOURS_WINDOW = 200; // 100 hours ahead
const REFRESH_EVERY_MIN = 180; // 3 hours
const allowedResources = ["codeforces", "codechef", "leetcode"];

// Normalize resources (remove www, .com, .cn, lowercase, etc.)
function normalizeResource(resource) {
  return resource
    .replace(/^www\./, "")
    .replace(/\.com$|\.cn$/, "")
    .toLowerCase();
}

// Get current time in IST as Date object (but in UTC representation)
function getNowIST() {
  const nowUtc = new Date();
  // Get IST time string and parse it back to Date
  const istString = nowUtc.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return new Date(istString);
}

async function fetchContestsFromClist() {
  try {
    const nowUtc = new Date();
    const horizonUtc = new Date(nowUtc.getTime() + 7 * 24 * 60 * 60 * 1000);

    const base = "https://clist.by/api/v2/contest/";
    const url = `${base}?username=${encodeURIComponent(CLIST_USER)}&api_key=${encodeURIComponent(
      CLIST_API_KEY
    )}&order_by=start&limit=200&start__gte=${encodeURIComponent(
      nowUtc.toISOString()
    )}&start__lte=${encodeURIComponent(horizonUtc.toISOString())}`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`CLIST HTTP ${resp.status}`);
    const data = await resp.json();

    // Get current time in IST for comparison
    const nowIST = getNowIST();
    const nowISTMs = nowIST.getTime();

    const todayIST = new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    const contests = (data.objects || [])
      .filter(c =>
        allowedResources.some(r => normalizeResource(c.resource).includes(r))
      )
      .filter(c => {
        // Convert UTC times to IST for comparison
        const startUtc = new Date(c.start);
        const endUtc = new Date(c.end);
        
        // Convert to IST by getting IST string and parsing back
        const startISTString = startUtc.toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        const endISTString = endUtc.toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        
        const startIST = new Date(startISTString).getTime();
        const endIST = new Date(endISTString).getTime();
        
        // Show contest if it starts within the window AND hasn't ended yet (both in IST)
        return startIST <= nowISTMs + HOURS_WINDOW * 3600 * 1000 && endIST > nowISTMs;
      })
      .map(c => {
        const rawStart = new Date(c.start);
        const rawEnd = new Date(c.end);

        const startIST = rawStart.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: false,
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });

        const endIST = rawEnd.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: false,
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });

        const contestDayIST = rawStart.toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
        });
        const isToday = contestDayIST === todayIST;

        return {
          id: c.id,
          event: c.event,
          resource: normalizeResource(c.resource),
          rawStart: rawStart.toISOString(),
          rawEnd: rawEnd.toISOString(),
          start: startIST,
          end: endIST,
          href: c.href,
          isToday,
        };
      })
      .sort((a, b) => new Date(a.rawStart) - new Date(b.rawStart));

    await chrome.storage.local.set({
      [STORAGE_KEY_CONTESTS]: { updatedAt: Date.now(), contests },
    });

    return contests;
  } catch (err) {
    console.error("fetchContestsFromClist error:", err);
    return [];
  }
}

async function refreshContests() {
  return await fetchContestsFromClist();
}

chrome.runtime.onInstalled.addListener(() => {
  refreshContests();
});
chrome.alarms.create("refreshContests", { periodInMinutes: REFRESH_EVERY_MIN });
chrome.alarms.onAlarm.addListener(a => {
  if (a.name === "refreshContests") refreshContests();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "REFRESH_CONTESTS") {
    (async () => {
      const contests = await refreshContests();
      sendResponse({ ok: true, contests });
    })();
    return true;
  }
});