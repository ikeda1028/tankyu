const STORAGE_KEY = "wakuwaku-quest-state-v3";
const PUBLIC_API_BASE = "https://tankyu-five.vercel.app";

const depthLabels = ["事実まで", "背景まで", "構造まで", "越境まで", "実装まで"];

const seedEncounters = [
  {
    id: "sea-plastic-fieldwork",
    title: "海洋ごみフィールドワーク",
    index: 86,
    description:
      "海岸でごみを拾い、種類、発生源、生活とのつながりを調べる中高生向けイベント。身近な事象から、消費、流通、行政、デザインまで問いを広げます。",
    tags: ["フィールドワーク", "海洋環境", "生活"],
    keywords: ["海", "海洋", "ごみ", "教育", "子ども", "地域", "学び"],
    impact: "海洋ごみ・探究学習",
    questionPath: ["何が落ちていたか", "なぜそこに集まるか", "誰の行動や仕組みが関係するか", "他地域や産業ではどうか", "学校からどんな解決を試せるか"],
    color: "#2f6fb3",
    position: { x: 22, y: 28, lat: 35.308, lng: 139.545 },
    boost: { joy: 5, distance: 4, reflection: 2 },
  },
  {
    id: "vacant-house-townwalk",
    title: "空き家とまちの居場所ツアー",
    index: 74,
    description:
      "商店街や住宅地を歩き、空き家が増える理由と、若者が関われる居場所づくりを考えるイベント。建物から人口、福祉、地域経済へ探究を伸ばします。",
    tags: ["まち歩き", "居場所", "地域"],
    keywords: ["古民家", "空き家", "まち", "居場所", "観光", "地域"],
    impact: "空き家活用・地域孤立",
    questionPath: ["どんな空き家があるか", "なぜ使われなくなったか", "人口や福祉とどうつながるか", "他のまちでは何をしているか", "中高生が関われる企画は何か"],
    color: "#d49b2a",
    position: { x: 47, y: 43, lat: 35.011, lng: 135.768 },
    boost: { joy: 4, distance: 5, reflection: 2 },
  },
  {
    id: "ai-learning-hackday",
    title: "AI学習支援ハッカソン",
    index: 91,
    description:
      "AIを使って、学びに困っている生徒を支えるアイデアを試作するイベント。技術の面白さから、教育格差、倫理、学校制度まで問いを広げます。",
    tags: ["AI", "学習支援", "ハッカソン"],
    keywords: ["AI", "学習", "不登校", "教育", "支援", "メンター"],
    impact: "教育格差・個別最適化",
    questionPath: ["どんな学びの困りごとがあるか", "なぜ一人で解決しづらいか", "学校制度や家庭環境とどう関係するか", "医療や福祉の支援と比べると何が見えるか", "誰に試してもらい改善できるか"],
    color: "#2f8f63",
    position: { x: 68, y: 24, lat: 35.681, lng: 139.767 },
    boost: { joy: 6, distance: 5, reflection: 3 },
  },
  {
    id: "food-loss-market-lab",
    title: "フードロス商店街ラボ",
    index: 69,
    description:
      "商店街で売れ残りや廃棄の理由を聞き、食の循環を考えるイベント。食べ物から、流通、価格、貧困、地域の助け合いへ接続します。",
    tags: ["フードロス", "商店街", "聞き取り"],
    keywords: ["食", "フード", "商店街", "循環", "地域", "ボランティア"],
    impact: "フードロス・地域経済",
    questionPath: ["何が余っているか", "なぜ余るのか", "価格や流通とどう関係するか", "福祉や地域通貨とつなぐと何が変わるか", "学校で循環の仕組みを試せるか"],
    color: "#c85d72",
    position: { x: 78, y: 66, lat: 34.693, lng: 135.502 },
    boost: { joy: 3, distance: 4, reflection: 4 },
  },
  {
    id: "forest-data-camp",
    title: "森とデータの探究キャンプ",
    index: 82,
    description:
      "森でセンサーや観察記録を使い、環境変化を読み解くイベント。自然体験から、データ、観光、防災、気候変動まで探究を広げます。",
    tags: ["自然観察", "データ", "キャンプ"],
    keywords: ["森", "自然", "観光", "データ", "環境", "センサー"],
    impact: "自然資本・環境回復",
    questionPath: ["森で何が観察できるか", "なぜその変化が起きるか", "気候や人の利用とどう関係するか", "観光や防災の視点ではどう見えるか", "データで地域に何を提案できるか"],
    color: "#246a55",
    position: { x: 36, y: 72, lat: 35.232, lng: 138.638 },
    boost: { joy: 5, distance: 4, reflection: 3 },
  },
];

const defaultState = {
  auth: {
    loggedIn: false,
    email: "",
  },
  member: {
    name: "",
    school: "",
    grade: "中1",
    region: "",
    initialInterest: "",
  },
  quest: 72,
  joy: 84,
  drive: 36,
  thanks: 22,
  selected: "sea-plastic-fieldwork",
  sparks: [],
  interests: ["教育", "地域", "AI"],
  activity: [],
  joyActions: [],
  completed: [],
  reflections: [],
  feedbacks: [],
  customEvents: [],
  aiSuggestions: [],
  themeSearch: {
    query: "",
    evaluatedAt: "",
    status: "",
    answer: "",
    aiKeywords: [],
    aiPlaces: [],
    nextQuestions: [],
    selectedPlace: null,
  },
  driveSync: {
    apiUrl: "",
    lastSyncAt: "",
    lastStatus: "未設定",
  },
  maps: {
    apiKey: "",
    lastStatus: "未設定",
  },
  ui: {
    eventsPanel: "compact",
    encounterPanel: "open",
    memberEditing: false,
  },
  selectedReflection: "",
  streak: 0,
  lastActiveDate: "",
};

const els = {
  questScore: document.querySelector("#quest-score"),
  scoreDelta: document.querySelector("#score-delta"),
  questMeter: document.querySelector("#quest-meter"),
  joy: document.querySelector("#joy-value"),
  drive: document.querySelector("#drive-value"),
  thanks: document.querySelector("#thanks-value"),
  curiosity: document.querySelector("#capital-curiosity"),
  collab: document.querySelector("#capital-collab"),
  trust: document.querySelector("#capital-trust"),
  title: document.querySelector("#encounter-title"),
  index: document.querySelector("#encounter-index"),
  description: document.querySelector("#encounter-description"),
  tags: document.querySelector("#tag-row"),
  media: document.querySelector("#encounter-media"),
  encounterPanel: document.querySelector(".encounter-panel"),
  compactEncounterButton: document.querySelector("#compact-encounter-button"),
  collapseEncounterButton: document.querySelector("#collapse-encounter-button"),
  motivation: document.querySelector("#motivation"),
  motivationOutput: document.querySelector("#motivation-output"),
  sparkInput: document.querySelector("#spark-input"),
  spotsLayer: document.querySelector("#spots-layer"),
  interestPills: document.querySelector("#interest-pills"),
  activityLog: document.querySelector("#activity-log"),
  dailyMission: document.querySelector("#daily-mission"),
  streakCount: document.querySelector("#streak-count"),
  matchReason: document.querySelector("#match-reason"),
  impactField: document.querySelector("#impact-field"),
  mapSearch: document.querySelector("#map-search"),
  mapSearchButton: document.querySelector("#map-search-button"),
  explorationDepth: document.querySelector("#exploration-depth"),
  explorationDepthOutput: document.querySelector("#exploration-depth-output"),
  bestDepth: document.querySelector("#best-depth"),
  growthPath: document.querySelector("#growth-path"),
  eventDrawer: document.querySelector(".event-drawer"),
  eventCount: document.querySelector("#event-count"),
  eventList: document.querySelector("#event-list"),
  compactEventsButton: document.querySelector("#compact-events-button"),
  collapseEventsButton: document.querySelector("#collapse-events-button"),
  questionPath: document.querySelector("#question-path"),
  reflectionInput: document.querySelector("#reflection-input"),
  hypothesisInput: document.querySelector("#hypothesis-input"),
  questViews: document.querySelectorAll(".quest-view"),
  feedbackView: document.querySelector(".feedback-view"),
  feedbackStatus: document.querySelector("#feedback-status"),
  feedbackQuestScore: document.querySelector("#feedback-quest-score"),
  feedbackBestDepth: document.querySelector("#feedback-best-depth"),
  feedbackReflectionCount: document.querySelector("#feedback-reflection-count"),
  reflectionReviewList: document.querySelector("#reflection-review-list"),
  reviewTarget: document.querySelector("#review-target"),
  feedbackKind: document.querySelector("#feedback-kind"),
  mentorComment: document.querySelector("#mentor-comment"),
  mentorNextQuestion: document.querySelector("#mentor-next-question"),
  saveFeedbackButton: document.querySelector("#save-feedback-button"),
  quickFeedbackButtons: document.querySelectorAll(".quick-feedback button"),
  mentorFeedbackList: document.querySelector("#mentor-feedback-list"),
  mentorSuggestions: document.querySelector("#mentor-suggestions"),
  dbStatus: document.querySelector("#db-status"),
  dbCounts: document.querySelector("#db-counts"),
  exportDbButton: document.querySelector("#export-db-button"),
  driveApiUrl: document.querySelector("#drive-api-url"),
  saveDriveUrlButton: document.querySelector("#save-drive-url-button"),
  syncDriveButton: document.querySelector("#sync-drive-button"),
  driveSyncStatus: document.querySelector("#drive-sync-status"),
  mapsApiKey: document.querySelector("#maps-api-key"),
  saveMapsKeyButton: document.querySelector("#save-maps-key-button"),
  loadMapsButton: document.querySelector("#load-maps-button"),
  mapsStatus: document.querySelector("#maps-status"),
  mapCanvas: document.querySelector(".map-canvas"),
  googleMapCanvas: document.querySelector("#google-map-canvas"),
  centerSearchButton: document.querySelector("#center-search-button"),
  currentLocationButton: document.querySelector("#current-location-button"),
  themeEvaluationPanel: document.querySelector("#theme-evaluation-panel"),
  themeEvaluationTitle: document.querySelector("#theme-evaluation-title"),
  themeEvaluationScore: document.querySelector("#theme-evaluation-score"),
  themeOverview: document.querySelector("#theme-overview"),
  themeKeywords: document.querySelector("#theme-keywords"),
  themePlaces: document.querySelector("#theme-places"),
  themeEvaluationBases: document.querySelector("#theme-evaluation-bases"),
  authScreen: document.querySelector("#auth-screen"),
  loginForm: document.querySelector("#login-form"),
  memberForm: document.querySelector("#member-form"),
  loginEmail: document.querySelector("#login-email"),
  loginPassword: document.querySelector("#login-password"),
  demoLoginButton: document.querySelector("#demo-login-button"),
  backLoginButton: document.querySelector("#back-login-button"),
  memberName: document.querySelector("#member-name"),
  memberSchool: document.querySelector("#member-school"),
  memberGrade: document.querySelector("#member-grade"),
  memberRegion: document.querySelector("#member-region"),
  memberInterest: document.querySelector("#member-interest"),
  memberFormStatus: document.querySelector("#member-form-status"),
  memberSummaryName: document.querySelector("#member-summary-name"),
  memberSummaryMeta: document.querySelector("#member-summary-meta"),
  memberSummaryStatus: document.querySelector("#member-summary-status"),
  editMemberButton: document.querySelector("#edit-member-button"),
  logoutButton: document.querySelector("#logout-button"),
  eventAdminView: document.querySelector(".event-admin-view"),
  eventForm: document.querySelector("#event-form"),
  eventAdminStatus: document.querySelector("#event-admin-status"),
  eventTitle: document.querySelector("#event-title"),
  eventImpact: document.querySelector("#event-impact"),
  eventDescription: document.querySelector("#event-description"),
  eventTags: document.querySelector("#event-tags"),
  eventKeywords: document.querySelector("#event-keywords"),
  eventIndex: document.querySelector("#event-index"),
  eventColor: document.querySelector("#event-color"),
  eventLocation: document.querySelector("#event-location"),
  eventType: document.querySelector("#event-type"),
  eventStartDate: document.querySelector("#event-start-date"),
  eventEndDate: document.querySelector("#event-end-date"),
  eventLat: document.querySelector("#event-lat"),
  eventLng: document.querySelector("#event-lng"),
  useMapCenterButton: document.querySelector("#use-map-center-button"),
  openLocationMapButton: document.querySelector("#open-location-map-button"),
  eventLocationMap: document.querySelector("#event-location-map"),
  eventQuestions: [
    document.querySelector("#event-q1"),
    document.querySelector("#event-q2"),
    document.querySelector("#event-q3"),
    document.querySelector("#event-q4"),
    document.querySelector("#event-q5"),
  ],
  sampleEventButton: document.querySelector("#sample-event-button"),
  searchAiEventsButton: document.querySelector("#search-ai-events-button"),
  registerAllAiEventsButton: document.querySelector("#register-all-ai-events-button"),
  aiSuggestionCount: document.querySelector("#ai-suggestion-count"),
  aiThemeFocus: document.querySelector("#ai-theme-focus"),
  aiRegionFocus: document.querySelector("#ai-region-focus"),
  aiEventTypeFocus: document.querySelector("#ai-event-type-focus"),
  aiLocationPrecision: document.querySelector("#ai-location-precision"),
  aiDiversityFocus: document.querySelector("#ai-diversity-focus"),
  aiExtraPrompt: document.querySelector("#ai-extra-prompt"),
  aiSuggestionStatus: document.querySelector("#ai-suggestion-status"),
  aiSuggestionList: document.querySelector("#ai-suggestion-list"),
  registeredEventCount: document.querySelector("#registered-event-count"),
  registeredEventList: document.querySelector("#registered-event-list"),
};

const state = loadState();
state.driveSync = { ...defaultState.driveSync, ...(state.driveSync || {}) };
state.maps = { ...defaultState.maps, ...(state.maps || {}) };
state.auth = { ...defaultState.auth, ...(state.auth || {}) };
state.member = { ...defaultState.member, ...(state.member || {}) };
state.ui = { ...defaultState.ui, ...(state.ui || {}) };
state.joyActions = Array.isArray(state.joyActions) ? state.joyActions : [];
state.aiSuggestions = Array.isArray(state.aiSuggestions) ? state.aiSuggestions : [];
state.themeSearch = { ...defaultState.themeSearch, ...(state.themeSearch || {}) };
let appDb = null;
let dbReady = false;
let dbSavePromise = Promise.resolve();
let googleMap = null;
let googleMapsLoadPromise = null;
let googleMapMarkers = [];
let currentLocationMarker = null;
let googleMapFocusToken = 0;
let publicMapsAutoLoadStarted = false;
let eventLocationMap = null;
let eventLocationMarker = null;

function getEncounters() {
  return [...seedEncounters, ...state.customEvents];
}

function normalizeThemePlace(place) {
  if (typeof place === "string") {
    return {
      name: place,
      type: "関係場所",
      reason: "訪問・観察・聞き取りの候補",
      searchHint: place,
      lat: null,
      lng: null,
    };
  }
  const lat = Number(place?.lat);
  const lng = Number(place?.lng);
  return {
    name: String(place?.name || place?.searchHint || "").trim(),
    type: String(place?.type || "関係場所").trim(),
    reason: String(place?.reason || "訪問・観察・聞き取りの候補").trim(),
    searchHint: String(place?.searchHint || place?.name || "").trim(),
    lat: Number.isFinite(lat) && lat >= -90 && lat <= 90 ? lat : null,
    lng: Number.isFinite(lng) && lng >= -180 && lng <= 180 ? lng : null,
  };
}

function hasThemePlaceLatLng(place) {
  return Number.isFinite(Number(place?.lat)) && Number.isFinite(Number(place?.lng));
}

function getEncounterTags(encounter) {
  return Array.isArray(encounter?.tags) ? encounter.tags.filter(Boolean) : [];
}

function getEncounterKeywords(encounter) {
  const keywords = Array.isArray(encounter?.keywords) ? encounter.keywords.filter(Boolean) : [];
  const tags = getEncounterTags(encounter);
  return keywords.length ? keywords : tags;
}

function getEncounterQuestions(encounter) {
  const questions = Array.isArray(encounter?.questionPath) ? encounter.questionPath.filter(Boolean) : [];
  const fallback = [
    "何が起きているか",
    "なぜ起きているか",
    "誰の行動や仕組みと関係するか",
    "他地域や他分野とどうつながるか",
    "学校や地域で何を試せるか",
  ];
  return fallback.map((question, index) => questions[index] || question);
}

function hasValidLatLng(position) {
  return (
    position &&
    Number.isFinite(Number(position.lat)) &&
    Number.isFinite(Number(position.lng)) &&
    Number(position.lat) >= -90 &&
    Number(position.lat) <= 90 &&
    Number(position.lng) >= -180 &&
    Number(position.lng) <= 180
  );
}

function dedupeCustomEvents() {
  const seen = new Set();
  state.customEvents = state.customEvents.filter((event) => {
    const key = `${event.title}::${event.impact}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...defaultState, ...saved } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error(error);
    return false;
  }
  queueDatabaseSave();
  return true;
}

function getDriveUrl() {
  return (getPublicConfig().driveApiUrl || state.driveSync?.apiUrl || "").trim();
}

function setDriveStatus(message) {
  state.driveSync = {
    ...(state.driveSync || {}),
    lastStatus: message,
  };
  if (els.driveSyncStatus) {
    els.driveSyncStatus.textContent = message;
  }
}

function saveDriveUrl() {
  const apiUrl = els.driveApiUrl.value.trim();
  state.driveSync = {
    ...(state.driveSync || {}),
    apiUrl,
    lastStatus: apiUrl ? "URL保存済み" : "未設定",
  };
  saveState();
  renderDriveSync();
}

function renderDriveSync() {
  if (!els.driveApiUrl || !els.driveSyncStatus) return;
  els.driveApiUrl.value = getDriveUrl();
  const status = state.driveSync?.lastStatus || (getDriveUrl() ? "URL保存済み" : "未設定");
  const lastSync = state.driveSync?.lastSyncAt ? ` / 最終 ${formatTime(new Date(state.driveSync.lastSyncAt))}` : "";
  els.driveSyncStatus.textContent = `${status}${lastSync}`;
}

function getMapsKey() {
  return (getPublicConfig().googleMapsApiKey || state.maps?.apiKey || "").trim();
}

function getPublicConfig() {
  return globalThis.WAKUWAKU_CONFIG || window.WAKUWAKU_CONFIG || {};
}

function getMapsKeySource() {
  if (getPublicConfig().googleMapsApiKey) return "public";
  if (state.maps?.apiKey) return "saved";
  return "none";
}

function getMapsReferrerHint() {
  if (window.location.protocol === "file:") {
    return "http://127.0.0.1:4173/* または https://tankyu-five.vercel.app/*";
  }
  return `${window.location.origin}/*`;
}

function getMapsTroubleshootingMessage(reason = "認証エラー") {
  return `${reason}: Google Cloudで ${getMapsReferrerHint()} をHTTPリファラーに追加し、Maps JavaScript APIと請求設定を確認`;
}

function isFilePage() {
  return window.location.protocol === "file:";
}

function setMapsStatus(message) {
  state.maps = {
    ...(state.maps || {}),
    lastStatus: message,
  };
  if (els.mapsStatus) {
    els.mapsStatus.textContent = message;
  }
}

function saveMapsKey() {
  const apiKey = els.mapsApiKey.value.trim();
  state.maps = {
    ...(state.maps || {}),
    apiKey,
    lastStatus: apiKey ? "キー保存済み / 地図表示を押してください" : "未設定",
  };
  saveState();
  renderMapsSettings();
}

function renderMapsSettings() {
  if (!els.mapsApiKey || !els.mapsStatus) return;
  const source = getMapsKeySource();
  const publicKeyEnabled = source === "public";
  els.mapsApiKey.value = publicKeyEnabled ? "" : getMapsKey();
  els.mapsApiKey.placeholder = publicKeyEnabled ? "公開設定から読み込み中" : "ブラウザ内だけに保存";
  els.mapsApiKey.disabled = publicKeyEnabled;
  els.saveMapsKeyButton.disabled = publicKeyEnabled;
  if (isFilePage()) {
    els.mapsStatus.textContent = "file://ではGoogle Map不可 / HTTPで開くを押してください";
  } else if (publicKeyEnabled) {
    els.mapsStatus.textContent = state.maps?.lastStatus || "公開設定のキーを使用中";
    if (!googleMap && !googleMapsLoadPromise && !publicMapsAutoLoadStarted) {
      publicMapsAutoLoadStarted = true;
      els.mapsStatus.textContent = "公開設定のキーを使用中 / 地図を自動読み込み中";
      window.setTimeout(initializeGoogleMap, 0);
    }
  } else if (source === "saved") {
    els.mapsStatus.textContent = state.maps?.lastStatus || "ブラウザ保存キーを使用中";
  } else {
    els.mapsStatus.textContent = `公開設定未設定 / キーを入力してください / 許可URL ${getMapsReferrerHint()}`;
  }
}

function loadGoogleMapsScript(apiKey) {
  if (window.google?.maps) return Promise.resolve();
  if (googleMapsLoadPromise) return googleMapsLoadPromise;

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    window.gm_authFailure = () => {
      googleMapsLoadPromise = null;
      els.mapCanvas.classList.remove("google-map-enabled");
      setMapsStatus(getMapsTroubleshootingMessage("Google Maps認証エラー"));
      saveState();
      reject(new Error("Google Maps authentication failed"));
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&language=ja&region=JP&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(getMapsTroubleshootingMessage("Google Maps JavaScript APIを読み込めませんでした")));
    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
}

async function initializeGoogleMap() {
  if (isFilePage()) {
    setMapsStatus("file://ではGoogle Mapを表示できません。http://127.0.0.1:4173/ で開いてください");
    saveState();
    return;
  }
  const apiKey = getMapsKey();
  if (!apiKey) {
    setMapsStatus("APIキーを入力してください");
    saveState();
    return;
  }

  try {
    setMapsStatus("Google Map読み込み中...");
    await loadGoogleMapsScript(apiKey);
    const selected = getSelectedEncounter();
    const center = hasValidLatLng(selected.position) ? selected.position : createMapPosition(0);
    googleMap = new google.maps.Map(els.googleMapCanvas, {
      center: { lat: Number(center.lat), lng: Number(center.lng) },
      zoom: 6,
      clickableIcons: false,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      gestureHandling: "greedy",
    });
    els.mapCanvas.classList.add("google-map-enabled");
    renderGoogleMapMarkers();
    setMapsStatus("Google Map表示中");
    saveState();
  } catch (error) {
    els.mapCanvas.classList.remove("google-map-enabled");
    setMapsStatus(error.message || getMapsTroubleshootingMessage("読み込みエラー"));
    saveState();
    console.error(error);
  }
}

function centerOnCurrentLocation() {
  if (!googleMap) {
    setMapsStatus("先に地図表示を押してください");
    return;
  }
  if (!navigator.geolocation) {
    setMapsStatus("このブラウザでは現在地を取得できません");
    return;
  }
  setMapsStatus("現在地を取得中...");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const current = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      googleMap.panTo(current);
      googleMap.setZoom(13);
      if (!currentLocationMarker) {
        currentLocationMarker = new google.maps.Marker({
          map: googleMap,
          title: "現在地",
          label: {
            text: "自分",
            color: "#ffffff",
            fontSize: "10px",
            fontWeight: "900",
          },
          icon: createMarkerIcon("#17211b"),
        });
      }
      currentLocationMarker.setPosition(current);
      setMapsStatus("現在地に移動しました");
    },
    () => {
      setMapsStatus("現在地を取得できませんでした。ブラウザの位置情報許可を確認してください");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

function clearGoogleMapMarkers() {
  googleMapMarkers.forEach((marker) => marker.setMap(null));
  googleMapMarkers = [];
}

function createMarkerIcon(color) {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 0.95,
    strokeColor: "#ffffff",
    strokeWeight: 3,
    scale: 15,
  };
}

function getThemeMapFocus() {
  const selectedPlace = normalizeThemePlace(state.themeSearch?.selectedPlace);
  if (selectedPlace.name && hasThemePlaceLatLng(selectedPlace)) {
    return { lat: Number(selectedPlace.lat), lng: Number(selectedPlace.lng), zoom: 11 };
  }

  const aiPlace = (Array.isArray(state.themeSearch?.aiPlaces) ? state.themeSearch.aiPlaces : [])
    .map(normalizeThemePlace)
    .find((place) => place.name && hasThemePlaceLatLng(place));
  if (aiPlace) {
    return { lat: Number(aiPlace.lat), lng: Number(aiPlace.lng), zoom: 10 };
  }

  const topEncounter = rankedEncounters().find((encounter) => hasValidLatLng(encounter.position));
  if (topEncounter) {
    return { lat: Number(topEncounter.position.lat), lng: Number(topEncounter.position.lng), zoom: state.themeSearch?.query ? 9 : 7 };
  }

  const selected = getSelectedEncounter();
  return hasValidLatLng(selected?.position)
    ? { lat: Number(selected.position.lat), lng: Number(selected.position.lng), zoom: 7 }
    : null;
}

function centerGoogleMapOnSearch() {
  if (!googleMap) return;
  const focus = getThemeMapFocus();
  if (!focus) return;
  focusGoogleMapPoint({ lat: focus.lat, lng: focus.lng }, focus.zoom);
}

function getMapVisibleCenterOffset() {
  if (!els.mapCanvas) return { x: 0, y: 0 };
  const mapRect = els.mapCanvas.getBoundingClientRect();
  let left = 0;
  let right = 0;
  let top = 0;
  let bottom = 0;

  const topbar = document.querySelector(".topbar");
  if (topbar) {
    const rect = topbar.getBoundingClientRect();
    if (rect.bottom > mapRect.top) top = Math.max(top, rect.bottom - mapRect.top + 12);
  }

  if (els.eventDrawer && !els.eventDrawer.classList.contains("collapsed")) {
    const rect = els.eventDrawer.getBoundingClientRect();
    if (rect.right > mapRect.left && rect.left < mapRect.left + mapRect.width) {
      left = Math.max(left, rect.right - mapRect.left + 16);
    }
  }

  if (els.themeEvaluationPanel && !els.themeEvaluationPanel.classList.contains("hidden")) {
    const rect = els.themeEvaluationPanel.getBoundingClientRect();
    if (rect.left < mapRect.right && rect.right > mapRect.left) {
      right = Math.max(right, mapRect.right - rect.left + 16);
    }
  }

  const encounterPanel = document.querySelector(".encounter-panel:not(.hidden)");
  if (encounterPanel) {
    const rect = encounterPanel.getBoundingClientRect();
    if (rect.left < mapRect.right && rect.right > mapRect.left) {
      right = Math.max(right, mapRect.right - rect.left + 16);
    }
    if (rect.top < mapRect.bottom && rect.bottom > mapRect.top) {
      bottom = Math.max(bottom, mapRect.bottom - rect.top + 16);
    }
  }

  const visibleWidth = Math.max(220, mapRect.width - left - right);
  const visibleHeight = Math.max(220, mapRect.height - top - bottom);
  const visibleCenterX = left + visibleWidth / 2;
  const visibleCenterY = top + visibleHeight / 2;
  return {
    x: Math.round(mapRect.width / 2 - visibleCenterX),
    y: Math.round(mapRect.height / 2 - visibleCenterY),
  };
}

function focusGoogleMapPoint(position, zoom = 9) {
  if (!googleMap || !position) return;
  googleMapFocusToken += 1;
  const focusToken = googleMapFocusToken;
  googleMap.setZoom(zoom);
  googleMap.panTo(position);
  window.setTimeout(() => {
    if (!googleMap || focusToken !== googleMapFocusToken) return;
    const offset = getMapVisibleCenterOffset();
    googleMap.panBy(offset.x, offset.y);
  }, 160);
}

function renderGoogleMapMarkers() {
  if (!googleMap || !window.google?.maps) return;
  clearGoogleMapMarkers();
  const bounds = new google.maps.LatLngBounds();
  const themeActive = Boolean(state.themeSearch?.query);
  rankedEncounters().forEach((encounter) => {
    if (!hasValidLatLng(encounter.position)) return;
    const position = { lat: Number(encounter.position.lat), lng: Number(encounter.position.lng) };
    const evaluation = themeActive ? encounter.themeEvaluation || getThemeEvaluation(encounter.id) : null;
    const marker = new google.maps.Marker({
      map: googleMap,
      position,
      title: evaluation ? `${encounter.title} / 評価 ${evaluation.total}` : encounter.title,
      label: {
        text: String(evaluation ? evaluation.total : encounter.index),
        color: "#ffffff",
        fontSize: "11px",
        fontWeight: "900",
      },
      icon: createMarkerIcon(encounter.color),
    });
    marker.addListener("click", () => {
      state.selected = encounter.id;
      grantJoy(3, `${encounter.title}の地図ピンを開いた`, `event-view:${encounter.id}`);
      saveState();
      render();
      focusGoogleMapPoint(position, Math.max(googleMap.getZoom(), 9));
    });
    googleMapMarkers.push(marker);
    bounds.extend(position);
  });
  const aiPlaces = Array.isArray(state.themeSearch?.aiPlaces) ? state.themeSearch.aiPlaces.map(normalizeThemePlace) : [];
  let aiPlaceMarkerIndex = 0;
  aiPlaces.forEach((place) => {
    if (!place.name || !hasThemePlaceLatLng(place)) return;
    aiPlaceMarkerIndex += 1;
    const position = { lat: Number(place.lat), lng: Number(place.lng) };
    const marker = new google.maps.Marker({
      map: googleMap,
      position,
      title: `${place.name} / AI関係場所`,
      label: {
        text: `P${aiPlaceMarkerIndex}`,
        color: "#ffffff",
        fontSize: "10px",
        fontWeight: "900",
      },
      icon: createMarkerIcon("#7c4d9e"),
    });
    marker.addListener("click", () => {
      askThemePlace(place);
      focusGoogleMapPoint(position, Math.max(googleMap.getZoom(), 10));
    });
    googleMapMarkers.push(marker);
    bounds.extend(position);
  });
  if (!bounds.isEmpty()) googleMap.fitBounds(bounds, 64);
  if (state.themeSearch?.query) {
    centerGoogleMapOnSearch();
  } else {
    const selected = getSelectedEncounter();
    if (hasValidLatLng(selected?.position)) {
      focusGoogleMapPoint({ lat: Number(selected.position.lat), lng: Number(selected.position.lng) }, 7);
    }
  }
}

function setEventLocationFromLatLng(lat, lng, label = "地図クリック位置") {
  els.eventLat.value = lat.toFixed(6);
  els.eventLng.value = lng.toFixed(6);
  if (!els.eventLocation.value.trim()) {
    els.eventLocation.value = label;
  }
  els.eventAdminStatus.textContent = "地図から位置を入力";
  renderEventLocationMarker({ lat, lng });
}

function renderEventLocationMarker(position) {
  if (!eventLocationMap || !window.google?.maps || !position) return;
  if (!eventLocationMarker) {
    eventLocationMarker = new google.maps.Marker({
      map: eventLocationMap,
      title: "登録するイベント位置",
      icon: createMarkerIcon(els.eventColor.value || "#2f8f63"),
    });
  }
  eventLocationMarker.setPosition(position);
  eventLocationMap.panTo(position);
}

async function initializeEventLocationMap() {
  const apiKey = getMapsKey();
  if (!apiKey) {
    els.eventAdminStatus.textContent = "Maps APIキー未設定";
    return;
  }

  try {
    await loadGoogleMapsScript(apiKey);
    const selected = getSelectedEncounter();
    const fallbackCenter = hasValidLatLng(selected.position) ? selected.position : createMapPosition(0);
    const center = getEventPosition() || fallbackCenter;
    els.eventLocationMap.classList.add("active");

    if (!eventLocationMap) {
      eventLocationMap = new google.maps.Map(els.eventLocationMap, {
        center: { lat: center.lat, lng: center.lng },
        zoom: 12,
        clickableIcons: false,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
      });
      eventLocationMap.addListener("click", (event) => {
        setEventLocationFromLatLng(event.latLng.lat(), event.latLng.lng());
      });
    } else {
      eventLocationMap.setCenter({ lat: center.lat, lng: center.lng });
    }

    renderEventLocationMarker({ lat: center.lat, lng: center.lng });
    els.eventAdminStatus.textContent = "地図をクリックして位置指定";
  } catch (error) {
    els.eventAdminStatus.textContent = "位置指定マップを読み込めません";
    console.error(error);
  }
}

async function postToDrive(sheet, record) {
  const apiUrl = getDriveUrl();
  if (!apiUrl) {
    setDriveStatus("Apps Script URLを入力してください");
    return false;
  }

  const payload = JSON.stringify({ action: "append", sheet, record });
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: payload,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.driveSync.lastSyncAt = new Date().toISOString();
    setDriveStatus(`${sheet} をDrive保存`);
    saveState();
    return true;
  } catch (error) {
    try {
      await fetch(apiUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: payload,
      });
      state.driveSync.lastSyncAt = new Date().toISOString();
      setDriveStatus(`${sheet} をDrive送信（応答未確認）`);
      saveState();
      return true;
    } catch (fallbackError) {
      setDriveStatus("Drive同期エラー");
      console.error(error, fallbackError);
      saveState();
      return false;
    }
  }
}

function queueDatabaseSave() {
  if (!dbReady || !appDb) return;
  dbSavePromise = dbSavePromise
    .then(() => window.WakuwakuDB.writeState(appDb, state, getEncounters()))
    .then(renderDatabaseStatus)
    .catch((error) => {
      els.dbStatus.textContent = "DBエラー";
      console.error(error);
    });
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function addQuest(delta) {
  state.quest = Math.max(0, Math.min(999, Math.round(state.quest + delta)));
}

function getDepthJoyBonus(depth = getDepth()) {
  if (depth >= 5) return 12;
  if (depth >= 4) return 8;
  if (depth >= 3) return 5;
  if (depth >= 2) return 2;
  return 0;
}

function grantJoy(amount, reason, key = reason) {
  const normalized = Math.max(0, Math.round(amount));
  if (!normalized) return 0;
  const actionKey = `${todayKey()}:${key}`;
  if (state.joyActions.includes(actionKey)) return 0;
  state.joy = clamp(state.joy + normalized);
  state.joyActions = [actionKey, ...state.joyActions].slice(0, 100);
  addActivity(`${reason}。ワクワク +${normalized}`);
  return normalized;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(date = new Date()) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateLabel(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getEventTypeLabel(event) {
  return event.eventType === "limited" ? "期間限定" : "常設";
}

function getEventPeriodLabel(event) {
  const typeLabel = getEventTypeLabel(event);
  if (event.eventType !== "limited") return typeLabel;
  const start = formatDateLabel(event.startDate);
  const end = formatDateLabel(event.endDate);
  if (start && end) return `${typeLabel} ${start}-${end}`;
  if (start) return `${typeLabel} ${start}から`;
  if (end) return `${typeLabel} ${end}まで`;
  return typeLabel;
}

function getEventTitle(eventId) {
  return getEncounters().find((encounter) => encounter.id === eventId)?.title || "未選択イベント";
}

function getBestDepth() {
  return state.reflections.reduce((max, item) => Math.max(max, item.depth || 1), getDepth());
}

function addActivity(text) {
  state.activity.unshift({ at: new Date().toISOString(), text });
  state.activity = state.activity.slice(0, 12);
  const today = todayKey();
  if (state.lastActiveDate !== today) {
    state.streak += 1;
    state.lastActiveDate = today;
  }
  saveState();
}

function extractInterests(text) {
  const words = text
    .replace(/[、。/／,]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2);
  const matched = getEncounters().flatMap((encounter) =>
    getEncounterKeywords(encounter).filter((keyword) => text.toLowerCase().includes(keyword.toLowerCase()))
  );
  return [...new Set([...matched, ...words])].slice(0, 8);
}

function scoreEncounter(encounter, interests, motivation) {
  const normalized = interests.map((item) => item.toLowerCase());
  const keywordHits = getEncounterKeywords(encounter).filter((keyword) =>
    normalized.some((interest) => interest.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(interest))
  );
  const tagHits = getEncounterTags(encounter).filter((tag) => normalized.some((interest) => interest.includes(tag.toLowerCase())));
  const completedPenalty = state.completed.includes(encounter.id) ? -10 : 0;
  const motivationFit = Math.round((motivation / 100) * 8);
  return encounter.index + keywordHits.length * 9 + tagHits.length * 6 + motivationFit + completedPenalty;
}

function evaluateThemeForEncounter(encounter, query) {
  const interests = extractInterests(query);
  const normalized = [query, ...interests].map((item) => item.toLowerCase()).filter(Boolean);
  const keywordHits = getEncounterKeywords(encounter).filter((keyword) =>
    normalized.some((interest) => interest.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(interest))
  );
  const tagHits = getEncounterTags(encounter).filter((tag) =>
    normalized.some((interest) => interest.includes(tag.toLowerCase()) || tag.toLowerCase().includes(interest))
  );
  const relevance = clamp(keywordHits.length * 18 + tagHits.length * 14 + (keywordHits.length || tagHits.length ? 18 : 4));
  const questionDepth = clamp(getEncounterQuestions(encounter).length * 18);
  const evidence = clamp((encounter.locationName ? 24 : 12) + (hasValidLatLng(encounter.position) ? 24 : 10) + (getEncounterTags(encounter).length >= 3 ? 18 : 8));
  const action = clamp((encounter.eventType === "permanent" ? 24 : 18) + (encounter.index || 70) / 2);
  const total = clamp(relevance * 0.38 + questionDepth * 0.22 + evidence * 0.2 + action * 0.2);

  return {
    total,
    relevance,
    questionDepth,
    evidence,
    action,
    hits: [...new Set([...keywordHits, ...tagHits])].slice(0, 4),
  };
}

function getThemeBaseRankings() {
  const query = state.themeSearch?.query?.trim();
  if (!query) return [];
  return getEncounters()
    .map((encounter) => ({
      ...encounter,
      themeEvaluation: evaluateThemeForEncounter(encounter, query),
    }))
    .sort((a, b) => b.themeEvaluation.total - a.themeEvaluation.total);
}

function getThemeEvaluation(eventId) {
  if (!state.themeSearch?.query) return null;
  const encounter = getEncounters().find((item) => item.id === eventId);
  return encounter ? evaluateThemeForEncounter(encounter, state.themeSearch.query) : null;
}

function getThemeKeywords(query, bases) {
  const fromQuery = extractInterests(query);
  const fromBases = bases.flatMap((base) => [
    ...getEncounterTags(base),
    ...getEncounterKeywords(base),
    ...(base.themeEvaluation?.hits || []),
  ]);
  return [...new Set([...fromQuery, ...fromBases])]
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function getThemePlaces(bases) {
  return bases
    .map((base) => ({
      eventId: base.id,
      title: base.title,
      location: base.locationName || base.impact || "場所未設定",
      score: base.themeEvaluation?.total || 0,
      lat: hasValidLatLng(base.position) ? Number(base.position.lat).toFixed(4) : "",
      lng: hasValidLatLng(base.position) ? Number(base.position.lng).toFixed(4) : "",
    }))
    .filter((place, index, items) => items.findIndex((item) => item.location === place.location) === index)
    .slice(0, 5);
}

function buildThemeOverview(query, keywords, places, bases) {
  const top = bases[0];
  const keywordText = keywords.slice(0, 4).join("・") || "身近な事象";
  const placeText = places.slice(0, 2).map((place) => place.location).join("、") || "学校や地域";
  const impact = top?.impact || "社会課題";
  return `「${query}」は、${keywordText}を手がかりに、${placeText}で観察・聞き取り・比較を行い、${impact}へ問いを広げられる探究テーマです。`;
}

function getThemeAnswerApiPath() {
  if (location.protocol === "file:" || location.hostname === "127.0.0.1" || location.hostname === "localhost") {
    return `${PUBLIC_API_BASE}/api/theme-answer`;
  }
  return "/api/theme-answer";
}

function getSuggestEventsApiPath() {
  if (location.protocol === "file:" || location.hostname === "127.0.0.1" || location.hostname === "localhost") {
    return `${PUBLIC_API_BASE}/api/suggest-events`;
  }
  return "/api/suggest-events";
}

function getDepth() {
  return Number(els.explorationDepth.value);
}

function calculateQuestDelta(encounter, includeReflection = false) {
  const depth = getDepth();
  const motivation = Number(els.motivation.value);
  const depthBonus = depth * 5;
  const eventBonus = Math.round(encounter.index / 20);
  const motivationBonus = Math.round(motivation / 35);
  const reflectionBonus = includeReflection ? getReflectionBonus() : 0;
  return depthBonus + eventBonus + motivationBonus + reflectionBonus;
}

function getReflectionBonus() {
  const reflection = els.reflectionInput.value.trim();
  const hypothesis = els.hypothesisInput.value.trim();
  const reflectionScore = reflection.length >= 40 ? 4 : reflection.length >= 16 ? 2 : 0;
  const hypothesisScore = hypothesis.length >= 12 ? 3 : hypothesis.length > 0 ? 1 : 0;
  return reflectionScore + hypothesisScore;
}

function rankedEncounters() {
  const motivation = Number(els.motivation.value);
  const themeRankings = getThemeBaseRankings();
  if (themeRankings.length) {
    return themeRankings.map((encounter) => ({
      ...encounter,
      score: encounter.themeEvaluation.total,
    }));
  }
  return getEncounters()
    .map((encounter) => ({
      ...encounter,
      score: scoreEncounter(encounter, state.interests, motivation),
    }))
    .sort((a, b) => b.score - a.score);
}

function getSelectedEncounter() {
  return getEncounters().find((encounter) => encounter.id === state.selected) || getEncounters()[0];
}

function renderStats(delta = 0) {
  els.questScore.textContent = state.quest;
  els.scoreDelta.textContent = delta > 0 ? `+${delta}` : "+0";
  els.questMeter.style.width = `${Math.min(100, state.quest)}%`;
  els.joy.textContent = state.joy;
  els.drive.textContent = state.drive;
  els.thanks.textContent = state.thanks;
  els.curiosity.style.width = `${clamp((state.joy + Math.min(100, state.quest)) / 2)}%`;
  els.collab.style.width = `${clamp((state.drive + state.thanks * 2) / 2)}%`;
  els.trust.style.width = `${clamp(state.thanks * 3)}%`;
  els.streakCount.textContent = `${state.streak}日`;
  els.explorationDepthOutput.textContent = depthLabels[getDepth() - 1];
  const maxDepth = getBestDepth();
  els.bestDepth.textContent = depthLabels[maxDepth - 1].replace("まで", "");
}

function renderSpots() {
  const ranked = rankedEncounters();
  const themeActive = Boolean(state.themeSearch?.query);
  els.eventCount.textContent = `${ranked.length}件`;
  els.spotsLayer.innerHTML = ranked
    .map((encounter, index) => {
      const isActive = encounter.id === state.selected ? " active" : "";
      const mapped = themeActive && index < 6 ? " mapped" : "";
      const score = themeActive ? encounter.themeEvaluation?.total || getThemeEvaluation(encounter.id)?.total : encounter.index;
      const position = encounter.position || createMapPosition(index);
      return `<button class="spot${isActive}${mapped}" style="--x: ${position.x}%; --y: ${position.y}%; --spot-color: ${encounter.color || "#2f6fb3"}" type="button" data-id="${encounter.id}" aria-label="${encounter.title}">
        <span>${score}</span>
      </button>`;
    })
    .join("");
  els.spotsLayer.querySelectorAll(".spot").forEach((spot) => {
    spot.addEventListener("click", () => {
      state.selected = spot.dataset.id;
      grantJoy(3, `${getEventTitle(spot.dataset.id)}の詳細を開いた`, `event-view:${spot.dataset.id}`);
      saveState();
      render();
    });
  });
  renderGoogleMapMarkers();
}

function renderEventList() {
  const ranked = rankedEncounters();
  const themeActive = Boolean(state.themeSearch?.query);
  renderEventDrawer();
  renderEncounterPanelState();
  els.eventList.innerHTML = ranked
    .map((encounter, index) => {
      const active = encounter.id === state.selected ? " active" : "";
      const complete = state.completed.includes(encounter.id)
        ? "参加済"
        : themeActive
          ? `評価 ${Math.min(99, encounter.score)}`
          : `適合 ${Math.min(99, encounter.score)}`;
      return `<button class="event-card${active}" type="button" data-id="${encounter.id}">
        <span>${index + 1}</span>
        <strong>${encounter.title}</strong>
        <small>${encounter.impact} / ${getEventPeriodLabel(encounter)}</small>
        <em>${complete}</em>
      </button>`;
    })
    .join("");
  els.eventList.querySelectorAll(".event-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.selected = card.dataset.id;
      grantJoy(3, `${getEventTitle(card.dataset.id)}の詳細を開いた`, `event-view:${card.dataset.id}`);
      saveState();
      render();
    });
  });
}

function renderEventDrawer() {
  const mode = state.ui?.eventsPanel || "compact";
  els.eventDrawer.classList.toggle("compact", mode === "compact");
  els.eventDrawer.classList.toggle("collapsed", mode === "collapsed");
  els.compactEventsButton.textContent = mode === "compact" ? "▣" : "□";
  els.compactEventsButton.setAttribute(
    "aria-label",
    mode === "compact" ? "推薦イベントを通常表示" : "推薦イベントを小さく表示"
  );
  els.collapseEventsButton.textContent = mode === "collapsed" ? "+" : "−";
  els.collapseEventsButton.setAttribute(
    "aria-label",
    mode === "collapsed" ? "推薦イベントを開く" : "推薦イベントを折りたたむ"
  );
}

function renderEncounterPanelState() {
  if (!els.encounterPanel) return;
  const mode = state.ui?.encounterPanel || "open";
  els.encounterPanel.classList.toggle("compact", mode === "compact");
  els.encounterPanel.classList.toggle("collapsed", mode === "collapsed");
  if (els.compactEncounterButton) {
    els.compactEncounterButton.textContent = mode === "compact" ? "□" : "▣";
    els.compactEncounterButton.setAttribute(
      "aria-label",
      mode === "compact" ? "イベント詳細を通常表示" : "イベント詳細を小さく表示"
    );
  }
  if (els.collapseEncounterButton) {
    els.collapseEncounterButton.textContent = mode === "collapsed" ? "+" : "−";
    els.collapseEncounterButton.setAttribute(
      "aria-label",
      mode === "collapsed" ? "イベント詳細を開く" : "イベント詳細を見出しだけ表示"
    );
  }
}

function renderThemeEvaluation() {
  if (!els.themeEvaluationPanel) return;
  const query = state.themeSearch?.query?.trim();
  if (els.mapSearch && document.activeElement !== els.mapSearch) {
    els.mapSearch.value = query || "";
  }
  els.themeEvaluationPanel.classList.toggle("hidden", !query);
  if (!query) return;

  const bases = getThemeBaseRankings().slice(0, 4);
  const average = bases.length
    ? clamp(bases.reduce((sum, item) => sum + item.themeEvaluation.total, 0) / bases.length)
    : 0;
  const keywords = getThemeKeywords(query, bases);
  const places = getThemePlaces(bases);
  const aiKeywords = Array.isArray(state.themeSearch.aiKeywords) ? state.themeSearch.aiKeywords : [];
  const aiPlaces = Array.isArray(state.themeSearch.aiPlaces) ? state.themeSearch.aiPlaces.map(normalizeThemePlace).filter((place) => place.name) : [];
  let aiPlaceMarkerIndex = 0;
  const aiPlaceLabels = aiPlaces.map((place) => (hasThemePlaceLatLng(place) ? `P${(aiPlaceMarkerIndex += 1)}` : "位置未定"));
  const nextQuestions = Array.isArray(state.themeSearch.nextQuestions) ? state.themeSearch.nextQuestions : [];
  const mergedKeywords = [...new Set([...aiKeywords, ...keywords])].slice(0, 12);
  els.themeEvaluationTitle.textContent = query;
  els.themeEvaluationScore.textContent = average;
  els.themeEvaluationScore.style.background = average >= 80 ? "var(--green)" : average >= 65 ? "var(--gold)" : "var(--rose)";
  if (els.themeOverview) {
    els.themeOverview.textContent =
      state.themeSearch.answer ||
      (state.themeSearch.status === "loading"
        ? "AIに探究の広がりを質問中..."
        : buildThemeOverview(query, keywords, places, bases));
  }
  if (els.themeKeywords) {
    els.themeKeywords.innerHTML = mergedKeywords
      .map((keyword) => `<button type="button" data-theme-keyword="${escapeHtml(keyword)}">${escapeHtml(keyword)}</button>`)
      .join("");
  }
  if (els.themePlaces) {
    els.themePlaces.innerHTML = [
      ...aiPlaces.map(
        (place, index) => `<button type="button" class="theme-place-note" data-ai-place-index="${index}">
        <strong><span class="theme-place-label">${escapeHtml(aiPlaceLabels[index])}</span>${escapeHtml(place.name)}</strong>
        <span>${escapeHtml(place.type)} / ${escapeHtml(place.reason)}</span>
        <small>${hasThemePlaceLatLng(place) ? `${Number(place.lat).toFixed(4)}, ${Number(place.lng).toFixed(4)}` : escapeHtml(place.searchHint || "位置情報なし")}</small>
      </button>`
      ),
      ...places.map(
        (place) => `<button type="button" data-id="${place.eventId}">
        <strong>${escapeHtml(place.location)}</strong>
        <span>${escapeHtml(place.title)} / 評価 ${place.score}</span>
        <small>${place.lat && place.lng ? `${place.lat}, ${place.lng}` : "座標未設定"}</small>
      </button>`
      ),
    ].join("");
  }
  els.themeEvaluationBases.innerHTML = bases
    .map((base, index) => {
      const evaluation = base.themeEvaluation;
      const hits = evaluation.hits.length ? evaluation.hits.join("・") : "未知との接続";
      return `<button type="button" data-id="${base.id}">
        <span>${index + 1}</span>
        <strong>${escapeHtml(base.title)}</strong>
        <em>評価 ${evaluation.total}</em>
        <small>${escapeHtml(hits)} / ${escapeHtml(base.locationName || base.impact)}</small>
      </button>`;
    })
    .concat(
      nextQuestions.map(
        (question, index) => `<button type="button" class="theme-question-note">
        <span>Q${index + 1}</span>
        <strong>${escapeHtml(question)}</strong>
        <em>次の問い</em>
        <small>この問いをイベントや場所で確かめる</small>
      </button>`
      )
    )
    .join("");
  [
    ...els.themeEvaluationBases.querySelectorAll("[data-id]"),
    ...(els.themePlaces ? els.themePlaces.querySelectorAll("[data-id]") : []),
  ].forEach((button) => {
    button.addEventListener("click", () => {
      state.selected = button.dataset.id;
      saveState();
      render();
      if (googleMap) {
        const selected = getSelectedEncounter();
        if (hasValidLatLng(selected.position)) {
          focusGoogleMapPoint({ lat: Number(selected.position.lat), lng: Number(selected.position.lng) }, 9);
        }
      }
    });
  });
  if (els.themePlaces) {
    els.themePlaces.querySelectorAll("[data-ai-place-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const place = aiPlaces[Number(button.dataset.aiPlaceIndex)];
        if (!place) return;
        askThemePlace(place);
        if (googleMap && hasThemePlaceLatLng(place)) {
          focusGoogleMapPoint({ lat: Number(place.lat), lng: Number(place.lng) }, Math.max(googleMap.getZoom(), 10));
        }
      });
    });
  }
  if (els.themeKeywords) {
    els.themeKeywords.querySelectorAll("[data-theme-keyword]").forEach((button) => {
      button.addEventListener("click", () => {
        const keyword = button.dataset.themeKeyword || "";
        if (!keyword) return;
        grantJoy(2, `候補キーワード「${keyword}」を開いた`, `theme-keyword:${query}:${keyword}`);
        searchThemeOnMap(keyword);
      });
    });
  }
}

function toggleCompactEvents() {
  state.ui.eventsPanel = state.ui.eventsPanel === "compact" ? "open" : "compact";
  saveState();
  renderEventDrawer();
}

function toggleCollapseEvents() {
  state.ui.eventsPanel = state.ui.eventsPanel === "collapsed" ? "compact" : "collapsed";
  saveState();
  renderEventDrawer();
}

function toggleCompactEncounter() {
  state.ui.encounterPanel = state.ui.encounterPanel === "compact" ? "open" : "compact";
  saveState();
  renderEncounterPanelState();
}

function toggleCollapseEncounter() {
  state.ui.encounterPanel = state.ui.encounterPanel === "collapsed" ? "compact" : "collapsed";
  saveState();
  renderEncounterPanelState();
}

window.toggleCompactEvents = toggleCompactEvents;
window.toggleCollapseEvents = toggleCollapseEvents;

function renderEncounter() {
  const encounter = getSelectedEncounter();
  const keywords = getEncounterKeywords(encounter);
  const tags = getEncounterTags(encounter);
  const questions = getEncounterQuestions(encounter);
  const overlap = keywords.filter((keyword) =>
    state.interests.some((interest) => interest.toLowerCase().includes(keyword.toLowerCase()))
  );
  els.title.textContent = encounter.title;
  els.index.textContent = encounter.index;
  els.index.style.background = encounter.color || "#2f6fb3";
  els.description.textContent = encounter.description;
  els.tags.innerHTML = tags.map((tag) => `<span>${tag}</span>`).join("");
  els.matchReason.textContent = overlap.length
    ? `${overlap.slice(0, 3).join("・")}への関心が強く反応しています`
    : "未知の事象から問いを遠くへ広げるイベントです";
  els.impactField.textContent = encounter.impact;
  els.description.textContent = `${encounter.description} ${getEventPeriodLabel(encounter)}。現在の探究距離: ${questions[getDepth() - 1]}`;
  els.questionPath.innerHTML = questions
    .map((question, index) => {
      const active = index + 1 <= getDepth() ? " class=\"active\"" : "";
      return `<li${active}><span>${depthLabels[index].replace("まで", "")}</span>${question}</li>`;
    })
    .join("");
  els.media.style.setProperty(
    "--media",
    `radial-gradient(circle at 28% 26%, ${encounter.color || "#2f6fb3"} 0 10%, transparent 11%),
     linear-gradient(140deg, rgba(255,255,255,.28), rgba(255,255,255,0)),
     repeating-linear-gradient(35deg, ${encounter.color || "#2f6fb3"} 0 12px, #f7fbf6 12px 24px)`
  );
}

function renderGrowthPath() {
  const labels = ["事象に出会う", "背景を調べる", "構造をつかむ", "別領域へ越境", "小さく実装"];
  const maxDepth = getBestDepth();
  els.growthPath.innerHTML = labels
    .map((label, index) => {
      const active = index + 1 <= maxDepth ? " active" : "";
      return `<span class="${active.trim()}">${label}</span>`;
    })
    .join("");
}

function renderFeedbackView() {
  const bestDepth = getBestDepth();
  const reflections = state.reflections.length
    ? state.reflections
    : [
        {
          eventId: state.selected,
          depth: getDepth(),
          reflection: "まだ振り返りはありません。イベント参加後の気づきがここに表示されます。",
          hypothesis: "次に試したいことが未記入です。",
          at: new Date().toISOString(),
        },
      ];

  if (!state.selectedReflection && state.reflections[0]) {
    state.selectedReflection = state.reflections[0].at;
  }

  const selected = reflections.find((item) => item.at === state.selectedReflection) || reflections[0];
  els.feedbackQuestScore.textContent = state.quest;
  els.feedbackBestDepth.textContent = depthLabels[bestDepth - 1].replace("まで", "");
  els.feedbackReflectionCount.textContent = state.reflections.length;
  els.reviewTarget.textContent = depthLabels[(selected.depth || 1) - 1].replace("まで", "");
  els.feedbackStatus.textContent = state.feedbacks.length ? `${state.feedbacks.length}件送信` : "未送信";

  els.reflectionReviewList.innerHTML = reflections
    .map((item) => {
      const active = item.at === selected.at ? " active" : "";
      return `<button class="review-item${active}" type="button" data-at="${item.at}">
        <span>${depthLabels[(item.depth || 1) - 1]}</span>
        <strong>${getEventTitle(item.eventId)}</strong>
        <p>${item.reflection || "気づき・問いは未記入です。"}</p>
        <em>${item.hypothesis || "次に試したいことは未記入です。"}</em>
      </button>`;
    })
    .join("");
  els.reflectionReviewList.querySelectorAll(".review-item").forEach((item) => {
    item.addEventListener("click", () => {
      state.selectedReflection = item.dataset.at;
      saveState();
      renderFeedbackView();
    });
  });

  els.mentorFeedbackList.innerHTML = state.feedbacks.length
    ? state.feedbacks
        .map(
          (item) => `<article>
            <time>${formatTime(new Date(item.at))}</time>
            <strong>${item.kindLabel}</strong>
            <p>${item.comment}</p>
            <em>${item.nextQuestion}</em>
          </article>`
        )
        .join("")
    : "<p class=\"empty-note\">まだ送信済みコメントはありません。</p>";

  renderMentorSuggestions(selected);
}

function renderMentorSuggestions(reflection) {
  const depth = reflection.depth || getDepth();
  const suggestions = [
    "よかった点を1つ具体的に返す",
    depth < 3 ? "背景から構造へ進む問いを渡す" : "他分野へ越境する問いを渡す",
    reflection.hypothesis ? "次に試す方法を小さくする" : "次に試したい行動を一緒に決める",
  ];
  els.mentorSuggestions.innerHTML = suggestions.map((suggestion) => `<li>${suggestion}</li>`).join("");
}

function renderInterests() {
  els.interestPills.innerHTML = state.interests.map((interest) => `<span>${interest}</span>`).join("");
  const selected = getSelectedEncounter();
  els.dailyMission.textContent = `${selected.title}で出会った事象から「${getEncounterQuestions(selected)[getDepth() - 1]}」まで問いを伸ばす。`;
}

function renderActivity() {
  if (!state.activity.length) {
    els.activityLog.innerHTML = "<li><time>未開始</time>イベントに出会い、問いをどこまで遠くへ伸ばせたかを記録すると探究ログが育ちます。</li>";
    return;
  }
  els.activityLog.innerHTML = state.activity
    .map((item) => `<li><time>${formatTime(new Date(item.at))}</time>${item.text}</li>`)
    .join("");
}

function render() {
  renderAuth();
  renderMemberSummary();
  renderStats();
  renderSpots();
  renderEventList();
  renderEncounter();
  renderInterests();
  renderActivity();
  renderGrowthPath();
  renderFeedbackView();
  renderThemeEvaluation();
  renderAiSuggestions();
  renderRegisteredEvents();
  renderDriveSync();
  renderMapsSettings();
  renderDatabaseStatus();
}

function renderAuth() {
  const needsMember = state.auth.loggedIn && !state.member.name;
  const showMember = state.auth.loggedIn && (needsMember || state.ui.memberEditing);
  els.authScreen.classList.toggle("hidden", state.auth.loggedIn && !showMember);
  els.loginForm.classList.toggle("hidden", state.auth.loggedIn);
  els.memberForm.classList.toggle("hidden", !showMember);
  els.backLoginButton.textContent = state.auth.loggedIn ? "閉じる" : "ログインに戻る";
}

function renderMemberSummary() {
  els.memberSummaryName.textContent = state.member.name || "未設定";
  const meta = [state.member.grade, state.member.school, state.member.region].filter(Boolean).join(" / ");
  els.memberSummaryMeta.textContent = meta || "学年・学校未設定";
}

function setMemberStatus(message, isError = false) {
  [els.memberFormStatus, els.memberSummaryStatus].forEach((element) => {
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("error", isError);
  });
}

function showMemberForm() {
  state.ui.memberEditing = true;
  els.authScreen.classList.remove("hidden");
  els.loginForm.classList.add("hidden");
  els.memberForm.classList.remove("hidden");
  els.memberName.value = state.member.name || "";
  els.memberSchool.value = state.member.school || "";
  els.memberGrade.value = state.member.grade || "中1";
  els.memberRegion.value = state.member.region || "";
  els.memberInterest.value = state.member.initialInterest || "";
  setMemberStatus("");
}

function handleLogin(event) {
  event.preventDefault();
  state.auth = {
    loggedIn: true,
    email: els.loginEmail.value.trim(),
  };
  if (!state.member.name) {
    showMemberForm();
  }
  addActivity(`${state.auth.email || "デモユーザー"}でログイン`);
  saveState();
  render();
}

function handleDemoLogin() {
  els.loginEmail.value = "student@example.com";
  els.loginPassword.value = "password";
  state.auth = {
    loggedIn: true,
    email: "student@example.com",
  };
  if (!state.member.name) {
    showMemberForm();
  }
  addActivity("デモユーザーでログイン");
  saveState();
  render();
}

function saveMemberInfo(event) {
  event.preventDefault();
  const interestText = els.memberInterest.value.trim();
  state.member = {
    name: els.memberName.value.trim() || "中高生ユーザー",
    school: els.memberSchool.value.trim(),
    grade: els.memberGrade.value,
    region: els.memberRegion.value.trim(),
    initialInterest: interestText,
  };
  if (interestText) {
    state.interests = [...new Set([...extractInterests(interestText), ...state.interests])].slice(0, 10);
    state.sparks.unshift({ text: interestText, source: "member-profile", at: new Date().toISOString() });
    state.sparks = state.sparks.slice(0, 20);
  }
  addActivity(`${state.member.name}の会員情報を保存`);
  state.ui.memberEditing = false;
  const saved = saveState();
  render();
  setMemberStatus(saved ? "会員情報を保存しました" : "ブラウザ保存に失敗しました。ローカルサーバーで開き直してください。", !saved);
  if (getDriveUrl()) {
    postToDrive("users", memberToDriveRecord());
  }
}

function logout() {
  state.auth = { loggedIn: false, email: "" };
  saveState();
  render();
}

async function initDatabase() {
  if (!window.WakuwakuDB || !("indexedDB" in window)) {
    els.dbStatus.textContent = "未対応";
    return;
  }

  try {
    appDb = await window.WakuwakuDB.openDatabase();
    await window.WakuwakuDB.seedEvents(appDb, getEncounters());
    const dbState = await window.WakuwakuDB.readState(appDb, defaultState);
    const hasDbProfile = dbState.quest !== defaultState.quest || dbState.activity.length || dbState.reflections.length || dbState.feedbacks.length;

    if (hasDbProfile) {
      Object.assign(state, dbState);
      dedupeCustomEvents();
      await window.WakuwakuDB.writeState(appDb, state, getEncounters());
    } else {
      await window.WakuwakuDB.writeState(appDb, state, getEncounters());
    }

    dbReady = true;
    els.dbStatus.textContent = "接続中";
    render();
  } catch (error) {
    els.dbStatus.textContent = "DBエラー";
    console.error(error);
  }
}

async function renderDatabaseStatus() {
  if (!dbReady || !appDb || !els.dbCounts) {
    if (els.dbCounts) {
      els.dbCounts.innerHTML = [
        ["profiles", 0],
        ["events", getEncounters().length],
        ["reflections", state.reflections.length],
        ["feedbacks", state.feedbacks.length],
      ]
        .map(([label, count]) => `<div><span>${label}</span><strong>${count}</strong></div>`)
        .join("");
    }
    return;
  }

  const counts = await window.WakuwakuDB.getCounts(appDb);
  els.dbStatus.textContent = "保存済み";
  els.dbCounts.innerHTML = [
    ["profiles", counts.profiles || 0],
    ["events", counts.events || 0],
    ["sparks", counts.sparks || 0],
    ["logs", counts.activities || 0],
    ["explore", counts.reflections || 0],
    ["feedback", counts.feedbacks || 0],
  ]
    .map(([label, count]) => `<div><span>${label}</span><strong>${count}</strong></div>`)
    .join("");
}

async function exportDatabase() {
  if (!dbReady || !appDb) return;
  const snapshot = await window.WakuwakuDB.exportSnapshot(appDb);
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `wakuwaku-quest-db-${todayKey()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function eventToDriveRecord(event) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    exploration_index: event.index,
    impact: event.impact,
    tags: event.tags.join(","),
    keywords: event.keywords.join(","),
    question_path: event.questionPath.join("|"),
    color: event.color,
    location_name: event.locationName || "",
    event_type: event.eventType || "permanent",
    start_date: event.startDate || "",
    end_date: event.endDate || "",
    latitude: event.position?.lat || "",
    longitude: event.position?.lng || "",
    user_created: Boolean(event.userCreated),
    created_by: state.auth.email || state.member.name || "local-user",
    created_at: event.createdAt || new Date().toISOString(),
  };
}

function memberToDriveRecord() {
  return {
    id: state.auth.email || "local-user",
    display_name: state.member.name || "中高生ユーザー",
    role: "student",
    school: state.member.school,
    grade: state.member.grade,
    region: state.member.region,
    initial_interest: state.member.initialInterest,
    quest: state.quest,
    joy: state.joy,
    exploration_distance: state.drive,
    reflection_power: state.thanks,
    interests: state.interests.join(","),
    created_at: new Date().toISOString(),
  };
}

function sparkToDriveRecord(spark) {
  return {
    id: `spark-${spark.at || Date.now()}`,
    user_id: state.auth.email || "local-user",
    text: spark.text,
    source: "web-app",
    created_at: spark.at || new Date().toISOString(),
  };
}

function reflectionToDriveRecord(reflection) {
  return {
    id: `reflection-${reflection.at || Date.now()}`,
    user_id: state.auth.email || "local-user",
    event_id: reflection.eventId,
    depth: reflection.depth,
    depth_label: depthLabels[(reflection.depth || 1) - 1] || "事実まで",
    reflection: reflection.reflection,
    hypothesis: reflection.hypothesis,
    quest_delta: reflection.depth * 3,
    created_at: reflection.at || new Date().toISOString(),
  };
}

function feedbackToDriveRecord(feedback) {
  return {
    id: `feedback-${feedback.at || Date.now()}`,
    reflection_id: `reflection-${feedback.reflectionAt || ""}`,
    student_id: state.auth.email || "local-user",
    mentor_id: "mentor-local",
    kind: feedback.kind,
    comment: feedback.comment,
    next_question: feedback.nextQuestion,
    created_at: feedback.at || new Date().toISOString(),
  };
}

async function syncAllToDrive() {
  if (!getDriveUrl()) {
    setDriveStatus("Apps Script URLを入力してください");
    return;
  }

  setDriveStatus("Drive同期中...");
  await postToDrive("users", memberToDriveRecord());
  for (const event of state.customEvents) {
    await postToDrive("events", eventToDriveRecord(event));
  }
  for (const spark of state.sparks.slice(0, 10)) {
    await postToDrive("sparks", sparkToDriveRecord(spark));
  }
  for (const reflection of state.reflections.slice(0, 10)) {
    await postToDrive("reflections", reflectionToDriveRecord(reflection));
  }
  for (const feedback of state.feedbacks.slice(0, 10)) {
    await postToDrive("feedbacks", feedbackToDriveRecord(feedback));
  }
  state.driveSync.lastSyncAt = new Date().toISOString();
  setDriveStatus("Drive同期完了");
  saveState();
  renderDriveSync();
}

function selectRecommendation() {
  const text = els.sparkInput.value.trim();
  if (text) {
    state.sparks.unshift({ text, at: new Date().toISOString() });
    state.sparks = state.sparks.slice(0, 20);
    state.interests = [...new Set([...extractInterests(text), ...state.interests])].slice(0, 10);
    addActivity(`ワクワクを収集: ${text.slice(0, 42)}`);
  }
  state.selected = rankedEncounters()[0].id;
  saveState();
  render();
}

async function fetchThemeAnswer(query, selectedPlace = null) {
  const bases = getThemeBaseRankings().slice(0, 4);
  const response = await fetch(getThemeAnswerApiPath(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      grade: state.member.grade,
      region: state.member.region,
      interests: state.interests,
      localPlaces: bases.map((base) => base.locationName || base.impact).filter(Boolean),
      selectedPlace,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

async function askThemePlace(place) {
  const normalizedPlace = normalizeThemePlace(place);
  const query = state.themeSearch?.query?.trim() || normalizedPlace.name;
  if (!query || !normalizedPlace.name) return;
  grantJoy(5, `${normalizedPlace.name}を探究場所として開いた`, `theme-place:${query}:${normalizedPlace.name}`);
  state.themeSearch = {
    ...state.themeSearch,
    query,
    status: "loading",
    selectedPlace: normalizedPlace,
    answer: `${normalizedPlace.name}の位置情報をもとにAIへ質問中...`,
  };
  saveState();
  render();

  try {
    const answer = await fetchThemeAnswer(query, normalizedPlace);
    if (state.themeSearch.query !== query) return;
    state.themeSearch = {
      ...state.themeSearch,
      status: "done",
      answer: answer.answer || "",
      aiKeywords: Array.isArray(answer.keywords) ? answer.keywords : [],
      aiPlaces: Array.isArray(answer.places) ? answer.places.map(normalizeThemePlace) : [],
      nextQuestions: Array.isArray(answer.nextQuestions) ? answer.nextQuestions : [],
      selectedPlace: normalizedPlace,
    };
    saveState();
    render();
  } catch (error) {
    state.themeSearch = {
      ...state.themeSearch,
      status: "error",
      answer: `${normalizedPlace.name}の位置情報を使ったAI回答を取得できませんでした。`,
      selectedPlace: normalizedPlace,
    };
    saveState();
    render();
    console.error(error);
  }
}

async function searchThemeOnMap(query) {
  const trimmed = query.trim();
  if (!trimmed) {
    state.themeSearch = { ...state.themeSearch, query: "", evaluatedAt: "", status: "", answer: "", aiKeywords: [], aiPlaces: [], nextQuestions: [], selectedPlace: null };
    saveState();
    render();
    return;
  }
  state.themeSearch = {
    query: trimmed,
    evaluatedAt: new Date().toISOString(),
    status: "loading",
    answer: "",
    aiKeywords: [],
    aiPlaces: [],
    nextQuestions: [],
    selectedPlace: null,
  };
  state.interests = [...new Set([...extractInterests(trimmed), trimmed, ...state.interests])].slice(0, 10);
  grantJoy(2, `探究テーマ「${trimmed}」を検索`, `theme-search:${trimmed}`);
  const ranked = rankedEncounters();
  if (ranked[0]) state.selected = ranked[0].id;
  saveState();
  render();

  try {
    const answer = await fetchThemeAnswer(trimmed);
    if (state.themeSearch.query !== trimmed) return;
    state.themeSearch = {
      ...state.themeSearch,
      status: "done",
      answer: answer.answer || "",
      aiKeywords: Array.isArray(answer.keywords) ? answer.keywords : [],
      aiPlaces: Array.isArray(answer.places) ? answer.places.map(normalizeThemePlace) : [],
      nextQuestions: Array.isArray(answer.nextQuestions) ? answer.nextQuestions : [],
      selectedPlace: null,
    };
    saveState();
    render();
  } catch (error) {
    if (state.themeSearch.query !== trimmed) return;
    state.themeSearch = {
      ...state.themeSearch,
      status: "error",
      answer: "",
      aiKeywords: [],
      aiPlaces: [],
      nextQuestions: [],
      selectedPlace: null,
    };
    saveState();
    render();
    console.error(error);
  }
}

function startAdventure() {
  const encounter = getSelectedEncounter();
  const depth = getDepth();
  const delta = calculateQuestDelta(encounter);
  const joyDelta = encounter.boost.joy + getDepthJoyBonus(depth);
  addQuest(delta);
  state.joy = clamp(state.joy + joyDelta);
  state.drive = clamp(state.drive + encounter.boost.distance + depth * 3);
  state.thanks = clamp(state.thanks + encounter.boost.reflection);
  state.completed = [...new Set([encounter.id, ...state.completed])].slice(0, 30);
  addActivity(`${encounter.title}に参加。${depthLabels[depth - 1]}探究して探究値 +${delta} / ワクワク +${joyDelta}`);
  saveState();
  render();
  renderStats(delta);
}

function receiveThanks() {
  const encounter = getSelectedEncounter();
  const depth = getDepth();
  const reflection = els.reflectionInput.value.trim();
  const hypothesis = els.hypothesisInput.value.trim();
  const delta = depth * 3 + getReflectionBonus();
  const joyDelta = 4 + getDepthJoyBonus(depth) + (reflection ? 3 : 0) + (hypothesis ? 2 : 0);
  state.joy = clamp(state.joy + joyDelta);
  state.thanks = clamp(state.thanks + depth * 4 + (reflection ? 3 : 0));
  state.drive = clamp(state.drive + depth * 2 + (hypothesis ? 3 : 0));
  addQuest(delta);
  const reflectionRecord = {
    eventId: encounter.id,
    depth,
    reflection,
    hypothesis,
    at: new Date().toISOString(),
  };
  state.reflections.unshift(reflectionRecord);
  state.selectedReflection = state.reflections[0].at;
  state.reflections = state.reflections.slice(0, 30);
  addActivity(`${encounter.title}の振り返りを記録。問いを「${encounter.questionPath[depth - 1]}」まで伸ばし探究値 +${delta} / ワクワク +${joyDelta}`);
  els.reflectionInput.value = "";
  els.hypothesisInput.value = "";
  saveState();
  render();
  renderStats(delta);
  if (getDriveUrl()) {
    postToDrive("reflections", reflectionToDriveRecord(reflectionRecord));
  }
}

function saveMentorFeedback() {
  const selectedReflection =
    state.reflections.find((reflection) => reflection.at === state.selectedReflection) || state.reflections[0];
  const kindLabel = els.feedbackKind.options[els.feedbackKind.selectedIndex].textContent;
  const comment = els.mentorComment.value.trim();
  const nextQuestion = els.mentorNextQuestion.value.trim();
  if (!comment && !nextQuestion) {
    els.feedbackStatus.textContent = "未入力";
    return;
  }
  const feedbackRecord = {
    reflectionAt: selectedReflection?.at || "",
    eventId: selectedReflection?.eventId || state.selected,
    kind: els.feedbackKind.value,
    kindLabel,
    comment: comment || "次の問いを確認しよう。",
    nextQuestion: nextQuestion || "次はどんな根拠を集める？",
    at: new Date().toISOString(),
  };
  state.feedbacks.unshift(feedbackRecord);
  state.feedbacks = state.feedbacks.slice(0, 30);
  addActivity(`メンターが「${kindLabel}」のフィードバックを送信`);
  els.mentorComment.value = "";
  els.mentorNextQuestion.value = "";
  saveState();
  render();
  showMode("feedback");
  if (getDriveUrl()) {
    postToDrive("feedbacks", feedbackToDriveRecord(feedbackRecord));
  }
}

function saveQuickFeedback(template) {
  const templates = {
    structure: {
      kind: "connection",
      comment: "背景まで見えてきています。次は、誰の行動・制度・お金・環境が関係しているかを分けて考えてみよう。",
      nextQuestion: "この事象に関わる人や仕組みを3つに分けると何が見える？",
    },
    evidence: {
      kind: "evidence",
      comment: "問いが具体的になってきました。次は、観察・聞き取り・データのどれで確かめるかを選ぼう。",
      nextQuestion: "その仮説を確かめるために、どんな根拠を1つ集められる？",
    },
    action: {
      kind: "next",
      comment: "実装に近づいています。大きな解決案にする前に、学校や身近な場所で1日だけ試せる形にしてみよう。",
      nextQuestion: "明日から小さく試すなら、誰に何をお願いする？",
    },
  };
  const selected = templates[template] || templates.structure;
  els.feedbackKind.value = selected.kind;
  els.mentorComment.value = selected.comment;
  els.mentorNextQuestion.value = selected.nextQuestion;
  saveMentorFeedback();
}

function showMode(mode) {
  const feedback = mode === "feedback";
  const eventAdmin = mode === "event-admin";
  els.questViews.forEach((view) => view.classList.toggle("hidden", feedback || eventAdmin));
  els.feedbackView.classList.toggle("hidden", !feedback);
  els.eventAdminView.classList.toggle("hidden", !eventAdmin);
  if (mode === "capital") {
    els.questViews.forEach((view) => view.classList.remove("hidden"));
    els.feedbackView.classList.add("hidden");
    els.eventAdminView.classList.add("hidden");
  }
  document.querySelectorAll(".mode-tabs button").forEach((item) => {
    item.classList.toggle("active", item.dataset.mode === mode);
  });
}

window.setQuestMode = showMode;

function importMockApps() {
  els.sparkInput.value =
    "Classroom: 海洋ごみレポート / Calendar: AI学習支援ハッカソン / Memo: 商店街でフードロス調査";
  selectRecommendation();
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(state, {
    ...defaultState,
    activity: [],
    sparks: [],
    completed: [],
    reflections: [],
    feedbacks: [],
    customEvents: [],
    aiSuggestions: [],
    themeSearch: { query: "", evaluatedAt: "" },
  });
  els.sparkInput.value = "";
  els.reflectionInput.value = "";
  els.hypothesisInput.value = "";
  saveState();
  render();
}

function splitList(value) {
  return value
    .split(/[,\n、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createEventId(title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9ぁ-んァ-ン一-龥]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `custom-${slug || "event"}-${Date.now()}`;
}

function createMapPosition(index) {
  const positions = [
    { x: 58, y: 72, lat: 35.42, lng: 139.42 },
    { x: 86, y: 36, lat: 35.61, lng: 139.3 },
    { x: 18, y: 62, lat: 35.18, lng: 138.9 },
    { x: 56, y: 18, lat: 35.7, lng: 139.9 },
  ];
  return positions[index % positions.length];
}

function createPositionFromLatLng(lat, lng, fallbackIndex = 0) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return createMapPosition(fallbackIndex);
  }
  const x = clamp(((lng - 122) / (153 - 122)) * 100);
  const y = clamp(((46 - lat) / (46 - 24)) * 100);
  return { x, y, lat, lng };
}

function suggestionToEventData(suggestion, index = 0) {
  const title = suggestion.title || "AI候補イベント";
  const lat = Number(suggestion.lat);
  const lng = Number(suggestion.lng);
  const hasLatLng = Number.isFinite(lat) && Number.isFinite(lng);
  const tags = Array.isArray(suggestion.tags) ? suggestion.tags.filter(Boolean) : [];
  const keywords = Array.isArray(suggestion.keywords) ? suggestion.keywords.filter(Boolean) : [];
  const questionPath = Array.isArray(suggestion.questionPath) ? suggestion.questionPath.filter(Boolean).slice(0, 5) : [];
  const fallbackQuestions = [
    "何が起きているか",
    "なぜ起きているか",
    "誰の行動や仕組みと関係するか",
    "他地域や他分野とどうつながるか",
    "学校や地域で何を試せるか",
  ];

  while (questionPath.length < 5) {
    questionPath.push(fallbackQuestions[questionPath.length]);
  }

  return {
    id: createEventId(title),
    title,
    index: clamp(suggestion.explorationIndex || suggestion.index || 76),
    description: suggestion.description || "AIが現在のワクワクから生成した探究イベント候補です。",
    tags: tags.length ? tags : ["AI候補", "探究"],
    keywords: keywords.length ? keywords : tags,
    impact: suggestion.impact || "探究学習・地域課題",
    locationName: suggestion.locationName || "",
    eventType: suggestion.eventType === "limited" ? "limited" : "permanent",
    startDate: suggestion.eventType === "limited" ? suggestion.startDate || "" : "",
    endDate: suggestion.eventType === "limited" ? suggestion.endDate || "" : "",
    questionPath,
    color: ["#2f8f63", "#2f6fb3", "#c85d72", "#d49b2a"][index % 4],
    position: hasLatLng ? createPositionFromLatLng(lat, lng, state.customEvents.length) : createMapPosition(state.customEvents.length),
    boost: { joy: 4, distance: 5, reflection: 3 },
    userCreated: true,
    aiGenerated: true,
    createdAt: new Date().toISOString(),
  };
}

function renderAiSuggestions() {
  if (!els.aiSuggestionList || !els.aiSuggestionStatus) return;
  const suggestions = state.aiSuggestions || [];
  if (!suggestions.length) {
    els.aiSuggestionList.innerHTML = "<p class=\"empty-note\">まだAI候補はありません。</p>";
    return;
  }

  els.aiSuggestionStatus.textContent = `${suggestions.length}件の候補を表示中`;
  els.aiSuggestionList.innerHTML = suggestions
    .map((suggestion, index) => {
      const eventType = suggestion.eventType === "limited" ? "期間限定" : "常設";
      const period =
        suggestion.eventType === "limited" && (suggestion.startDate || suggestion.endDate)
          ? ` / ${[suggestion.startDate, suggestion.endDate].filter(Boolean).join("-")}`
          : "";
      return `<article class="ai-suggestion-card">
        <div>
          <strong>${escapeHtml(suggestion.title || "AI候補イベント")}</strong>
          <span>${escapeHtml([suggestion.impact, suggestion.locationName, `${eventType}${period}`].filter(Boolean).join(" / "))}</span>
        </div>
        <em>${escapeHtml(suggestion.explorationIndex || 76)}</em>
        <p>${escapeHtml(suggestion.reason || suggestion.description || "現在のワクワクから一歩先へ広げる候補です。")}</p>
        <button class="secondary-button" type="button" data-ai-index="${index}">候補を登録</button>
      </article>`;
    })
    .join("");

  els.aiSuggestionList.querySelectorAll("[data-ai-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const suggestion = state.aiSuggestions[Number(button.dataset.aiIndex)];
      if (!suggestion) return;
      addEventRecord(suggestionToEventData(suggestion, Number(button.dataset.aiIndex)));
    });
  });
}

async function searchAiEventSuggestions() {
  if (!els.searchAiEventsButton) return;
  const previousText = els.searchAiEventsButton.textContent;
  const count = clamp(els.aiSuggestionCount?.value || 12, 3, 30);
  els.searchAiEventsButton.disabled = true;
  els.searchAiEventsButton.textContent = "検索中";
  els.aiSuggestionStatus.textContent = `ChatGPT APIで${count}件の探究ポイントを生成中...`;

  const existingEvents = getEncounters()
    .map((event) => `${event.title} / ${event.impact}`)
    .slice(0, 40);
  const completedEvents = state.completed.map(getEventTitle).slice(0, 8);

  try {
    const response = await fetch(getSuggestEventsApiPath(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        count,
        grade: state.member.grade,
        region: els.aiRegionFocus?.value.trim() || state.member.region,
        motivation: Number(els.motivation.value),
        sparks: els.sparkInput.value.trim() || state.member.initialInterest || state.sparks[0]?.text || "",
        interests: state.interests,
        existingEvents,
        completedEvents,
        themeFocus: els.aiThemeFocus?.value.trim() || "",
        eventTypeFocus: els.aiEventTypeFocus?.value || "mixed",
        locationPrecision: els.aiLocationPrecision?.value || "region",
        diversityFocus: els.aiDiversityFocus?.value || "balanced",
        extraPrompt: els.aiExtraPrompt?.value.trim() || "",
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    state.aiSuggestions = Array.isArray(data.events) ? data.events : [];
    addActivity(`AI探究ポイントを${state.aiSuggestions.length}件生成`);
    saveState();
    renderAiSuggestions();
  } catch (error) {
    const localHint =
      location.hostname === "127.0.0.1" || location.hostname === "localhost"
        ? "公開版でOPENAI_API_KEYを設定すると使えます"
        : "VercelのOPENAI_API_KEYを確認してください";
    els.aiSuggestionStatus.textContent = `AI候補を取得できません: ${localHint}`;
    console.error(error);
  } finally {
    els.searchAiEventsButton.disabled = false;
    els.searchAiEventsButton.textContent = previousText;
  }
}

function getEventPosition() {
  const latValue = els.eventLat.value.trim();
  const lngValue = els.eventLng.value.trim();
  if (!latValue && !lngValue) {
    return createMapPosition(state.customEvents.length);
  }
  const lat = Number(latValue);
  const lng = Number(lngValue);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    els.eventAdminStatus.textContent = "緯度経度を確認";
    return null;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    els.eventAdminStatus.textContent = "緯度経度の範囲外";
    return null;
  }
  return createPositionFromLatLng(lat, lng, state.customEvents.length);
}

function useMapCenterForEvent() {
  if (googleMap && window.google?.maps) {
    const center = googleMap.getCenter();
    els.eventLat.value = center.lat().toFixed(6);
    els.eventLng.value = center.lng().toFixed(6);
    els.eventAdminStatus.textContent = "地図中心を入力";
    renderEventLocationMarker({ lat: center.lat(), lng: center.lng() });
    return;
  }
  const selected = getSelectedEncounter();
  const position = hasValidLatLng(selected.position) ? selected.position : createMapPosition(state.customEvents.length);
  els.eventLat.value = Number(position.lat).toFixed(6);
  els.eventLng.value = Number(position.lng).toFixed(6);
  els.eventAdminStatus.textContent = "選択中イベントの位置を入力";
  renderEventLocationMarker({ lat: Number(position.lat), lng: Number(position.lng) });
}

function syncEventLocationMarkerFromInputs() {
  const lat = Number(els.eventLat.value);
  const lng = Number(els.eventLng.value);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
  renderEventLocationMarker({ lat, lng });
}

function addEventRecord(eventData) {
  const duplicate = state.customEvents.find((event) => event.title === eventData.title && event.impact === eventData.impact);
  if (duplicate) {
    state.selected = duplicate.id;
    els.eventAdminStatus.textContent = "登録済み";
    saveState();
    render();
    showMode("event-admin");
    return;
  }
  state.customEvents.unshift(eventData);
  dedupeCustomEvents();
  state.selected = eventData.id;
  addActivity(`${eventData.title}をイベント登録`);
  els.eventAdminStatus.textContent = "登録済み";
  saveState();
  render();
  showMode("event-admin");
  if (getDriveUrl()) {
    postToDrive("events", eventToDriveRecord(eventData));
  }
}

function registerAllAiSuggestions() {
  const suggestions = Array.isArray(state.aiSuggestions) ? state.aiSuggestions : [];
  if (!suggestions.length) {
    els.aiSuggestionStatus.textContent = "登録するAI候補がありません";
    return;
  }
  let added = 0;
  suggestions.forEach((suggestion, index) => {
    const eventData = suggestionToEventData(suggestion, index);
    const duplicate = state.customEvents.find((event) => event.title === eventData.title && event.impact === eventData.impact);
    if (duplicate) return;
    state.customEvents.unshift(eventData);
    added += 1;
  });
  dedupeCustomEvents();
  if (state.customEvents[0]) state.selected = state.customEvents[0].id;
  els.aiSuggestionStatus.textContent = `${added}件の探究ポイントを登録しました`;
  els.eventAdminStatus.textContent = `${added}件まとめて登録`;
  addActivity(`AI探究ポイントを${added}件まとめて登録`);
  saveState();
  render();
  showMode("event-admin");
}

function registerEvent(event) {
  event.preventDefault();
  const title = els.eventTitle.value.trim();
  const impact = els.eventImpact.value.trim();
  const description = els.eventDescription.value.trim();
  if (!title || !impact || !description) {
    els.eventAdminStatus.textContent = "未入力";
    return;
  }

  const tags = splitList(els.eventTags.value);
  const keywords = splitList(els.eventKeywords.value);
  const position = getEventPosition();
  if (!position) return;
  const questionPath = els.eventQuestions.map((input, index) => input.value.trim() || [
    "何が起きているか",
    "なぜ起きているか",
    "誰の行動や仕組みと関係するか",
    "他地域や他分野とどうつながるか",
    "学校や地域で何を試せるか",
  ][index]);
  const eventData = {
    id: createEventId(title),
    title,
    index: clamp(Number(els.eventIndex.value) || 70),
    description,
    tags,
    keywords: keywords.length ? keywords : tags,
    impact,
    locationName: els.eventLocation.value.trim(),
    eventType: els.eventType.value,
    startDate: els.eventStartDate.value,
    endDate: els.eventEndDate.value,
    questionPath,
    color: els.eventColor.value || "#2f8f63",
    position,
    boost: { joy: 4, distance: 4, reflection: 3 },
    userCreated: true,
    createdAt: new Date().toISOString(),
  };

  els.eventForm.reset();
  els.eventIndex.value = 78;
  els.eventColor.value = "#2f8f63";
  els.eventType.value = "permanent";
  addEventRecord(eventData);
}

function registerSampleEvent() {
  const title = "地域防災インタビュー探究";
  addEventRecord({
    id: createEventId(title),
    title,
    index: 88,
    description:
      "中高生が地域の避難所や商店街で聞き取りを行い、防災を生活、福祉、情報伝達の仕組みまで広げて考えるイベント。",
    tags: ["防災", "聞き取り", "地域"],
    keywords: ["防災", "地域", "福祉", "避難"],
    impact: "防災・地域コミュニティ",
    locationName: "地域の避難所・商店街",
    eventType: "limited",
    startDate: "2026-07-20",
    endDate: "2026-08-31",
    questionPath: [
      "避難所には何が必要か",
      "なぜ情報が届かない人がいるのか",
      "行政、学校、地域住民はどう関係するか",
      "福祉や観光の視点では何が見えるか",
      "学校で防災情報の伝え方を試せるか",
    ],
    color: "#2f6fb3",
    position: createPositionFromLatLng(35.681, 139.767, state.customEvents.length),
    boost: { joy: 4, distance: 5, reflection: 3 },
    userCreated: true,
    createdAt: new Date().toISOString(),
  });
}

function renderRegisteredEvents() {
  const events = state.customEvents;
  els.registeredEventCount.textContent = `${events.length}件`;
  els.registeredEventList.innerHTML = events.length
    ? events
        .map(
          (event) => `<button class="registered-event-card" type="button" data-id="${event.id}">
            <strong>${event.title}</strong>
            <span>${[event.impact, event.locationName, getEventPeriodLabel(event)].filter(Boolean).join(" / ")}</span>
            <em>${event.index}</em>
          </button>`
        )
        .join("")
    : "<p class=\"empty-note\">まだ登録イベントはありません。</p>";
  els.registeredEventList.querySelectorAll(".registered-event-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.selected = card.dataset.id;
      saveState();
      render();
      showMode("quest");
    });
  });
}

document.querySelector("#start-button").addEventListener("click", startAdventure);
document.querySelector("#thanks-button").addEventListener("click", receiveThanks);
els.loginForm.addEventListener("submit", handleLogin);
els.demoLoginButton.addEventListener("click", handleDemoLogin);
els.memberForm.addEventListener("submit", saveMemberInfo);
els.backLoginButton.addEventListener("click", () => {
  if (state.auth.loggedIn) {
    state.ui.memberEditing = false;
    saveState();
    render();
    return;
  }
  state.auth = { loggedIn: false, email: "" };
  saveState();
  render();
});
els.editMemberButton.addEventListener("click", showMemberForm);
els.logoutButton.addEventListener("click", logout);
els.eventForm.addEventListener("submit", registerEvent);
els.sampleEventButton.addEventListener("click", registerSampleEvent);
els.searchAiEventsButton.addEventListener("click", searchAiEventSuggestions);
els.registerAllAiEventsButton?.addEventListener("click", registerAllAiSuggestions);
els.useMapCenterButton.addEventListener("click", useMapCenterForEvent);
els.openLocationMapButton.addEventListener("click", initializeEventLocationMap);
els.eventLat.addEventListener("input", syncEventLocationMarkerFromInputs);
els.eventLng.addEventListener("input", syncEventLocationMarkerFromInputs);
els.saveDriveUrlButton.addEventListener("click", saveDriveUrl);
els.syncDriveButton.addEventListener("click", syncAllToDrive);
els.saveMapsKeyButton.addEventListener("click", saveMapsKey);
els.loadMapsButton.addEventListener("click", initializeGoogleMap);
els.centerSearchButton?.addEventListener("click", centerGoogleMapOnSearch);
els.currentLocationButton?.addEventListener("click", centerOnCurrentLocation);
els.compactEncounterButton?.addEventListener("click", toggleCompactEncounter);
els.collapseEncounterButton?.addEventListener("click", toggleCollapseEncounter);
els.saveFeedbackButton.addEventListener("click", saveMentorFeedback);
els.quickFeedbackButtons.forEach((button) => {
  button.addEventListener("click", () => saveQuickFeedback(button.dataset.template));
});
document.querySelector("#analyze-button").addEventListener("click", selectRecommendation);
document.querySelector("#import-button").addEventListener("click", importMockApps);
document.querySelector("#reset-button").addEventListener("click", resetState);
els.exportDbButton.addEventListener("click", exportDatabase);
document.querySelectorAll(".mode-tabs button").forEach((button) => {
  ["click", "pointerup", "keydown"].forEach((eventName) => {
    button.addEventListener(eventName, (event) => {
      if (eventName === "keydown" && !["Enter", " "].includes(event.key)) return;
      showMode(button.dataset.mode);
    });
  });
});
els.motivation.addEventListener("input", () => {
  els.motivationOutput.textContent = els.motivation.value;
  renderSpots();
});
els.explorationDepth.addEventListener("input", () => {
  renderEncounter();
  renderInterests();
  renderStats();
});
els.mapSearchButton.addEventListener("click", () => {
  searchThemeOnMap(els.mapSearch.value);
});
els.mapSearch.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  searchThemeOnMap(els.mapSearch.value);
});

render();
initDatabase();
