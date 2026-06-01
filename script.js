/*
AI 생성 이미지 반복 노출 실험 웹사이트
주제: AI 생성 이미지의 반복 노출이 현실 이미지 판별 능력에 미치는 영향
핵심 이론: 단순노출효과(Mere Exposure Effect)

사용 방법:
1. images/ 폴더에 real_01.jpg, ai_01.jpg 같은 이미지를 넣는다.
2. 아래 imageSet 배열의 src 경로를 실제 파일명과 맞춘다.
3. index.html을 브라우저에서 열거나 Vercel/Netlify에 업로드한다.
4. 실험 완료 후 CSV 다운로드 버튼을 누른다.
*/

const imageSet = [
  // 실제 연구에서는 직접 준비한 이미지로 교체하세요.
  // type은 "real" 또는 "ai"만 사용합니다.
  { id: "real_01", type: "real", src: "images/real_01.jpg", exposure: 0 },
  { id: "real_02", type: "real", src: "images/real_02.jpg", exposure: 2 },
  { id: "real_03", type: "real", src: "images/real_03.jpg", exposure: 5 },
  { id: "real_04", type: "real", src: "images/real_04.jpg", exposure: 10 },
  { id: "ai_01", type: "ai", src: "images/ai_01.jpg", exposure: 0 },
  { id: "ai_02", type: "ai", src: "images/ai_02.jpg", exposure: 2 },
  { id: "ai_03", type: "ai", src: "images/ai_03.jpg", exposure: 5 },
  { id: "ai_04", type: "ai", src: "images/ai_04.jpg", exposure: 10 }
];

// 이미지가 아직 없을 때도 테스트 가능하도록 단색 placeholder를 사용합니다.
const fallbackColors = {
  real: ["#c9d6df", "#d7e2d0", "#ded4c7", "#d6d0e2"],
  ai: ["#d9c7c7", "#c7d2d9", "#d8d0bd", "#cfd4c1"]
};

let state = {
  page: 0,
  participant: {},
  exposureTrials: [],
  testTrials: [],
  currentTrialIndex: 0,
  phase: "intro",
  trialStart: null,
  currentAnswer: null,
  scales: {},
  rows: []
};

const titleEl = document.getElementById("title");
const descEl = document.getElementById("description");
const contentEl = document.getElementById("content");
const progressEl = document.getElementById("progressText");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");

function uid() {
  return "P-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildTrials() {
  const exposureTrials = [];
  imageSet.forEach(img => {
    for (let i = 0; i < img.exposure; i++) {
      exposureTrials.push({ ...img, trialKind: "exposure", repeatIndex: i + 1 });
    }
  });

  const testTrials = shuffle(imageSet.map(img => ({ ...img, trialKind: "test" })));

  state.exposureTrials = shuffle(exposureTrials);
  state.testTrials = testTrials;
}

function imageHTML(img) {
  const colorList = fallbackColors[img.type];
  const color = colorList[Math.abs(hashCode(img.id)) % colorList.length];

  return `
    <div class="imageBox" style="background:${color}">
      <img src="${img.src}" alt="실험 이미지" onerror="this.remove(); this.parentElement.innerHTML='<div class=&quot;placeholder&quot;>이미지 파일을 넣으면 여기에 표시됩니다.<br><span class=&quot;code&quot;>${img.src}</span><br><br>현재는 단색 placeholder로 작동 중입니다.</div>'" />
    </div>
  `;
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i);
  return h;
}

function setHeader(title, description, progress) {
  titleEl.textContent = title;
  descEl.textContent = description;
  progressEl.textContent = progress || "";
}

function renderIntro() {
  state.phase = "intro";
  setHeader(
    "AI 생성 이미지 반복 노출 실험",
    "가설: AI 생성 이미지를 반복적으로 볼수록 실제 사진과 AI 생성 이미지를 구별하기 어려워진다.",
    "Introduction"
  );

  contentEl.innerHTML = `
    <div class="notice">
      <b>연구 제목</b><br>
      AI 생성 이미지의 반복 노출이 현실 이미지 판별 능력에 미치는 영향: 단순노출효과를 중심으로
    </div>

    <div class="notice">
      <b>실험 흐름</b><br>
      1. 기본 정보 입력<br>
      2. 이미지 반복 노출 단계<br>
      3. 실제 사진 / AI 생성 이미지 판별 검사<br>
      4. 친숙감, 신뢰도, 진짜 같음, 확신도 측정<br>
      5. CSV 결과 다운로드
    </div>

    <p class="small">
      실제 연구에 사용할 때는 참가자 동의, 익명화, 미성년자 대상 연구 윤리 절차를 확인해야 합니다.
      이미지 파일은 <span class="code">images/</span> 폴더에 직접 넣고 <span class="code">script.js</span>의 imageSet을 수정하면 됩니다.
    </p>
  `;
  backBtn.classList.add("hidden");
  nextBtn.textContent = "기본 정보 입력";
}

function renderProfile() {
  state.phase = "profile";
  setHeader(
    "참가자 기본 정보",
    "연구 분석을 위한 최소 정보만 익명으로 기록합니다.",
    "Step 1 / 4"
  );

  contentEl.innerHTML = `
    <div class="grid two">
      <label>학년
        <select id="grade">
          <option value="">선택</option>
          <option>중학생</option>
          <option>고1</option>
          <option>고2</option>
          <option>고3</option>
          <option>기타</option>
        </select>
      </label>
      <label>AI 이미지 사용 경험
        <select id="aiExperience">
          <option value="">선택</option>
          <option value="1">거의 없음</option>
          <option value="2">가끔 봄</option>
          <option value="3">자주 봄</option>
          <option value="4">직접 자주 생성함</option>
        </select>
      </label>
      <label>AI 이미지 구별 자신감 1~7
        <input id="confidenceBase" type="number" min="1" max="7" placeholder="예: 4" />
      </label>
      <label>SNS/이미지 콘텐츠 사용 시간
        <select id="snsUse">
          <option value="">선택</option>
          <option value="low">하루 1시간 미만</option>
          <option value="mid">하루 1~3시간</option>
          <option value="high">하루 3시간 이상</option>
        </select>
      </label>
    </div>

    <div class="notice">
      <b>실험 안내</b><br>
      일부 이미지는 여러 번 반복해서 제시됩니다. 이후 각 이미지가 실제 사진인지 AI 생성 이미지인지 판단하게 됩니다.
      판단 속도도 자동으로 기록됩니다.
    </div>
  `;
  backBtn.classList.remove("hidden");
  nextBtn.textContent = "반복 노출 시작";
}

function saveProfile() {
  const grade = document.getElementById("grade")?.value || "";
  const aiExperience = document.getElementById("aiExperience")?.value || "";
  const confidenceBase = document.getElementById("confidenceBase")?.value || "";
  const snsUse = document.getElementById("snsUse")?.value || "";

  if (!grade || !aiExperience || !confidenceBase || !snsUse) {
    alert("모든 항목을 입력해 주세요.");
    return false;
  }

  state.participant = {
    participant_id: uid(),
    grade,
    ai_experience: aiExperience,
    baseline_confidence: confidenceBase,
    sns_use: snsUse,
    started_at: new Date().toISOString()
  };

  buildTrials();
  return true;
}

function renderExposureTrial() {
  state.phase = "exposure";
  const total = state.exposureTrials.length;
  const trial = state.exposureTrials[state.currentTrialIndex];

  if (!trial) {
    state.currentTrialIndex = 0;
    renderTestTrial();
    return;
  }

  setHeader(
    "반복 노출 단계",
    "이미지를 보고 얼마나 익숙하고 자연스럽게 느껴지는지만 평가하세요. 아직 실제/AI 여부를 판단하지 않습니다.",
    `Exposure ${state.currentTrialIndex + 1} / ${total}`
  );

  state.scales = {};
  state.trialStart = performance.now();

  contentEl.innerHTML = `
    ${imageHTML(trial)}

    ${scaleHTML("familiarity", "이 이미지가 얼마나 익숙하게 느껴지나요?", "전혀 익숙하지 않다", "매우 익숙하다")}
    ${scaleHTML("naturalness", "이 이미지가 얼마나 자연스럽게 느껴지나요?", "매우 부자연스럽다", "매우 자연스럽다")}
  `;

  attachScaleEvents();
  backBtn.classList.add("hidden");
  nextBtn.textContent = "다음 이미지";
}

function scaleHTML(key, label, left, right) {
  return `
    <div class="scale" data-key="${key}">
      <label>${label}</label>
      <div class="scaleOptions">
        ${[1,2,3,4,5,6,7].map(n => `<div class="scaleBtn" data-key="${key}" data-value="${n}">${n}</div>`).join("")}
      </div>
      <div class="scaleLabels"><span>${left}</span><span>${right}</span></div>
    </div>
  `;
}

function attachScaleEvents() {
  document.querySelectorAll(".scaleBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      const value = btn.dataset.value;
      state.scales[key] = value;

      document.querySelectorAll(`.scaleBtn[data-key="${key}"]`).forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });
}

function completeExposureTrial() {
  const trial = state.exposureTrials[state.currentTrialIndex];
  if (!state.scales.familiarity || !state.scales.naturalness) {
    alert("두 문항을 모두 선택해 주세요.");
    return false;
  }

  const rt = Math.round(performance.now() - state.trialStart);
  state.rows.push({
    ...state.participant,
    phase: "exposure",
    image_id: trial.id,
    image_type: trial.type,
    assigned_exposure_count: trial.exposure,
    repeat_index: trial.repeatIndex,
    response: "",
    correct: "",
    confidence: "",
    familiarity: state.scales.familiarity,
    naturalness: state.scales.naturalness,
    authenticity: "",
    trust: "",
    sharing_intention: "",
    reaction_time_ms: rt,
    timestamp: new Date().toISOString()
  });

  state.currentTrialIndex += 1;
  renderExposureTrial();
  return true;
}

function renderTestTrial() {
  state.phase = "test";
  const total = state.testTrials.length;
  const trial = state.testTrials[state.currentTrialIndex];

  if (!trial) {
    renderResults();
    return;
  }

  setHeader(
    "최종 판별 검사",
    "이 이미지가 실제 사진인지 AI 생성 이미지인지 판단하세요.",
    `Test ${state.currentTrialIndex + 1} / ${total}`
  );

  state.currentAnswer = null;
  state.scales = {};
  state.trialStart = performance.now();

  contentEl.innerHTML = `
    ${imageHTML(trial)}

    <div class="choiceRow">
      <div class="choice" data-answer="real">실제 사진</div>
      <div class="choice" data-answer="ai">AI 생성 이미지</div>
    </div>

    ${scaleHTML("confidence", "판단에 얼마나 확신이 있나요?", "전혀 확신 없음", "매우 확신함")}
    ${scaleHTML("familiarity", "이 이미지가 얼마나 익숙하게 느껴지나요?", "전혀 익숙하지 않다", "매우 익숙하다")}
    ${scaleHTML("authenticity", "이 이미지가 얼마나 진짜 사진처럼 느껴지나요?", "전혀 진짜 같지 않다", "매우 진짜 같다")}
    ${scaleHTML("trust", "이 이미지가 얼마나 믿을 만하다고 느껴지나요?", "전혀 믿을 수 없다", "매우 믿을 수 있다")}
    ${scaleHTML("sharing_intention", "이 이미지를 다른 사람에게 공유할 의향이 있나요?", "전혀 없다", "매우 있다")}
  `;

  document.querySelectorAll(".choice").forEach(ch => {
    ch.addEventListener("click", () => {
      state.currentAnswer = ch.dataset.answer;
      document.querySelectorAll(".choice").forEach(c => c.classList.remove("selected"));
      ch.classList.add("selected");
    });
  });

  attachScaleEvents();
  backBtn.classList.add("hidden");
  nextBtn.textContent = "다음";
}

function completeTestTrial() {
  const trial = state.testTrials[state.currentTrialIndex];
  const required = ["confidence", "familiarity", "authenticity", "trust", "sharing_intention"];

  if (!state.currentAnswer) {
    alert("실제 사진 또는 AI 생성 이미지를 선택해 주세요.");
    return false;
  }

  for (const key of required) {
    if (!state.scales[key]) {
      alert("모든 척도 문항을 선택해 주세요.");
      return false;
    }
  }

  const rt = Math.round(performance.now() - state.trialStart);
  const correct = state.currentAnswer === trial.type ? 1 : 0;

  state.rows.push({
    ...state.participant,
    phase: "test",
    image_id: trial.id,
    image_type: trial.type,
    assigned_exposure_count: trial.exposure,
    repeat_index: "",
    response: state.currentAnswer,
    correct,
    confidence: state.scales.confidence,
    familiarity: state.scales.familiarity,
    naturalness: "",
    authenticity: state.scales.authenticity,
    trust: state.scales.trust,
    sharing_intention: state.scales.sharing_intention,
    reaction_time_ms: rt,
    timestamp: new Date().toISOString()
  });

  state.currentTrialIndex += 1;
  renderTestTrial();
  return true;
}

function renderResults() {
  state.phase = "results";
  setHeader(
    "실험 완료",
    "아래 결과는 개인 확인용입니다. 연구 분석에는 CSV 데이터를 사용하세요.",
    "Finished"
  );

  const testRows = state.rows.filter(r => r.phase === "test");
  const correct = testRows.reduce((sum, r) => sum + Number(r.correct), 0);
  const acc = testRows.length ? Math.round((correct / testRows.length) * 100) : 0;
  const avgRt = testRows.length ? Math.round(testRows.reduce((sum, r) => sum + Number(r.reaction_time_ms), 0) / testRows.length) : 0;

  const byExposure = [0,2,5,10].map(exp => {
    const rows = testRows.filter(r => Number(r.assigned_exposure_count) === exp);
    const c = rows.reduce((sum, r) => sum + Number(r.correct), 0);
    return {
      exp,
      n: rows.length,
      acc: rows.length ? Math.round((c / rows.length) * 100) : "-"
    };
  });

  contentEl.innerHTML = `
    <div class="statCards">
      <div class="stat">전체 정확도<strong>${acc}%</strong></div>
      <div class="stat">평균 반응 시간<strong>${avgRt}ms</strong></div>
      <div class="stat">판별 문항 수<strong>${testRows.length}</strong></div>
    </div>

    <table class="resultTable">
      <thead>
        <tr>
          <th>반복 노출 횟수</th>
          <th>문항 수</th>
          <th>정확도</th>
        </tr>
      </thead>
      <tbody>
        ${byExposure.map(row => `
          <tr>
            <td>${row.exp}회</td>
            <td>${row.n}</td>
            <td>${row.acc}${row.acc === "-" ? "" : "%"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div class="controls">
      <button onclick="downloadCSV()">CSV 다운로드</button>
      <button class="secondary" onclick="location.reload()">처음부터 다시</button>
    </div>

    <div class="footerNote">
      연구 분석에서는 반복 노출 횟수별 정확도, AI 이미지와 실제 사진의 차이, 친숙감과 진짜 같음 점수의 상관관계,
      친숙감의 매개효과 등을 분석할 수 있습니다.
    </div>
  `;

  backBtn.classList.add("hidden");
  nextBtn.classList.add("hidden");
}

function downloadCSV() {
  const headers = [
    "participant_id","grade","ai_experience","baseline_confidence","sns_use","started_at",
    "phase","image_id","image_type","assigned_exposure_count","repeat_index",
    "response","correct","confidence","familiarity","naturalness","authenticity","trust",
    "sharing_intention","reaction_time_ms","timestamp"
  ];

  const csv = [
    headers.join(","),
    ...state.rows.map(row => headers.map(h => csvEscape(row[h] ?? "")).join(","))
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ai_image_exposure_${state.participant.participant_id || "data"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const str = String(value);
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

nextBtn.addEventListener("click", () => {
  if (state.phase === "intro") {
    renderProfile();
  } else if (state.phase === "profile") {
    if (saveProfile()) {
      if (state.exposureTrials.length === 0) {
        renderTestTrial();
      } else {
        state.currentTrialIndex = 0;
        renderExposureTrial();
      }
    }
  } else if (state.phase === "exposure") {
    completeExposureTrial();
  } else if (state.phase === "test") {
    completeTestTrial();
  }
});

backBtn.addEventListener("click", () => {
  if (state.phase === "profile") renderIntro();
});

renderIntro();
