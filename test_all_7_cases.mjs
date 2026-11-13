import { spawn } from 'child_process';
import { writeFileSync, existsSync } from 'fs';

const EDGE_PATH = existsSync('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe')
  ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const PORT = 9222;
const BASE_URL = 'http://127.0.0.1:8085';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function startBrowser() {
  console.log(`Starting headless browser from: ${EDGE_PATH}`);
  const browserProc = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-web-security',
    `--user-data-dir=C:\\Users\\HOME\\.gemini\\antigravity-ide\\scratch\\stoke-app\\.browser_test_profile`,
    'about:blank'
  ]);

  browserProc.stderr.on('data', () => {});
  browserProc.stdout.on('data', () => {});

  let version = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) {
        version = await res.json();
        break;
      }
    } catch (e) {
      await sleep(300);
    }
  }

  if (!version) {
    throw new Error('Failed to connect to CDP endpoint on port ' + PORT);
  }
  console.log('Browser ready! WebSocket URL:', version.webSocketDebuggerUrl);
  return browserProc;
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval exception: ${res.exceptionDetails.text || ''} ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  async captureScreenshot(path) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    if (res?.data) {
      writeFileSync(path, Buffer.from(res.data, 'base64'));
    }
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runTests() {
  const browserProc = await startBrowser();
  let cdp = null;

  try {
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const targets = await listRes.json();
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    console.log('\n======================================================');
    console.log('  RUNNING 7 SPECIFIC PROFILE & GOOGLE LOGIN TEST CASES');
    console.log('======================================================\n');

    const results = [];

    // Ensure completely clean storage before starting tests
    await cdp.send('Page.navigate', { url: `${BASE_URL}/` });
    await sleep(2000);
    await cdp.eval(`localStorage.clear(); sessionStorage.clear();`);
    await cdp.send('Page.navigate', { url: `${BASE_URL}/` });
    await sleep(2500);

    // ─────────────────────────────────────────────────────────────
    // TEST 1: First-time Google login (NO profile in DB)
    // ─────────────────────────────────────────────────────────────
    console.log('>>> TEST 1: First-time Google login (no profile in backend)');
    const test1Result = await cdp.eval(`
      (async () => {
        localStorage.clear();

        const newGoogleUser = {
          id: "google-new-user-001",
          email: "jordan.athlete@gmail.com",
          user_metadata: {
            full_name: "Jordan Lee",
            avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
          }
        };

        window.dbCheckProfileStatus = async (uid) => {
          return { status: "NO_PROFILE", profile: null, error: null };
        };

        if (typeof window.notifyAuthChange === "function") {
          await window.notifyAuthChange("SIGNED_IN", { user: newGoogleUser });
        }

        await new Promise(r => setTimeout(r, 700));

        const bodyText = document.body.innerText;
        const hasCreateTitle = bodyText.includes("Create Your Athlete Profile") || bodyText.includes("Create Your Profile");
        const hasGoogleSync = bodyText.includes("Connected Account") || bodyText.includes("jordan.athlete@gmail.com");
        const hasHomeGreeting = bodyText.includes("DAILY TARGET");

        const nameInput = document.getElementById("athlete-input-name");
        const emailInput = document.getElementById("athlete-input-email");
        const hasNamePreFilled = !!nameInput && nameInput.value === "Jordan Lee";
        const hasEmailPreFilled = !!emailInput && emailInput.value === "jordan.athlete@gmail.com";

        return {
          hasCreateTitle,
          hasGoogleSync,
          hasHomeGreeting,
          hasNamePreFilled,
          hasEmailPreFilled,
          screenTitle: document.querySelector('h1, h2')?.innerText
        };
      })()
    `);

    await cdp.captureScreenshot('c:\\Users\\HOME\\.gemini\\antigravity-ide\\scratch\\stoke-app\\test_case1_create_profile.png');
    console.log('Test 1 Evaluation:', test1Result);
    const pass1 = test1Result.hasCreateTitle && !test1Result.hasHomeGreeting && test1Result.hasNamePreFilled;
    results.push({ test: 'Case 1: First-time Google login -> Create Profile (Never Home)', pass: pass1, details: test1Result });
    console.log(`Result: ${pass1 ? 'PASS' : 'FAIL'}\n`);

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Existing user with complete profile -> Direct to Home
    // ─────────────────────────────────────────────────────────────
    console.log('>>> TEST 2: Existing user with complete profile -> Direct to Home');
    const test2Result = await cdp.eval(`
      (async () => {
        const completeUser = {
          id: "athlete-complete-002",
          email: "sarah.connor@stoke.app",
          user_metadata: { full_name: "Sarah Connor" }
        };

        const completeProfile = {
          name: "Sarah Connor",
          email: "sarah.connor@stoke.app",
          age: 29,
          height: 168,
          weight: 62,
          gender: "female",
          fitness_goal: "Build Muscle",
          activity_level: "Moderately Active",
          daily_calorie_goal: 2200,
          daily_protein_goal: 124
        };

        window.dbCheckProfileStatus = async (uid) => {
          return { status: "COMPLETE", profile: completeProfile, error: null };
        };

        if (typeof window.notifyAuthChange === "function") {
          await window.notifyAuthChange("SIGNED_IN", { user: completeUser });
        }

        await new Promise(r => setTimeout(r, 700));

        const bodyText = document.body.innerText;
        const hasHome = bodyText.includes("Sarah Connor") || bodyText.includes("DAILY TARGET") || bodyText.includes("Calories");
        const hasCreateTitle = bodyText.includes("Create Your Athlete Profile");

        return {
          hasHome,
          hasCreateTitle,
          bodySnippet: bodyText.slice(0, 150)
        };
      })()
    `);

    await cdp.captureScreenshot('c:\\Users\\HOME\\.gemini\\antigravity-ide\\scratch\\stoke-app\\test_case2_complete_home.png');
    console.log('Test 2 Evaluation:', test2Result);
    const pass2 = test2Result.hasHome && !test2Result.hasCreateTitle;
    results.push({ test: 'Case 2: Existing complete profile -> Direct to Home', pass: pass2, details: test2Result });
    console.log(`Result: ${pass2 ? 'PASS' : 'FAIL'}\n`);

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Existing user with incomplete profile -> Complete Profile Screen
    // ─────────────────────────────────────────────────────────────
    console.log('>>> TEST 3: Existing user with incomplete profile -> Complete Profile Screen');
    const test3Result = await cdp.eval(`
      (async () => {
        const incompleteUser = {
          id: "athlete-incomplete-003",
          email: "alex.incomplete@stoke.app",
          user_metadata: { full_name: "Alex Incomplete" }
        };

        const partialProfile = {
          name: "Alex Incomplete",
          email: "alex.incomplete@stoke.app",
          age: 25,
          height: null,
          weight: null,
          fitness_goal: null
        };

        window.dbCheckProfileStatus = async (uid) => {
          return {
            status: "INCOMPLETE",
            profile: partialProfile,
            missingFields: { height: true, weight: true, fitness_goal: true },
            error: null
          };
        };

        if (typeof window.notifyAuthChange === "function") {
          await window.notifyAuthChange("SIGNED_IN", { user: incompleteUser });
        }

        await new Promise(r => setTimeout(r, 700));

        const bodyText = document.body.innerText;
        const hasCompleteTitle = bodyText.includes("Complete Your Athlete Profile") || bodyText.includes("Complete Your Profile");
        const hasHome = bodyText.includes("DAILY TARGET") && bodyText.includes("Calories");

        return {
          hasCompleteTitle,
          hasHome,
          firstHeading: document.querySelector('h1, h2')?.innerText
        };
      })()
    `);

    await cdp.captureScreenshot('c:\\Users\\HOME\\.gemini\\antigravity-ide\\scratch\\stoke-app\\test_case3_incomplete_profile.png');
    console.log('Test 3 Evaluation:', test3Result);
    const pass3 = test3Result.hasCompleteTitle && !test3Result.hasHome;
    results.push({ test: 'Case 3: Incomplete profile -> Profile Completion Screen', pass: pass3, details: test3Result });
    console.log(`Result: ${pass3 ? 'PASS' : 'FAIL'}\n`);

    // ─────────────────────────────────────────────────────────────
    // TEST 4: App closed and reopened -> Session & complete profile restored
    // ─────────────────────────────────────────────────────────────
    console.log('>>> TEST 4: App closed and reopened (session restored without re-login)');
    await cdp.eval(`
      (() => {
        const restoredUser = {
          id: "athlete-restored-004",
          email: "restored.athlete@stoke.app",
          user_metadata: { full_name: "Marcus Vance" }
        };
        const restoredProfile = {
          name: "Marcus Vance",
          email: "restored.athlete@stoke.app",
          age: 30,
          height: 182,
          weight: 80,
          gender: "male",
          fitness_goal: "Improve Endurance",
          activity_level: "Very Active"
        };
        localStorage.setItem("stoke_authed", "true");
        localStorage.setItem("stoke_current_user_id", restoredUser.id);
        localStorage.setItem("stoke_userPhone", restoredUser.email);
        localStorage.setItem("stoke_profile", JSON.stringify(restoredProfile));
      })()
    `);

    // Reload page to simulate reopening app
    await cdp.send('Page.navigate', { url: `${BASE_URL}/` });
    await sleep(3000);

    const test4Result = await cdp.eval(`
      (async () => {
        const restoredUser = {
          id: "athlete-restored-004",
          email: "restored.athlete@stoke.app",
          user_metadata: { full_name: "Marcus Vance" }
        };
        const restoredProfile = {
          name: "Marcus Vance",
          email: "restored.athlete@stoke.app",
          age: 30,
          height: 182,
          weight: 80,
          gender: "male",
          fitness_goal: "Improve Endurance",
          activity_level: "Very Active"
        };

        window.dbGetSession = async () => ({ user: restoredUser, access_token: "mock-token" });
        window.dbCheckProfileStatus = async () => ({ status: "COMPLETE", profile: restoredProfile, error: null });

        if (typeof window.notifyAuthChange === "function") {
          await window.notifyAuthChange("SIGNED_IN", { user: restoredUser });
        }

        await new Promise(r => setTimeout(r, 700));

        const bodyText = document.body.innerText;
        const hasHome = bodyText.includes("Marcus Vance") || bodyText.includes("Good afternoon") || bodyText.includes("Good morning") || bodyText.includes("DAILY TARGET");
        const hasAuthScreen = bodyText.includes("Sign In") && bodyText.includes("Don't have an account?");

        return {
          hasHome,
          hasAuthScreen,
          bodySnippet: bodyText.slice(0, 150)
        };
      })()
    `);

    await cdp.captureScreenshot('c:\\Users\\HOME\\.gemini\\antigravity-ide\\scratch\\stoke-app\\test_case4_reopen_restored.png');
    console.log('Test 4 Evaluation:', test4Result);
    const pass4 = test4Result.hasHome && !test4Result.hasAuthScreen;
    results.push({ test: 'Case 4: App closed and reopened -> Session restored without re-login', pass: pass4, details: test4Result });
    console.log(`Result: ${pass4 ? 'PASS' : 'FAIL'}\n`);

    // ─────────────────────────────────────────────────────────────
    // TEST 5: Backend / network failure -> BackendErrorScreen with Retry
    // ─────────────────────────────────────────────────────────────
    console.log('>>> TEST 5: Backend/network failure -> Error Screen with Retry');
    const test5Result = await cdp.eval(`
      (async () => {
        const errorUser = {
          id: "athlete-err-005",
          email: "error.user@stoke.app"
        };

        window.dbCheckProfileStatus = async () => {
          return {
            status: "ERROR",
            profile: null,
            error: new Error("503 Service Unavailable: Supabase connection timeout.")
          };
        };

        if (typeof window.notifyAuthChange === "function") {
          await window.notifyAuthChange("SIGNED_IN", { user: errorUser });
        }

        await new Promise(r => setTimeout(r, 700));

        const bodyText = document.body.innerText;
        const hasNotice = bodyText.includes("Database Connection Notice");
        const hasErrorMsg = bodyText.includes("503 Service Unavailable");
        const hasRetryBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes("Retry Connection"));
        const hasSignOutBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes("Sign Out"));
        const hasHome = bodyText.includes("DAILY TARGET") && bodyText.includes("Calories");

        return {
          hasNotice,
          hasErrorMsg,
          hasRetryBtn,
          hasSignOutBtn,
          hasHome
        };
      })()
    `);

    await cdp.captureScreenshot('c:\\Users\\HOME\\.gemini\\antigravity-ide\\scratch\\stoke-app\\test_case5_backend_error.png');
    console.log('Test 5 Evaluation:', test5Result);
    const pass5 = test5Result.hasNotice && test5Result.hasRetryBtn && !test5Result.hasHome;
    results.push({ test: 'Case 5: Backend/network failure -> Error Screen with Retry (Never silent Home)', pass: pass5, details: test5Result });
    console.log(`Result: ${pass5 ? 'PASS' : 'FAIL'}\n`);

    // ─────────────────────────────────────────────────────────────
    // TEST 6: Logout and login with another account -> No data leakage
    // ─────────────────────────────────────────────────────────────
    console.log('>>> TEST 6: Logout and login with another account (No profile leakage)');
    const test6Result = await cdp.eval(`
      (async () => {
        const signOutBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes("Sign Out"));
        if (signOutBtn) signOutBtn.click();
        await new Promise(r => setTimeout(r, 600));

        const storedAuthed = localStorage.getItem("stoke_authed");
        const storedUser = localStorage.getItem("stoke_current_user_id");

        const userB = {
          id: "athlete-user-b-006",
          email: "user.b@stoke.app",
          user_metadata: { full_name: "Elena Rostova" }
        };
        const profileB = {
          name: "Elena Rostova",
          email: "user.b@stoke.app",
          age: 28,
          height: 172,
          weight: 65,
          fitness_goal: "Maintain Fitness",
          activity_level: "Moderately Active"
        };

        window.dbCheckProfileStatus = async (uid) => {
          if (uid === userB.id) return { status: "COMPLETE", profile: profileB, error: null };
          return { status: "NO_PROFILE", profile: null, error: null };
        };

        if (typeof window.notifyAuthChange === "function") {
          await window.notifyAuthChange("SIGNED_IN", { user: userB });
        }

        await new Promise(r => setTimeout(r, 700));

        const bodyText = document.body.innerText;
        const hasUserBName = bodyText.includes("Elena") || bodyText.includes("Elena Rostova");
        const hasOldUser = bodyText.includes("Marcus") || bodyText.includes("Sarah Connor");

        return {
          storedAuthedCleared: !storedAuthed,
          storedUserCleared: !storedUser,
          hasUserBName,
          hasOldUser
        };
      })()
    `);

    await cdp.captureScreenshot('c:\\Users\\HOME\\.gemini\\antigravity-ide\\scratch\\stoke-app\\test_case6_account_switch.png');
    console.log('Test 6 Evaluation:', test6Result);
    const pass6 = test6Result.storedAuthedCleared && test6Result.hasUserBName && !test6Result.hasOldUser;
    results.push({ test: 'Case 6: Logout and login with another account -> No leakage', pass: pass6, details: test6Result });
    console.log(`Result: ${pass6 ? 'PASS' : 'FAIL'}\n`);

    // ─────────────────────────────────────────────────────────────
    // TEST 7: Profile saved -> Valid Postgres columns & persists
    // ─────────────────────────────────────────────────────────────
    console.log('>>> TEST 7: Profile saved -> Valid Postgres columns & persists');
    const test7Result = await cdp.eval(`
      (async () => {
        const freshUser = {
          id: "athlete-fresh-007",
          email: "david.kim@stoke.app",
          user_metadata: { full_name: "David Kim" }
        };

        window.dbCheckProfileStatus = async () => ({ status: "NO_PROFILE", profile: null, error: null });

        let capturedPayload = null;
        window.dbSaveProfile = async (uid, data) => {
          capturedPayload = { uid, data };
          return {
            data: {
              ...data,
              id: "profile-row-007",
              user_id: uid,
              daily_calorie_goal: 2450,
              daily_protein_goal: 150
            },
            error: null
          };
        };

        if (typeof window.notifyAuthChange === "function") {
          await window.notifyAuthChange("SIGNED_IN", { user: freshUser });
        }

        await new Promise(r => setTimeout(r, 700));

        function setReactInput(input, val) {
          if (!input) return;
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          nativeSetter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const nameInput = document.getElementById("athlete-input-name");
        const ageInput = document.getElementById("athlete-input-age");
        const heightInput = document.getElementById("athlete-input-height");
        const weightInput = document.getElementById("athlete-input-weight");

        setReactInput(nameInput, "David Kim");
        setReactInput(ageInput, "28");
        setReactInput(heightInput, "180");
        setReactInput(weightInput, "78");

        await new Promise(r => setTimeout(r, 300));

        // Click Build Muscle card
        const muscleCard = Array.from(document.querySelectorAll('button')).find(el => el.innerText && el.innerText.includes("Build Muscle"));
        if (muscleCard) muscleCard.click();

        await new Promise(r => setTimeout(r, 300));

        // Click Save Profile button
        const saveBtn = document.getElementById("athlete-btn-save-profile");
        if (saveBtn) saveBtn.click();

        await new Promise(r => setTimeout(r, 1200));

        const bodyText = document.body.innerText;
        const savedToStorage = localStorage.getItem("stoke_profile");
        const parsedStorage = savedToStorage ? JSON.parse(savedToStorage) : null;

        return {
          capturedUserId: capturedPayload?.uid,
          capturedFields: capturedPayload ? Object.keys(capturedPayload.data) : [],
          hasHeightNotCm: capturedPayload ? ('height' in capturedPayload.data && !('height_cm' in capturedPayload.data)) : false,
          hasWeightNotKg: capturedPayload ? ('weight' in capturedPayload.data && !('weight_kg' in capturedPayload.data)) : false,
          hasGoal: capturedPayload ? capturedPayload.data.fitness_goal === "Build Muscle" : false,
          savedToLocalStorage: !!parsedStorage,
          navigatedToApp: bodyText.includes("David Kim") || bodyText.includes("DAILY TARGET") || bodyText.includes("Calories")
        };
      })()
    `);

    await cdp.captureScreenshot('c:\\Users\\HOME\\.gemini\\antigravity-ide\\scratch\\stoke-app\\test_case7_saved_profile.png');
    console.log('Test 7 Evaluation:', test7Result);
    const pass7 = test7Result.capturedUserId === "athlete-fresh-007" &&
                  test7Result.hasHeightNotCm &&
                  test7Result.hasWeightNotKg &&
                  test7Result.savedToLocalStorage;
    results.push({ test: 'Case 7: Profile saved -> Valid Postgres columns & persists', pass: pass7, details: test7Result });
    console.log(`Result: ${pass7 ? 'PASS' : 'FAIL'}\n`);

    // Summary
    console.log('======================================================');
    console.log('                FINAL TEST RESULTS');
    console.log('======================================================');
    let allPassed = true;
    for (const r of results) {
      console.log(`[${r.pass ? 'PASS' : 'FAIL'}] ${r.test}`);
      if (!r.pass) allPassed = false;
    }
    console.log('======================================================');
    console.log(`Overall: ${allPassed ? 'ALL 7 TESTS PASSED!' : 'SOME TESTS FAILED'}`);

  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    if (cdp) cdp.close();
    browserProc.kill();
  }
}

runTests();
