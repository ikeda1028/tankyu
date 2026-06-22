const STORAGE_KEY = "wakuwaku-quest-state-v3";
const PUBLIC_API_BASE = location.hostname.endsWith("vercel.app")
  ? location.origin
  : "https://tankyu-five.vercel.app";

const depthLabels = ["事実まで", "背景まで", "構造まで", "越境まで", "実装まで"];
const DEFAULT_ADMIN_EMAILS = ["ikeda@manabinomichi.com"];

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
    heroRole: "ヒーロー",
    avatar: {
      symbol: "星",
      color: "#2f8f63",
      aura: "探究",
      prompt: "",
      imageDataUrl: "",
      generatedAt: "",
      generationStage: "simple",
    },
    partyRoles: ["問いを深める人", "現地を記録する人", "社会とつなぐ人"],
  },
  childProfile: {
    id: "",
    nickname: "",
    age: 6,
    region: "",
    favoriteThings: "",
    favoriteColor: "#2f8f63",
    guardianId: "",
    permissions: {
      photoPost: false,
      locationSave: false,
      publicShare: false,
      aiSuggestions: false,
      driveSync: false,
    },
    onboardingComplete: false,
    onboardingCompletedAt: "",
    updatedAt: "",
  },
  guardian: {
    id: "",
    passcode: "0000",
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
  visitedCharacters: [],
  reflections: [],
  feedbacks: [],
  fieldPosts: [],
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
  firebase: {
    configJson: "",
    lastSyncAt: "",
    lastStatus: "未設定",
  },
  maps: {
    apiKey: "",
    lastStatus: "未設定",
  },
  ui: {
    mode: "quest",
    eventsPanel: "compact",
    encounterPanel: "open",
    fieldPostPanel: "open",
    themePanel: "compact",
    memberEditing: false,
    kidsMapActive: false,
    editingEventId: "",
    aiCandidateSource: null,
  },
  selectedReflection: "",
  streak: 0,
  lastActiveDate: "",
};

const els = {
  questScore: document.querySelector("#quest-score"),
  heroHpMax: document.querySelector("#hero-hp-max"),
  dimensionValue: document.querySelector("#dimension-value"),
  heroStage: document.querySelector("#hero-stage"),
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
  kidsEncounterCard: document.querySelector("#kids-encounter-card"),
  kidsEncounterTitle: document.querySelector("#kids-encounter-title"),
  kidsEncounterFocus: document.querySelector("#kids-encounter-focus"),
  kidsTaskList: document.querySelector("#kids-task-list"),
  kidsTakePhotoButton: document.querySelector("#kids-take-photo-button"),
  kidsStartAdventureButton: document.querySelector("#kids-start-adventure-button"),
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
  heroStreamTrack: document.querySelector("#hero-stream-track"),
  heroStreamCount: document.querySelector("#hero-stream-count"),
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
  characterCard: document.querySelector("#character-card"),
  reflectionInput: document.querySelector("#reflection-input"),
  hypothesisInput: document.querySelector("#hypothesis-input"),
  fieldPostPanel: document.querySelector(".field-post-panel"),
  fieldPostCount: document.querySelector("#field-post-count"),
  compactFieldPostButton: document.querySelector("#compact-field-post-button"),
  collapseFieldPostButton: document.querySelector("#collapse-field-post-button"),
  fieldPostTarget: document.querySelector("#field-post-target"),
  fieldPostPhoto: document.querySelector("#field-post-photo"),
  fieldPhotoPreview: document.querySelector("#field-photo-preview"),
  fieldPostText: document.querySelector("#field-post-text"),
  kidsPostTools: document.querySelector("#kids-post-tools"),
  kidsSelectedStamp: document.querySelector("#kids-selected-stamp"),
  usePostLocationButton: document.querySelector("#use-post-location-button"),
  saveFieldPostButton: document.querySelector("#save-field-post-button"),
  fieldPostStatus: document.querySelector("#field-post-status"),
  fieldPostList: document.querySelector("#field-post-list"),
  questViews: document.querySelectorAll(".quest-view"),
  heroGrowthView: document.querySelector(".hero-growth-view"),
  settingsView: document.querySelector(".settings-view"),
  kidsView: document.querySelector(".kids-view"),
  guardianView: document.querySelector(".guardian-view"),
  kidsAvatar: document.querySelector("#kids-avatar"),
  kidsQuestPower: document.querySelector("#kids-quest-power"),
  kidsQuestMeter: document.querySelector("#kids-quest-meter"),
  kidsQuestNote: document.querySelector("#kids-quest-note"),
  kidsJoyPower: document.querySelector("#kids-joy-power"),
  kidsJoyMeter: document.querySelector("#kids-joy-meter"),
  kidsJoyNote: document.querySelector("#kids-joy-note"),
  kidsDrivePower: document.querySelector("#kids-drive-power"),
  kidsDriveMeter: document.querySelector("#kids-drive-meter"),
  kidsDriveNote: document.querySelector("#kids-drive-note"),
  kidsThanksPower: document.querySelector("#kids-thanks-power"),
  kidsThanksMeter: document.querySelector("#kids-thanks-meter"),
  kidsThanksNote: document.querySelector("#kids-thanks-note"),
  kidsOnboardingForm: document.querySelector("#kids-onboarding-form"),
  kidsOnboardingName: document.querySelector("#kids-onboarding-name"),
  kidsOnboardingFavorites: document.querySelector("#kids-onboarding-favorites"),
  kidsOnboardingSymbol: document.querySelector("#kids-onboarding-symbol"),
  kidsOnboardingColor: document.querySelector("#kids-onboarding-color"),
  kidsOnboardingAura: document.querySelector("#kids-onboarding-aura"),
  kidsOnboardingStatus: document.querySelector("#kids-onboarding-status"),
  kidsActionGrid: document.querySelector(".kids-action-grid"),
  kidsStatusRow: document.querySelector(".kids-status-row"),
  kidsHomePanel: document.querySelector("#kids-home-panel"),
  kidsTodayTitle: document.querySelector("#kids-today-title"),
  kidsTodayText: document.querySelector("#kids-today-text"),
  kidsRecentTitle: document.querySelector("#kids-recent-title"),
  kidsRecentText: document.querySelector("#kids-recent-text"),
  kidsNextStep: document.querySelector("#kids-next-step"),
  kidsNextText: document.querySelector("#kids-next-text"),
  kidsRecordPanel: document.querySelector("#kids-record-panel"),
  kidsRecordCount: document.querySelector("#kids-record-count"),
  kidsRecordText: document.querySelector("#kids-record-text"),
  kidsRecordSelected: document.querySelector("#kids-record-selected"),
  saveKidsRecordButton: document.querySelector("#save-kids-record-button"),
  kidsRecordStatus: document.querySelector("#kids-record-status"),
  kidsRecordList: document.querySelector("#kids-record-list"),
  guardianStatus: document.querySelector("#guardian-status"),
  guardianChildName: document.querySelector("#guardian-child-name"),
  guardianChildMeta: document.querySelector("#guardian-child-meta"),
  guardianPendingCount: document.querySelector("#guardian-pending-count"),
  guardianActivityCount: document.querySelector("#guardian-activity-count"),
  guardianDashboardStatus: document.querySelector("#guardian-dashboard-status"),
  guardianQuestValue: document.querySelector("#guardian-quest-value"),
  guardianQuestNote: document.querySelector("#guardian-quest-note"),
  guardianJoyValue: document.querySelector("#guardian-joy-value"),
  guardianJoyNote: document.querySelector("#guardian-joy-note"),
  guardianPostSummary: document.querySelector("#guardian-post-summary"),
  guardianPostNote: document.querySelector("#guardian-post-note"),
  guardianRecentActivity: document.querySelector("#guardian-recent-activity"),
  guardianSafetyList: document.querySelector("#guardian-safety-list"),
  approvalListStatus: document.querySelector("#approval-list-status"),
  guardianApprovalList: document.querySelector("#guardian-approval-list"),
  childProfileForm: document.querySelector("#child-profile-form"),
  childProfileStatus: document.querySelector("#child-profile-status"),
  childNickname: document.querySelector("#child-nickname"),
  childAge: document.querySelector("#child-age"),
  childRegion: document.querySelector("#child-region"),
  childFavoriteColor: document.querySelector("#child-favorite-color"),
  childFavoriteThings: document.querySelector("#child-favorite-things"),
  childGuardianId: document.querySelector("#child-guardian-id"),
  permissionPhotoPost: document.querySelector("#permission-photo-post"),
  permissionLocationSave: document.querySelector("#permission-location-save"),
  permissionPublicShare: document.querySelector("#permission-public-share"),
  permissionAiSuggestions: document.querySelector("#permission-ai-suggestions"),
  permissionDriveSync: document.querySelector("#permission-drive-sync"),
  heroGrowthTitle: document.querySelector("#hero-growth-title"),
  heroGrowthDimension: document.querySelector("#hero-growth-dimension"),
  heroLargeAvatar: document.querySelector("#hero-large-avatar"),
  heroGrowthHp: document.querySelector("#hero-growth-hp"),
  heroGrowthStage: document.querySelector("#hero-growth-stage"),
  heroGrowthParty: document.querySelector("#hero-growth-party"),
  heroEvolutionTrack: document.querySelector("#hero-evolution-track"),
  heroEquipmentCount: document.querySelector("#hero-equipment-count"),
  heroEquipmentGrid: document.querySelector("#hero-equipment-grid"),
  heroNextEvolution: document.querySelector("#hero-next-evolution"),
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
  firebaseConfig: document.querySelector("#firebase-config"),
  saveFirebaseConfigButton: document.querySelector("#save-firebase-config-button"),
  syncFirebaseButton: document.querySelector("#sync-firebase-button"),
  loadFirebaseButton: document.querySelector("#load-firebase-button"),
  firebaseStatus: document.querySelector("#firebase-status"),
  mapsApiKey: document.querySelector("#maps-api-key"),
  saveMapsKeyButton: document.querySelector("#save-maps-key-button"),
  loadMapsButton: document.querySelector("#load-maps-button"),
  mapsStatus: document.querySelector("#maps-status"),
  mapCanvas: document.querySelector(".map-canvas"),
  googleMapCanvas: document.querySelector("#google-map-canvas"),
  kidsMapGuide: document.querySelector("#kids-map-guide"),
  kidsMapTitle: document.querySelector("#kids-map-title"),
  kidsMapText: document.querySelector("#kids-map-text"),
  kidsMapBadges: document.querySelector("#kids-map-badges"),
  kidsMapList: document.querySelector("#kids-map-list"),
  centerSearchButton: document.querySelector("#center-search-button"),
  currentLocationButton: document.querySelector("#current-location-button"),
  themeEvaluationPanel: document.querySelector("#theme-evaluation-panel"),
  compactThemeButton: document.querySelector("#compact-theme-button"),
  collapseThemeButton: document.querySelector("#collapse-theme-button"),
  themeEvaluationTitle: document.querySelector("#theme-evaluation-title"),
  themeEvaluationScore: document.querySelector("#theme-evaluation-score"),
  themeOverview: document.querySelector("#theme-overview"),
  themeKeywords: document.querySelector("#theme-keywords"),
  themePlaces: document.querySelector("#theme-places"),
  themeEvaluationBases: document.querySelector("#theme-evaluation-bases"),
  authScreen: document.querySelector("#auth-screen"),
  loginForm: document.querySelector("#login-form"),
  memberForm: document.querySelector("#member-form"),
  memberFormTitle: document.querySelector("#member-form-title"),
  memberFormIntro: document.querySelector("#member-form-intro"),
  memberSubmitButton: document.querySelector("#member-submit-button"),
  loginEmail: document.querySelector("#login-email"),
  loginPassword: document.querySelector("#login-password"),
  demoLoginButton: document.querySelector("#demo-login-button"),
  backLoginButton: document.querySelector("#back-login-button"),
  memberName: document.querySelector("#member-name"),
  memberSchool: document.querySelector("#member-school"),
  memberGrade: document.querySelector("#member-grade"),
  memberRegion: document.querySelector("#member-region"),
  memberInterest: document.querySelector("#member-interest"),
  memberHeroRole: document.querySelector("#member-hero-role"),
  memberAvatarPreview: document.querySelector("#member-avatar-preview"),
  memberAvatarSymbol: document.querySelector("#member-avatar-symbol"),
  memberAvatarColor: document.querySelector("#member-avatar-color"),
  memberAvatarAura: document.querySelector("#member-avatar-aura"),
  memberAvatarPrompt: document.querySelector("#member-avatar-prompt"),
  memberAvatarPhoto: document.querySelector("#member-avatar-photo"),
  memberAvatarPhotoPreview: document.querySelector("#member-avatar-photo-preview"),
  generateMemberAvatarButton: document.querySelector("#generate-member-avatar-button"),
  memberAvatarStatus: document.querySelector("#member-avatar-status"),
  memberPartyRoles: document.querySelector("#member-party-roles"),
  memberPartyRoleInput: document.querySelector("#member-party-role-input"),
  addPartyRoleButton: document.querySelector("#add-party-role-button"),
  memberFormStatus: document.querySelector("#member-form-status"),
  memberSummaryName: document.querySelector("#member-summary-name"),
  memberSummaryMeta: document.querySelector("#member-summary-meta"),
  memberAvatarSummary: document.querySelector("#member-avatar-summary"),
  memberPartySummary: document.querySelector("#member-party-summary"),
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
  eventIndexStatus: document.querySelector("#event-index-status"),
  eventColor: document.querySelector("#event-color"),
  eventLocation: document.querySelector("#event-location"),
  eventType: document.querySelector("#event-type"),
  eventStartDate: document.querySelector("#event-start-date"),
  eventEndDate: document.querySelector("#event-end-date"),
  eventCharacterEnabled: document.querySelector("#event-character-enabled"),
  eventCharacterName: document.querySelector("#event-character-name"),
  eventCharacterRole: document.querySelector("#event-character-role"),
  eventCharacterMessage: document.querySelector("#event-character-message"),
  suggestCharacterButton: document.querySelector("#suggest-character-button"),
  characterSuggestionStatus: document.querySelector("#character-suggestion-status"),
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
  eventSubmitButton: document.querySelector("#event-submit-button"),
  cancelEventEditButton: document.querySelector("#cancel-event-edit-button"),
  sampleEventButton: document.querySelector("#sample-event-button"),
  searchAiEventsButton: document.querySelector("#search-ai-events-button"),
  registerAllAiEventsButton: document.querySelector("#register-all-ai-events-button"),
  aiSuggestionCount: document.querySelector("#ai-suggestion-count"),
  aiSearchWord: document.querySelector("#ai-search-word"),
  aiThemeFocus: document.querySelector("#ai-theme-focus"),
  aiRegionFocus: document.querySelector("#ai-region-focus"),
  aiEventTypeFocus: document.querySelector("#ai-event-type-focus"),
  aiLocationPrecision: document.querySelector("#ai-location-precision"),
  aiDiversityFocus: document.querySelector("#ai-diversity-focus"),
  aiExtraPrompt: document.querySelector("#ai-extra-prompt"),
  aiSuggestionStatus: document.querySelector("#ai-suggestion-status"),
  aiSuggestionList: document.querySelector("#ai-suggestion-list"),
  eventImagePrompt: document.querySelector("#event-image-prompt"),
  generateEventImageButton: document.querySelector("#generate-event-image-button"),
  generatedImageStatus: document.querySelector("#generated-image-status"),
  generatedImagePreview: document.querySelector("#generated-image-preview"),
  registeredEventCount: document.querySelector("#registered-event-count"),
  registeredEventList: document.querySelector("#registered-event-list"),
};

const state = loadState();
state.driveSync = { ...defaultState.driveSync, ...(state.driveSync || {}) };
state.firebase = { ...defaultState.firebase, ...(state.firebase || {}) };
state.maps = { ...defaultState.maps, ...(state.maps || {}) };
state.auth = { ...defaultState.auth, ...(state.auth || {}) };
state.member = { ...defaultState.member, ...(state.member || {}) };
state.childProfile = normalizeChildProfile(state.childProfile);
state.guardian = { ...defaultState.guardian, ...(state.guardian || {}) };
state.member.avatar = normalizeAvatar(state.member.avatar);
state.member.partyRoles = normalizePartyRoles(state.member.partyRoles);
state.ui = { ...defaultState.ui, ...(state.ui || {}) };
state.joyActions = Array.isArray(state.joyActions) ? state.joyActions : [];
state.visitedCharacters = Array.isArray(state.visitedCharacters) ? state.visitedCharacters : [];
state.fieldPosts = Array.isArray(state.fieldPosts) ? state.fieldPosts : [];
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
let mapsAutoLoadKey = "";
let eventLocationMap = null;
let eventLocationMarker = null;
let eventIndexEvaluateTimer = null;
let eventIndexEvaluateToken = 0;
let lastEventIndexEvaluationKey = "";
let pendingAvatarReferenceImage = null;
let firebaseAutoSyncTimer = null;
let firebaseAutoSyncRunning = false;
let firebaseAutoSyncQueued = false;
let firebaseAutoSyncReason = "";
let pendingFieldPostImage = null;
let pendingFieldPostLocation = null;
let pendingKidsStamp = "";
let pendingKidsRecordStamp = "";

function normalizeChildProfile(profile = {}) {
  profile = profile || {};
  const fallback = defaultState.childProfile;
  const permissions = {
    ...fallback.permissions,
    ...(profile.permissions || {}),
  };
  return {
    ...fallback,
    ...profile,
    age: Math.max(4, Math.min(10, Number(profile.age || fallback.age))),
    permissions,
  };
}

function normalizePartyRoles(roles) {
  const fallback = defaultState.member.partyRoles;
  const normalized = (Array.isArray(roles) ? roles : String(roles || "").split(/[、,\n]/))
    .map((role) => String(role || "").trim())
    .filter(Boolean);
  return [...new Set(normalized.length ? normalized : fallback)].slice(0, 8);
}

function normalizeAvatar(avatar) {
  const fallback = defaultState.member.avatar;
  const color = String(avatar?.color || fallback.color).trim();
  const imageDataUrl = String(avatar?.imageDataUrl || "").trim();
  return {
    symbol: String(avatar?.symbol || fallback.symbol).trim().slice(0, 2) || fallback.symbol,
    color: /^#[0-9a-f]{6}$/i.test(color) ? color : fallback.color,
    aura: String(avatar?.aura || fallback.aura).trim().slice(0, 16) || fallback.aura,
    prompt: String(avatar?.prompt || "").trim().slice(0, 220),
    imageDataUrl: imageDataUrl.startsWith("data:image/") ? imageDataUrl : "",
    downloadUrl: normalizeExternalUrl(avatar?.downloadUrl),
    storagePath: String(avatar?.storagePath || "").trim(),
    generatedAt: String(avatar?.generatedAt || "").trim(),
    generationStage: String(avatar?.generationStage || fallback.generationStage || "simple").trim(),
  };
}

function getAvatarGradient(color) {
  return `radial-gradient(circle at 30% 20%, rgba(255,255,255,.7), transparent 28%), linear-gradient(140deg, ${color}, #17211b)`;
}

function getPartyPower() {
  return normalizePartyRoles(state.member.partyRoles).length;
}

function getHeroDimension() {
  return Math.min(5, Math.max(1, Math.ceil((getPartyPower() + 1) / 2)));
}

function getHeroHpMax() {
  return 100 + (getHeroDimension() - 1) * 25 + getPartyPower() * 5;
}

function getHeroStageLabel() {
  const dimension = getHeroDimension();
  const labels = {
    1: "ソロ探究",
    2: "役割分担",
    3: "チーム探究",
    4: "社会接続",
    5: "越境パーティー",
  };
  return labels[dimension] || "越境パーティー";
}

function getHeroEquipment() {
  const partyPower = getPartyPower();
  const bestDepth = getBestDepth();
  return [
    {
      name: "問いのコンパス",
      slot: "手",
      unlocked: state.sparks.length > 0 || Boolean(state.member.initialInterest),
      detail: "ワクワクを記録すると装備",
    },
    {
      name: "観察レンズ",
      slot: "目",
      unlocked: state.fieldPosts.length > 0,
      detail: "現場投稿をすると装備",
    },
    {
      name: "記録ノート",
      slot: "道具",
      unlocked: state.reflections.length > 0,
      detail: "探究を記録すると装備",
    },
    {
      name: "共創バッジ",
      slot: "胸",
      unlocked: partyPower >= 3,
      detail: "パーティー役割3つで装備",
    },
    {
      name: "越境マント",
      slot: "背中",
      unlocked: bestDepth >= 4,
      detail: "越境まで探究すると装備",
    },
    {
      name: "実装コア",
      slot: "中心",
      unlocked: bestDepth >= 5 || state.quest >= 160,
      detail: "実装まで到達、またはHP160で装備",
    },
  ];
}

function getNextEvolutionTasks() {
  const tasks = [];
  if (getPartyPower() < 3) tasks.push("パーティー役割を3つ以上にする");
  if (!state.fieldPosts.length) tasks.push("現場投稿を1件行い、観察レンズを解放する");
  if (!state.reflections.length) tasks.push("探究を記録して、記録ノートを解放する");
  if (getBestDepth() < 4) tasks.push("探究距離を越境まで伸ばす");
  if (state.quest < getHeroHpMax()) tasks.push("探究ポイントに参加してHPを上げる");
  return tasks.length ? tasks.slice(0, 4) : ["次の探究ポイントで実装まで進み、最終装備を強化する"];
}

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
      url: "",
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
    url: normalizeExternalUrl(place?.url),
    lat: Number.isFinite(lat) && lat >= -90 && lat <= 90 ? lat : null,
    lng: Number.isFinite(lng) && lng >= -180 && lng <= 180 ? lng : null,
  };
}

function hasThemePlaceLatLng(place) {
  return Number.isFinite(Number(place?.lat)) && Number.isFinite(Number(place?.lng));
}

function normalizeExternalUrl(value) {
  const url = String(value || "").trim();
  return /^https?:\/\//i.test(url) ? url : "";
}

function getGoogleMapsSearchUrl(query) {
  const trimmed = String(query || "").trim();
  return trimmed ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}` : "";
}

function getThemePlaceUrl(place) {
  const normalizedPlace = normalizeThemePlace(place);
  if (normalizedPlace.url) return normalizedPlace.url;
  if (hasThemePlaceLatLng(normalizedPlace)) {
    return getGoogleMapsSearchUrl(`${normalizedPlace.lat},${normalizedPlace.lng}`);
  }
  return getGoogleMapsSearchUrl(normalizedPlace.searchHint || normalizedPlace.name);
}

function getLocalThemePlaceUrl(place) {
  if (place?.lat && place?.lng) return getGoogleMapsSearchUrl(`${place.lat},${place.lng}`);
  return getGoogleMapsSearchUrl(place?.location || place?.title || "");
}

function openExternalUrl(url) {
  const safeUrl = normalizeExternalUrl(url);
  if (!safeUrl) return false;
  const opened = window.open(safeUrl, "_blank", "noopener,noreferrer");
  if (opened) opened.opener = null;
  return true;
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

function normalizeCharacter(character) {
  if (!character || !character.name) return null;
  return {
    name: String(character.name || "").trim().slice(0, 40),
    role: String(character.role || "現地案内人").trim().slice(0, 40),
    message: String(character.message || "現地で観察したことを手がかりに、次の問いを見つけよう。").trim().slice(0, 180),
    localOnly: character.localOnly !== false,
  };
}

function getEventCharacter(encounter) {
  return normalizeCharacter(encounter?.character);
}

function hasVisitedCharacter(eventId) {
  return state.visitedCharacters.some((item) => item.eventId === eventId);
}

function markCharacterVisited(encounter) {
  const character = getEventCharacter(encounter);
  if (!character || hasVisitedCharacter(encounter.id)) return false;
  state.visitedCharacters.unshift({
    eventId: encounter.id,
    characterName: character.name,
    at: new Date().toISOString(),
  });
  state.visitedCharacters = state.visitedCharacters.slice(0, 60);
  return true;
}

function getDistanceMeters(a, b) {
  if (!hasValidLatLng(a) || !hasValidLatLng(b)) return Infinity;
  const radius = 6371000;
  const toRad = (value) => (Number(value) * Math.PI) / 180;
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const deltaLat = toRad(Number(b.lat) - Number(a.lat));
  const deltaLng = toRad(Number(b.lng) - Number(a.lng));
  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function requestCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("このブラウザでは現在地を取得できません"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    });
  });
}

async function unlockLocalCharacter(encounter) {
  const character = getEventCharacter(encounter);
  if (!character || !character.localOnly || hasVisitedCharacter(encounter.id)) return true;
  if (!hasValidLatLng(encounter.position)) {
    els.matchReason.textContent = "このイベントは位置情報が未設定のため、現地キャラクターを解放できません。";
    return false;
  }

  try {
    els.matchReason.textContent = "現地キャラクターのため現在地を確認中...";
    const position = await requestCurrentPosition();
    const current = { lat: position.coords.latitude, lng: position.coords.longitude };
    const distance = getDistanceMeters(current, encounter.position);
    if (distance > 300) {
      els.matchReason.textContent = `現地まであと約${Math.round(distance)}m。300m以内でキャラクターに会えます。`;
      return false;
    }
    markCharacterVisited(encounter);
    addActivity(`${character.name}に現地で出会った`);
    return true;
  } catch (error) {
    els.matchReason.textContent = "現在地を取得できませんでした。位置情報を許可して現地で再度試してください。";
    console.error(error);
    return false;
  }
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

function hasPublicDriveUrl() {
  return Boolean(getPublicConfig().driveApiUrl);
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
  const publicEnabled = hasPublicDriveUrl();
  els.driveApiUrl.disabled = publicEnabled;
  els.saveDriveUrlButton.disabled = publicEnabled;
  els.driveApiUrl.value = publicEnabled ? "" : getDriveUrl();
  els.driveApiUrl.placeholder = publicEnabled ? "公開設定から読み込み中" : "Apps ScriptのWebアプリURL";
  const status = state.driveSync?.lastStatus || (getDriveUrl() ? (publicEnabled ? "公開設定のDrive APIを使用中" : "URL保存済み") : "未設定");
  const lastSync = state.driveSync?.lastSyncAt ? ` / 最終 ${formatTime(new Date(state.driveSync.lastSyncAt))}` : "";
  els.driveSyncStatus.textContent = `${status}${lastSync}`;
}

function getFirebasePublicConfig() {
  return getPublicConfig().firebase || {};
}

function parseFirebaseConfigJson(value) {
  if (!value.trim()) return {};
  const parsed = JSON.parse(value);
  return typeof parsed === "object" && parsed ? parsed : {};
}

function getFirebaseConfig() {
  const publicConfig = getFirebasePublicConfig();
  if (window.WakuwakuFirebase?.hasFirebaseConfig(publicConfig)) return publicConfig;
  try {
    return parseFirebaseConfigJson(state.firebase?.configJson || "");
  } catch {
    return {};
  }
}

function hasFirebaseConfig() {
  return Boolean(window.WakuwakuFirebase?.hasFirebaseConfig(getFirebaseConfig()));
}

function setFirebaseStatus(message, isError = false) {
  state.firebase = {
    ...(state.firebase || {}),
    lastStatus: message,
  };
  if (els.firebaseStatus) {
    els.firebaseStatus.textContent = message;
    els.firebaseStatus.classList.toggle("error", isError);
  }
}

function renderFirebaseSettings() {
  if (!els.firebaseConfig || !els.firebaseStatus) return;
  const publicEnabled = window.WakuwakuFirebase?.hasFirebaseConfig(getFirebasePublicConfig());
  els.firebaseConfig.disabled = publicEnabled;
  els.saveFirebaseConfigButton.disabled = publicEnabled;
  els.firebaseConfig.value = publicEnabled ? "" : state.firebase?.configJson || "";
  els.firebaseConfig.placeholder = publicEnabled ? "公開設定から読み込み中" : "{\"apiKey\":\"...\",\"authDomain\":\"...\",\"projectId\":\"...\",\"appId\":\"...\"}";
  const status = state.firebase?.lastStatus || (hasFirebaseConfig() ? "Firebase設定済み" : "未設定");
  const lastSync = state.firebase?.lastSyncAt ? ` / 最終 ${formatTime(new Date(state.firebase.lastSyncAt))}` : "";
  els.firebaseStatus.textContent = `${status}${lastSync}`;
  els.firebaseStatus.classList.remove("error");
}

function saveFirebaseConfig() {
  try {
    const configJson = els.firebaseConfig.value.trim();
    const config = parseFirebaseConfigJson(configJson);
    if (!window.WakuwakuFirebase?.hasFirebaseConfig(config)) {
      setFirebaseStatus("apiKey / projectId / appIdを含む設定を入れてください", true);
      return;
    }
    state.firebase = {
      ...(state.firebase || {}),
      configJson: JSON.stringify(config, null, 2),
      lastStatus: "Firebase設定を保存しました",
    };
    saveState();
    renderFirebaseSettings();
  } catch {
    setFirebaseStatus("Firebase設定JSONを確認してください", true);
  }
}

function createFirebaseSnapshot() {
  const snapshot = JSON.parse(JSON.stringify(state));
  snapshot.stats = {
    quest: state.quest,
    hp: state.quest,
    joy: state.joy,
    drive: state.drive,
    thanks: state.thanks,
    streak: state.streak,
    dimension: getHeroDimension(),
    hpMax: getHeroHpMax(),
  };
  snapshot.maps = { ...(snapshot.maps || {}), apiKey: "", lastStatus: snapshot.maps?.lastStatus || "" };
  snapshot.driveSync = { ...(snapshot.driveSync || {}), apiUrl: "", lastStatus: snapshot.driveSync?.lastStatus || "" };
  snapshot.firebase = { ...defaultState.firebase, lastStatus: "cloud snapshot" };
  return snapshot;
}

function coerceFirebaseNumber(...values) {
  for (const value of values) {
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) return Math.round(numberValue);
  }
  return null;
}

function applyFirebaseNumericFields(targetState, firebaseResult) {
  const sources = [
    firebaseResult?.snapshot?.stats,
    firebaseResult?.stats,
    firebaseResult?.snapshot,
    firebaseResult,
  ].filter(Boolean);
  const fieldMap = {
    quest: ["quest", "hp", "heroHp", "hero_hp", "探究値", "HP"],
    joy: ["joy", "wakuwaku", "ワクワク"],
    drive: ["drive", "explorationDistance", "exploration_distance", "探究力", "探究距離"],
    thanks: ["thanks", "reflectionPower", "reflection_power", "振り返り"],
    streak: ["streak", "連続日数"],
  };
  const applied = [];
  Object.entries(fieldMap).forEach(([stateKey, aliases]) => {
    const values = sources.flatMap((source) => aliases.map((alias) => source?.[alias]));
    const numericValue = coerceFirebaseNumber(...values);
    if (numericValue === null) return;
    targetState[stateKey] = stateKey === "quest" ? Math.max(0, Math.min(999, numericValue)) : clamp(numericValue);
    applied.push(stateKey);
  });
  return applied;
}

async function syncFirebase(options = {}) {
  const automatic = Boolean(options?.automatic);
  if (!window.WakuwakuFirebase) {
    if (!automatic) setFirebaseStatus("Firebase同期機能を読み込めません", true);
    return;
  }
  const config = getFirebaseConfig();
  if (!window.WakuwakuFirebase.hasFirebaseConfig(config)) {
    if (!automatic) setFirebaseStatus("Firebase設定を入力してください", true);
    return;
  }

  try {
    setFirebaseStatus(automatic ? "Firebase自動同期中..." : "Firebase同期中...");
    const result = await window.WakuwakuFirebase.saveSnapshot(config, state, createFirebaseSnapshot());
    if (Array.isArray(result.snapshot?.fieldPosts)) {
      state.fieldPosts = result.snapshot.fieldPosts;
    }
    if (result.snapshot?.member?.avatar) {
      state.member.avatar = normalizeAvatar(result.snapshot.member.avatar);
    }
    state.firebase.lastSyncAt = new Date().toISOString();
    setFirebaseStatus(`${automatic ? "自動同期完了" : "Firestore保存完了"}: ${result.userId}`);
    saveState();
    renderFirebaseSettings();
  } catch (error) {
    setFirebaseStatus(`${automatic ? "Firebase自動同期" : "Firebase同期"}エラー。設定とFirestoreルールを確認してください`, true);
    console.error(error);
  }
}

function queueFirebaseSync(reason = "更新") {
  if (!hasFirebaseConfig()) return;
  firebaseAutoSyncReason = reason;
  if (firebaseAutoSyncTimer) {
    window.clearTimeout(firebaseAutoSyncTimer);
  }
  firebaseAutoSyncTimer = window.setTimeout(runQueuedFirebaseSync, 900);
}

async function runQueuedFirebaseSync() {
  if (firebaseAutoSyncRunning) {
    firebaseAutoSyncQueued = true;
    return;
  }
  firebaseAutoSyncTimer = null;
  firebaseAutoSyncRunning = true;
  firebaseAutoSyncQueued = false;
  const reason = firebaseAutoSyncReason || "更新";
  firebaseAutoSyncReason = "";
  try {
    await syncFirebase({ automatic: true, reason });
  } finally {
    firebaseAutoSyncRunning = false;
    if (firebaseAutoSyncQueued || firebaseAutoSyncReason) {
      firebaseAutoSyncQueued = false;
      queueFirebaseSync(firebaseAutoSyncReason || reason);
    }
  }
}

function hasLocalAvatarImage() {
  const avatar = normalizeAvatar(state.member?.avatar);
  return Boolean(avatar.imageDataUrl || avatar.downloadUrl);
}

function shouldAutoLoadFirebaseSnapshot() {
  return hasFirebaseConfig() && !hasLocalAvatarImage() && !state.fieldPosts.length && !state.reflections.length;
}

async function loadFirebaseSnapshot(options = {}) {
  if (!window.WakuwakuFirebase) {
    if (!options.silent) setFirebaseStatus("Firebase同期機能を読み込めません", true);
    return;
  }
  const config = getFirebaseConfig();
  if (!window.WakuwakuFirebase.hasFirebaseConfig(config)) {
    if (!options.silent) setFirebaseStatus("Firebase設定を入力してください", true);
    return;
  }

  try {
    setFirebaseStatus(options.silent ? "Firebase自動読込中..." : "Firebase読込中...");
    const savedConfig = state.firebase;
    const result = await window.WakuwakuFirebase.loadSnapshot(config, state);
    if (!result?.snapshot && !result?.stats) {
      if (!options.silent) setFirebaseStatus("Firebaseに保存データまたは数値がありません", true);
      return;
    }
    const loadedSnapshot = result.snapshot ? { ...defaultState, ...result.snapshot } : { ...state };
    const appliedNumericFields = applyFirebaseNumericFields(loadedSnapshot, result);
    Object.assign(state, loadedSnapshot);
    state.firebase = {
      ...defaultState.firebase,
      ...savedConfig,
      lastSyncAt: new Date().toISOString(),
      lastStatus: appliedNumericFields.length
        ? `Firestore読込完了: ${result.userId} / 数値 ${appliedNumericFields.length}件`
        : `Firestore読込完了: ${result.userId}`,
    };
    state.driveSync = { ...defaultState.driveSync, ...(state.driveSync || {}) };
    state.maps = { ...defaultState.maps, ...(state.maps || {}) };
    state.auth = { ...defaultState.auth, ...(state.auth || {}) };
    state.member = { ...defaultState.member, ...(state.member || {}) };
    state.childProfile = normalizeChildProfile(state.childProfile);
    state.guardian = { ...defaultState.guardian, ...(state.guardian || {}) };
    state.member.avatar = normalizeAvatar(state.member.avatar);
    state.member.partyRoles = normalizePartyRoles(state.member.partyRoles);
    state.ui = { ...defaultState.ui, ...(state.ui || {}) };
    state.fieldPosts = Array.isArray(state.fieldPosts) ? state.fieldPosts : [];
    dedupeCustomEvents();
    saveState();
    render();
  } catch (error) {
    setFirebaseStatus("Firebase読込エラー。設定とFirestoreルールを確認してください", true);
    console.error(error);
  }
}

function getMapsKey() {
  return (getPublicConfig().googleMapsApiKey || state.maps?.apiKey || "").trim();
}

function getPublicConfig() {
  return globalThis.WAKUWAKU_CONFIG || window.WAKUWAKU_CONFIG || {};
}

function getAdminEmails() {
  const configured = getPublicConfig().adminEmails;
  const list = Array.isArray(configured) ? configured : [];
  return [...DEFAULT_ADMIN_EMAILS, ...list].map((email) => String(email || "").trim().toLowerCase()).filter(Boolean);
}

function isAdminUser() {
  const email = String(state.auth?.email || "").trim().toLowerCase();
  return Boolean(email && getAdminEmails().includes(email));
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
    lastStatus: apiKey ? "キー保存済み / 地図を自動読み込み中" : "未設定",
  };
  mapsAutoLoadKey = "";
  saveState();
  renderMapsSettings();
}

function renderMapsSettings() {
  if (!els.mapsApiKey || !els.mapsStatus) return;
  const source = getMapsKeySource();
  const publicKeyEnabled = source === "public";
  const apiKey = getMapsKey();
  els.mapsApiKey.value = publicKeyEnabled ? "" : getMapsKey();
  els.mapsApiKey.placeholder = publicKeyEnabled ? "公開設定から読み込み中" : "ブラウザ内だけに保存";
  els.mapsApiKey.disabled = publicKeyEnabled;
  els.saveMapsKeyButton.disabled = publicKeyEnabled;
  if (isFilePage()) {
    els.mapsStatus.textContent = "file://ではGoogle Map不可 / HTTPで開くを押してください";
  } else if (apiKey) {
    const label = publicKeyEnabled ? "公開設定のキーを使用中" : "ブラウザ保存キーを使用中";
    els.mapsStatus.textContent = googleMap ? "Google Map表示中" : state.maps?.lastStatus || `${label} / 地図を自動読み込み中`;
    if (!googleMap && !googleMapsLoadPromise && mapsAutoLoadKey !== apiKey) {
      mapsAutoLoadKey = apiKey;
      els.mapsStatus.textContent = `${label} / 地図を自動読み込み中`;
      window.setTimeout(initializeGoogleMap, 0);
    }
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
    mapsAutoLoadKey = "";
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

function getGenerateImageApiPath() {
  if (location.protocol === "file:" || location.hostname === "127.0.0.1" || location.hostname === "localhost") {
    return `${PUBLIC_API_BASE}/api/generate-image`;
  }
  return "/api/generate-image";
}

function getSuggestCharacterApiPath() {
  if (location.protocol === "file:" || location.hostname === "127.0.0.1" || location.hostname === "localhost") {
    return `${PUBLIC_API_BASE}/api/suggest-character`;
  }
  return "/api/suggest-character";
}

function getEvaluateIndexApiPath() {
  if (location.protocol === "file:" || location.hostname === "127.0.0.1" || location.hostname === "localhost") {
    return `${PUBLIC_API_BASE}/api/evaluate-index`;
  }
  return "/api/evaluate-index";
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
  const hpMax = getHeroHpMax();
  const dimension = getHeroDimension();
  els.questScore.textContent = state.quest;
  if (els.heroHpMax) els.heroHpMax.textContent = `/ ${hpMax}`;
  if (els.dimensionValue) els.dimensionValue.textContent = `${dimension}D`;
  els.scoreDelta.textContent = delta > 0 ? `+${delta}` : "+0";
  els.questMeter.style.width = `${Math.min(100, Math.round((state.quest / hpMax) * 100))}%`;
  els.joy.textContent = state.joy;
  els.drive.textContent = state.drive;
  els.thanks.textContent = state.thanks;
  if (els.heroStage) {
    els.heroStage.innerHTML = `<strong>${escapeHtml(getHeroStageLabel())}</strong>
      <span>パーティー役割 ${getPartyPower()}人 / 次元 ${dimension}D</span>`;
  }
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
      const selected = getSelectedEncounter();
      if (googleMap && hasValidLatLng(selected.position)) {
        focusGoogleMapPoint({ lat: Number(selected.position.lat), lng: Number(selected.position.lng) }, Math.max(googleMap.getZoom(), 10));
      }
    });
  });
}

function getKidsMapCandidates() {
  const child = normalizeChildProfile(state.childProfile);
  const favoriteWords = extractInterests(child.favoriteThings || state.member.initialInterest || state.interests.join("、"));
  const ranked = rankedEncounters();
  const matched = ranked.filter((encounter) =>
    favoriteWords.some((word) =>
      [encounter.title, encounter.impact, encounter.locationName, ...(encounter.tags || []), ...(encounter.keywords || [])].join(" ").includes(word)
    )
  );
  return [...matched, ...ranked.filter((encounter) => !matched.some((item) => item.id === encounter.id))].slice(0, 4);
}

function renderKidsMapGuide() {
  if (!els.kidsMapGuide) return;
  const active = Boolean(state.ui?.kidsMapActive);
  els.kidsMapGuide.classList.toggle("hidden", !active);
  els.mapCanvas?.classList.toggle("kids-map-active", active);
  if (!active) return;
  const selected = getSelectedEncounter();
  const candidates = getKidsMapCandidates();
  if (els.kidsMapTitle) els.kidsMapTitle.textContent = selected?.title || "ぼうけんポイント";
  if (els.kidsMapText) {
    els.kidsMapText.textContent = selected
      ? `${selected.locationName || "この場所"}で、${selected.impact || "ワクワク"}をみつけよう。`
      : "気になる場所をえらんで、みつけたことをのこそう。";
  }
  if (els.kidsMapBadges) {
    els.kidsMapBadges.innerHTML = [
      `${selected?.index || state.quest}パワー`,
      getEventPeriodLabel(selected || {}),
      selected?.character?.name ? "キャラあり" : "みつける",
    ]
      .filter(Boolean)
      .map((label) => `<span>${escapeHtml(label)}</span>`)
      .join("");
  }
  if (els.kidsMapList) {
    els.kidsMapList.innerHTML = candidates
      .map((encounter, index) => {
        const activeClass = encounter.id === state.selected ? " active" : "";
        return `<button class="kids-map-point${activeClass}" type="button" data-id="${escapeHtml(encounter.id)}">
          <span>${index + 1}</span>
          <strong>${escapeHtml(encounter.title)}</strong>
          <small>${escapeHtml(encounter.locationName || encounter.impact || "ぼうけんポイント")}</small>
        </button>`;
      })
      .join("");
    els.kidsMapList.querySelectorAll("[data-id]").forEach((button) => {
      button.addEventListener("click", () => openKidsMapPoint(button.dataset.id));
    });
  }
}

function openKidsMapPoint(eventId) {
  const encounter = getEncounters().find((item) => item.id === eventId);
  if (!encounter) return;
  state.selected = encounter.id;
  state.ui.kidsMapActive = true;
  grantJoy(2, `${encounter.title}をぼうけんマップで見た`, `kids-map:${encounter.id}`);
  saveState();
  render();
  if (googleMap && hasValidLatLng(encounter.position)) {
    focusGoogleMapPoint({ lat: Number(encounter.position.lat), lng: Number(encounter.position.lng) }, Math.max(googleMap.getZoom(), 11));
  }
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

function renderFieldPostPanelState() {
  if (!els.fieldPostPanel) return;
  const mode = state.ui?.fieldPostPanel || "open";
  els.fieldPostPanel.classList.toggle("compact", mode === "compact");
  els.fieldPostPanel.classList.toggle("collapsed", mode === "collapsed");
  if (els.compactFieldPostButton) {
    els.compactFieldPostButton.textContent = mode === "compact" ? "□" : "▣";
    els.compactFieldPostButton.setAttribute(
      "aria-label",
      mode === "compact" ? "現場投稿を通常表示" : "現場投稿を小さく表示"
    );
  }
  if (els.collapseFieldPostButton) {
    els.collapseFieldPostButton.textContent = mode === "collapsed" ? "+" : "−";
    els.collapseFieldPostButton.setAttribute(
      "aria-label",
      mode === "collapsed" ? "現場投稿を開く" : "現場投稿を折りたたむ"
    );
  }
}

function renderThemePanelState() {
  if (!els.themeEvaluationPanel) return;
  const mode = state.ui?.themePanel || "compact";
  els.themeEvaluationPanel.classList.toggle("compact", mode === "compact");
  els.themeEvaluationPanel.classList.toggle("collapsed", mode === "collapsed");
  if (els.compactThemeButton) {
    els.compactThemeButton.textContent = mode === "compact" ? "□" : "▣";
    els.compactThemeButton.setAttribute(
      "aria-label",
      mode === "compact" ? "探究テーマ評価を通常表示" : "探究テーマ評価を小さく表示"
    );
  }
  if (els.collapseThemeButton) {
    els.collapseThemeButton.textContent = mode === "collapsed" ? "+" : "−";
    els.collapseThemeButton.setAttribute(
      "aria-label",
      mode === "collapsed" ? "探究テーマ評価を開く" : "探究テーマ評価を折りたたむ"
    );
  }
}

function renderThemeEvaluation() {
  if (!els.themeEvaluationPanel) return;
  renderThemePanelState();
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
        (place, index) => {
          const placeUrl = getThemePlaceUrl(place);
          return `<button type="button" class="theme-place-note" data-ai-place-index="${index}" data-place-url="${escapeHtml(placeUrl)}" aria-label="${escapeHtml(`${place.name}を地図で開く`)}">
        <strong><span class="theme-place-label">${escapeHtml(aiPlaceLabels[index])}</span>${escapeHtml(place.name)}</strong>
        <span>${escapeHtml(place.type)} / ${escapeHtml(place.reason)}</span>
        <small>${hasThemePlaceLatLng(place) ? `${Number(place.lat).toFixed(4)}, ${Number(place.lng).toFixed(4)}` : escapeHtml(place.searchHint || "位置情報なし")} / クリックで地図を開く</small>
      </button>`;
        }
      ),
      ...places.map(
        (place) => {
          const placeUrl = getLocalThemePlaceUrl(place);
          return `<button type="button" data-id="${place.eventId}" data-place-url="${escapeHtml(placeUrl)}" aria-label="${escapeHtml(`${place.location}を地図で開く`)}">
        <strong>${escapeHtml(place.location)}</strong>
        <span>${escapeHtml(place.title)} / 評価 ${place.score}</span>
        <small>${place.lat && place.lng ? `${place.lat}, ${place.lng}` : "座標未設定"} / クリックで地図を開く</small>
      </button>`;
        }
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
      openExternalUrl(button.dataset.placeUrl);
    });
  });
  if (els.themePlaces) {
    els.themePlaces.querySelectorAll("[data-ai-place-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const place = aiPlaces[Number(button.dataset.aiPlaceIndex)];
        if (!place) return;
        grantJoy(5, `${place.name}の地図リンクを開いた`, `theme-place-link:${query}:${place.name}`);
        if (googleMap && hasThemePlaceLatLng(place)) {
          focusGoogleMapPoint({ lat: Number(place.lat), lng: Number(place.lng) }, Math.max(googleMap.getZoom(), 10));
        }
        openExternalUrl(button.dataset.placeUrl || getThemePlaceUrl(place));
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

function toggleCompactTheme() {
  state.ui.themePanel = state.ui.themePanel === "compact" ? "open" : "compact";
  saveState();
  renderThemePanelState();
}

function toggleCollapseTheme() {
  state.ui.themePanel = state.ui.themePanel === "collapsed" ? "compact" : "collapsed";
  saveState();
  renderThemePanelState();
}

function toggleCompactFieldPost() {
  state.ui.fieldPostPanel = state.ui.fieldPostPanel === "compact" ? "open" : "compact";
  saveState();
  renderFieldPostPanelState();
}

function toggleCollapseFieldPost() {
  state.ui.fieldPostPanel = state.ui.fieldPostPanel === "collapsed" ? "compact" : "collapsed";
  saveState();
  renderFieldPostPanelState();
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
  renderCharacterCard(encounter);
  renderKidsEncounterCard(encounter, questions);
  els.encounterPanel?.classList.toggle("kids-detail", Boolean(state.ui?.kidsMapActive));
  els.media.style.setProperty(
    "--media",
    `radial-gradient(circle at 28% 26%, ${encounter.color || "#2f6fb3"} 0 10%, transparent 11%),
     linear-gradient(140deg, rgba(255,255,255,.28), rgba(255,255,255,0)),
     repeating-linear-gradient(35deg, ${encounter.color || "#2f6fb3"} 0 12px, #f7fbf6 12px 24px)`
  );
}

function renderKidsEncounterCard(encounter, questions = getEncounterQuestions(encounter)) {
  if (!els.kidsEncounterCard) return;
  const active = Boolean(state.ui?.kidsMapActive);
  els.kidsEncounterCard.classList.toggle("hidden", !active);
  if (!active) return;
  const focus = encounter.impact || getEncounterTags(encounter)[0] || "ワクワク";
  els.kidsEncounterTitle.textContent = "ここでなにをみつける？";
  els.kidsEncounterFocus.textContent = `${encounter.locationName || "この場所"}で、${focus}につながるふしぎをさがそう。`;
  const tasks = [
    `「${questions[0] || "なにがあるかな？"}」を見つける`,
    "気になったものをしゃしんにとる",
    "びっくりしたことをひとこと書く",
  ];
  els.kidsTaskList.innerHTML = tasks
    .map((task, index) => `<div class="kids-task"><span>${index + 1}</span><strong>${escapeHtml(task)}</strong></div>`)
    .join("");
}

function openKidsFieldPost() {
  state.ui.kidsMapActive = true;
  state.ui.fieldPostPanel = "open";
  saveState();
  render();
  els.fieldPostPanel?.scrollIntoView({ behavior: "smooth", block: "center" });
  els.fieldPostText?.focus();
}

function renderCharacterCard(encounter) {
  if (!els.characterCard) return;
  const character = getEventCharacter(encounter);
  if (!character) {
    els.characterCard.className = "character-card empty";
    els.characterCard.innerHTML = "<p>このイベントにはまだキャラクターが設定されていません。</p>";
    return;
  }
  const unlocked = !character.localOnly || hasVisitedCharacter(encounter.id);
  els.characterCard.className = `character-card${unlocked ? " unlocked" : " locked"}`;
  els.characterCard.innerHTML = unlocked
    ? `<div class="character-avatar">${escapeHtml(character.name.slice(0, 1))}</div>
      <div>
        <p class="label">現地で出会ったキャラクター</p>
        <strong>${escapeHtml(character.name)}</strong>
        <span>${escapeHtml(character.role)}</span>
        <p>${escapeHtml(character.message)}</p>
      </div>`
    : `<div class="character-avatar">?</div>
      <div>
        <p class="label">現地限定キャラクター</p>
        <strong>現場に行くと会えます</strong>
        <span>${hasValidLatLng(encounter.position) ? "イベント地点から300m以内で解放" : "イベント位置を設定すると解放できます"}</span>
        <p>このキャラクターの名前とメッセージは、リアルにその場所へ行った時だけ表示されます。</p>
      </div>`;
}

function setFieldPostStatus(message, isError = false) {
  if (!els.fieldPostStatus) return;
  els.fieldPostStatus.textContent = message;
  els.fieldPostStatus.classList.toggle("error", isError);
}

function getSelectedFieldPosts() {
  return state.fieldPosts
    .filter((post) => post.eventId === state.selected && post.approvalStatus !== "rejected")
    .sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
}

function renderFieldPhotoPreview() {
  if (!els.fieldPhotoPreview) return;
  if (!pendingFieldPostImage?.dataUrl) {
    els.fieldPhotoPreview.classList.add("hidden");
    els.fieldPhotoPreview.innerHTML = "";
    return;
  }
  els.fieldPhotoPreview.classList.remove("hidden");
  els.fieldPhotoPreview.innerHTML = `<img src="${pendingFieldPostImage.dataUrl}" alt="投稿予定の写真" />`;
}

function renderFieldPosts() {
  if (!els.fieldPostPanel) return;
  const encounter = getSelectedEncounter();
  const posts = getSelectedFieldPosts();
  const kidsMode = Boolean(state.ui?.kidsMapActive);
  els.fieldPostPanel.classList.toggle("kids-post-mode", kidsMode);
  els.kidsPostTools?.classList.toggle("hidden", !kidsMode);
  if (els.kidsSelectedStamp) els.kidsSelectedStamp.textContent = pendingKidsStamp || "スタンプなし";
  document.querySelectorAll("[data-kids-stamp]").forEach((button) => {
    button.classList.toggle("active", button.dataset.kidsStamp === pendingKidsStamp);
  });
  els.fieldPostTarget.textContent = encounter.title;
  els.fieldPostCount.textContent = `${posts.length}件`;
  els.fieldPostList.innerHTML = posts.length
    ? posts
        .slice(0, 4)
        .map(
          (post) => {
            const imageSrc = post.image?.dataUrl || post.image?.downloadUrl || "";
            return `<article class="field-post-card">
            ${imageSrc ? `<img src="${imageSrc}" alt="${escapeHtml(post.eventTitle)}の現場写真" />` : ""}
            <div>
              <time>${formatTime(new Date(post.at))}</time>
              <p>${escapeHtml([post.stamp, post.text || "写真のみの投稿"].filter(Boolean).join(" / "))}</p>
              <small>${[
                post.approvalStatus === "pending" ? "保護者確認待ち" : "",
                post.location ? `位置 ${Number(post.location.lat).toFixed(5)}, ${Number(post.location.lng).toFixed(5)}` : "位置なし",
              ].filter(Boolean).join(" / ")}</small>
            </div>
          </article>`;
          }
        )
        .join("")
    : "<p class=\"empty-note\">まだ現場投稿はありません。</p>";
}

function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("画像ファイルを選んでください"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("写真を読み込めませんでした"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("写真を処理できませんでした"));
      image.onload = () => {
        const maxSide = 1280;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("写真を処理できませんでした"));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.78);
        if (dataUrl.length > 1800000) {
          reject(new Error("写真が大きすぎます。少し小さい画像で試してください"));
          return;
        }
        resolve({
          name: file.name,
          type: "image/jpeg",
          size: dataUrl.length,
          dataUrl,
        });
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleFieldPhotoChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    pendingFieldPostImage = null;
    renderFieldPhotoPreview();
    return;
  }

  setFieldPostStatus("写真を読み込み中...");
  try {
    pendingFieldPostImage = await compressImageFile(file);
    renderFieldPhotoPreview();
    setFieldPostStatus("写真を追加しました");
  } catch (error) {
    pendingFieldPostImage = null;
    renderFieldPhotoPreview();
    setFieldPostStatus(error.message || "写真を追加できませんでした", true);
  }
}

function attachFieldPostLocation() {
  if (!navigator.geolocation) {
    setFieldPostStatus("このブラウザでは現在地を取得できません", true);
    return;
  }
  setFieldPostStatus("現在地を取得中...");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      pendingFieldPostLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: Math.round(position.coords.accuracy || 0),
      };
      setFieldPostStatus("現在地を添付しました");
    },
    () => setFieldPostStatus("現在地を取得できませんでした", true),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

function selectKidsStamp(stamp) {
  pendingKidsStamp = stamp || "";
  if (els.kidsSelectedStamp) els.kidsSelectedStamp.textContent = pendingKidsStamp || "スタンプなし";
  document.querySelectorAll("[data-kids-stamp]").forEach((button) => {
    button.classList.toggle("active", button.dataset.kidsStamp === pendingKidsStamp);
  });
}

function saveFieldPost() {
  const encounter = getSelectedEncounter();
  const text = els.fieldPostText.value.trim();
  const kidsMode = Boolean(state.ui?.kidsMapActive);
  if (!text && !pendingFieldPostImage?.dataUrl && !pendingKidsStamp) {
    setFieldPostStatus(kidsMode ? "しゃしん、スタンプ、ひとことのどれかを入れてください" : "写真か文章を入れてください", true);
    return;
  }

  const depth = getDepth();
  const questDelta = Math.max(3, depth * 3 + (pendingFieldPostImage ? 2 : 0) + (pendingFieldPostLocation ? 2 : 0));
  const joyDelta = Math.max(2, 2 + depth + (pendingFieldPostImage ? 1 : 0));
  const post = {
    id: `field-post-${Date.now()}`,
    eventId: encounter.id,
    eventTitle: encounter.title,
    text,
    image: pendingFieldPostImage,
    location: pendingFieldPostLocation,
    stamp: pendingKidsStamp,
    sourceMode: kidsMode ? "kids" : "teens",
    approvalStatus: kidsMode ? "pending" : "approved",
    depth,
    questDelta,
    joyDelta,
    at: new Date().toISOString(),
  };

  state.fieldPosts = [post, ...state.fieldPosts].slice(0, 80);
  addQuest(questDelta);
  state.joy = clamp(state.joy + joyDelta);
  state.drive = clamp(state.drive + depth + (pendingFieldPostLocation ? 2 : 0));
  addActivity(`${encounter.title}に現場投稿。探究値 +${questDelta} / ワクワク +${joyDelta}`);

  els.fieldPostText.value = "";
  els.fieldPostPhoto.value = "";
  pendingKidsStamp = "";
  selectKidsStamp("");
  pendingFieldPostImage = null;
  pendingFieldPostLocation = null;
  renderFieldPhotoPreview();
  setFieldPostStatus(kidsMode ? "みつけたことを保存しました。保護者確認待ちです" : "現場投稿を保存しました");
  saveState();
  render();
  if (getDriveUrl()) {
    postToDrive("field_posts", fieldPostToDriveRecord(post));
  }
  queueFirebaseSync("現場投稿");
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

function createFallbackCharacter(encounter) {
  const words = String(encounter.impact || encounter.title || "探究").split(/[・\s、,]+/).filter(Boolean);
  const theme = words[0] || "探究";
  return {
    name: `${theme}ナビ`,
    role: "探究案内人",
    message: getEncounterQuestions(encounter)[0] || "この場所で見える事実から、次の問いを探してみよう。",
    localOnly: true,
  };
}

function getNearestEncounterId(location) {
  if (!hasValidLatLng(location)) return "";
  const nearest = getEncounters()
    .filter((encounter) => hasValidLatLng(encounter.position))
    .map((encounter) => ({
      id: encounter.id,
      distance: getDistanceMeters(location, encounter.position),
    }))
    .sort((a, b) => a.distance - b.distance)[0];
  return nearest?.id || "";
}

function getFieldPostTargetId(post) {
  if (post?.eventId && getEncounters().some((encounter) => encounter.id === post.eventId)) return post.eventId;
  return getNearestEncounterId(post?.location);
}

function getHeroStreamItems() {
  const photoItems = (state.fieldPosts || [])
    .filter((post) => post.image?.dataUrl || post.image?.downloadUrl)
    .slice(0, 8)
    .map((post) => ({
      type: "photo",
      id: `photo-${post.id}`,
      eventId: getFieldPostTargetId(post),
      title: post.eventTitle || "現場投稿",
      subtitle: post.text || "写真から問いを広げる",
      imageSrc: post.image.dataUrl || post.image.downloadUrl,
      meta: post.location ? "位置つき投稿" : "現場写真",
      at: post.at || "",
    }));

  const characterItems = getEncounters()
    .map((encounter) => ({
      encounter,
      character: getEventCharacter(encounter) || createFallbackCharacter(encounter),
    }))
    .filter((item) => item.character?.name)
    .slice(0, 10)
    .map(({ encounter, character }) => ({
      type: "character",
      id: `character-${encounter.id}`,
      eventId: encounter.id,
      title: character.name,
      subtitle: character.role,
      message: character.message,
      eventTitle: encounter.title,
      locked: character.localOnly && !hasVisitedCharacter(encounter.id),
    }));

  const items = [];
  const maxLength = Math.max(photoItems.length, characterItems.length);
  for (let index = 0; index < maxLength; index += 1) {
    if (photoItems[index]) items.push(photoItems[index]);
    if (characterItems[index]) items.push(characterItems[index]);
  }
  return items.slice(0, 16);
}

function openHeroStreamTarget(eventId) {
  const encounter = getEncounters().find((item) => item.id === eventId);
  if (!encounter) return;
  state.selected = encounter.id;
  state.ui.encounterPanel = state.ui.encounterPanel === "collapsed" ? "compact" : state.ui.encounterPanel || "open";
  saveState();
  render();
  if (hasValidLatLng(encounter.position)) {
    focusGoogleMapPoint({ lat: Number(encounter.position.lat), lng: Number(encounter.position.lng) }, 12);
  }
}

function attachHeroStreamHandlers() {
  if (!els.heroStreamTrack) return;
  els.heroStreamTrack.querySelectorAll("[data-event-id]").forEach((card) => {
    card.addEventListener("click", () => openHeroStreamTarget(card.dataset.eventId));
  });
}

function renderHeroStream() {
  if (!els.heroStreamTrack || !els.heroStreamCount) return;
  const items = getHeroStreamItems();
  els.heroStreamCount.textContent = `${items.length}件`;
  if (!items.length) {
    els.heroStreamTrack.innerHTML = "<article class=\"hero-stream-card empty\"><strong>探究ライブ準備中</strong><span>現場投稿やキャラクターがここに流れます</span></article>";
    return;
  }
  const repeated = [...items, ...items];
  els.heroStreamTrack.innerHTML = repeated
    .map((item) => {
      const target = item.eventId ? ` data-event-id="${escapeHtml(item.eventId)}"` : "";
      if (item.type === "photo") {
        return `<button class="hero-stream-card photo-card" type="button"${target}>
          <img src="${escapeHtml(item.imageSrc)}" alt="${escapeHtml(item.title)}の投稿写真" />
          <div>
            <span>${escapeHtml(item.meta)}</span>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.subtitle)}</p>
          </div>
        </button>`;
      }
      return `<button class="hero-stream-card character-stream-card${item.locked ? " locked" : ""}" type="button"${target}>
        <div class="stream-avatar">${escapeHtml(item.title.slice(0, 1))}</div>
        <div>
          <span>${item.locked ? "現地で会えるAIキャラ" : "出会ったAIキャラ"}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.eventTitle)} / ${escapeHtml(item.subtitle)}</p>
        </div>
      </button>`;
    })
    .join("");
  attachHeroStreamHandlers();
}

function render() {
  renderAuth();
  renderMemberSummary();
  renderStats();
  renderHeroStream();
  renderSpots();
  renderEventList();
  renderEncounter();
  renderKidsMapGuide();
  renderFieldPostPanelState();
  renderFieldPosts();
  renderHeroGrowth();
  renderKidsMode();
  renderGuardianMode();
  renderInterests();
  renderActivity();
  renderGrowthPath();
  renderFeedbackView();
  renderThemeEvaluation();
  renderAiSuggestions();
  renderRegisteredEvents();
  renderDriveSync();
  renderFirebaseSettings();
  renderMapsSettings();
  renderDatabaseStatus();
}

function renderAuth() {
  const needsMember = state.auth.loggedIn && !state.member.name;
  const showMember = state.auth.loggedIn && (needsMember || state.ui.memberEditing);
  els.authScreen.classList.toggle("hidden", state.auth.loggedIn && !showMember);
  els.loginForm.classList.toggle("hidden", state.auth.loggedIn);
  els.memberForm.classList.toggle("hidden", !showMember);
  if (els.memberFormTitle) {
    els.memberFormTitle.textContent = needsMember ? "冒険の準備をしよう" : "会員情報編集";
  }
  if (els.memberFormIntro) {
    els.memberFormIntro.innerHTML = needsMember
      ? `<strong>最初の相棒アバターを作ると、Wakuwaku Questが始まります。</strong><span>名前、最初のワクワク、冒険者タイプを入れて、あなたの探究の一歩目を登録しましょう。</span>`
      : `<strong>冒険者プロフィールを更新できます。</strong><span>アバター、ワクワク、パーティー役割を変えると、成長画面にも反映されます。</span>`;
  }
  if (els.memberSubmitButton) {
    els.memberSubmitButton.textContent = needsMember ? "冒険を始める" : "会員情報を保存";
  }
  els.backLoginButton.textContent = needsMember ? "ログインに戻る" : state.auth.loggedIn ? "閉じる" : "ログインに戻る";
}

function renderMemberSummary() {
  els.memberSummaryName.textContent = state.member.name || "未設定";
  const meta = [state.member.grade, state.member.school, state.member.region].filter(Boolean).join(" / ");
  els.memberSummaryMeta.textContent = meta || "学年・学校未設定";
  const heroRole = state.member.heroRole || "ヒーロー";
  const avatar = normalizeAvatar(state.member.avatar);
  const roles = normalizePartyRoles(state.member.partyRoles);
  renderAvatarElement(els.memberAvatarSummary, avatar);
  if (els.memberPartySummary) {
    els.memberPartySummary.innerHTML = `<div class="hero-role-badge">${escapeHtml(heroRole)}として登録 / ${escapeHtml(avatar.aura)}オーラ</div>
      <div class="party-dimension-badge">${escapeHtml(getHeroStageLabel())} / ${getHeroDimension()}D</div>
      <div class="party-role-chips">${roles.map((role) => `<span>${escapeHtml(role)}</span>`).join("")}</div>`;
  }
  renderPartyRoleEditor();
  renderAvatarEditor();
}

function renderAvatarElement(element, avatar) {
  if (!element) return;
  const imageSrc = avatar.imageDataUrl || avatar.downloadUrl || "";
  element.innerHTML = imageSrc
    ? `<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(avatar.aura)}オーラのアバター" />`
    : escapeHtml(avatar.symbol);
  element.style.setProperty("--avatar-bg", getAvatarGradient(avatar.color));
  element.style.setProperty("--avatar-color", avatar.color);
  element.setAttribute("title", `${avatar.symbol} / ${avatar.aura}オーラ`);
}

function renderHeroGrowth() {
  if (!els.heroGrowthView) return;
  const avatar = normalizeAvatar(state.member.avatar);
  const hpMax = getHeroHpMax();
  const dimension = getHeroDimension();
  const equipment = getHeroEquipment();
  const unlockedCount = equipment.filter((item) => item.unlocked).length;
  els.heroGrowthTitle.textContent = `${state.member.name || "マイヒーロー"}の進化`;
  els.heroGrowthDimension.textContent = `${dimension}D`;
  renderAvatarElement(els.heroLargeAvatar, avatar);
  els.heroGrowthHp.textContent = `${state.quest} / ${hpMax}`;
  els.heroGrowthStage.textContent = getHeroStageLabel();
  els.heroGrowthParty.textContent = `${getPartyPower()}役割`;
  els.heroEquipmentCount.textContent = `${unlockedCount}/${equipment.length}`;
  els.heroEquipmentGrid.innerHTML = equipment
    .map(
      (item) => `<article class="hero-equipment-card${item.unlocked ? " unlocked" : ""}">
        <span>${escapeHtml(item.slot)}</span>
        <strong>${escapeHtml(item.name)}</strong>
        <p>${escapeHtml(item.detail)}</p>
      </article>`
    )
    .join("");
  els.heroEvolutionTrack.innerHTML = [1, 2, 3, 4, 5]
    .map((level) => {
      const active = level <= dimension ? " active" : "";
      return `<div class="evolution-step${active}">
        <span>${level}D</span>
        <strong>${escapeHtml(level === dimension ? getHeroStageLabel() : ["ソロ", "役割", "チーム", "社会", "越境"][level - 1])}</strong>
      </div>`;
    })
    .join("");
  els.heroNextEvolution.innerHTML = getNextEvolutionTasks().map((task) => `<li>${escapeHtml(task)}</li>`).join("");
}

function setKidsParameter(valueEl, meterEl, noteEl, value, max, note) {
  if (valueEl) valueEl.textContent = `${value}`;
  if (meterEl) {
    const percent = Math.max(8, Math.min(100, Math.round((value / Math.max(1, max)) * 100)));
    meterEl.style.width = `${percent}%`;
  }
  if (noteEl) noteEl.textContent = note;
}

function renderKidsMode() {
  if (!els.kidsView) return;
  const child = normalizeChildProfile(state.childProfile);
  const avatar = normalizeAvatar(state.member.avatar);
  const onboardingComplete = Boolean(child.onboardingComplete);
  renderAvatarElement(els.kidsAvatar, avatar);
  if (els.kidsView.querySelector(".kids-hero h2")) {
    els.kidsView.querySelector(".kids-hero h2").textContent = child.nickname ? `${child.nickname}のぼうけん` : "きょうのぼうけん";
  }
  if (els.kidsView.querySelector(".kids-hero p")) {
    els.kidsView.querySelector(".kids-hero p").textContent = child.favoriteThings
      ? `すきなこと: ${child.favoriteThings}`
      : "すき、ふしぎ、みつけたことから、ワクワクをひろげよう。";
  }
  const bestDepthLabel = depthLabels[getBestDepth() - 1].replace("まで", "");
  setKidsParameter(
    els.kidsQuestPower,
    els.kidsQuestMeter,
    els.kidsQuestNote,
    state.quest,
    getHeroHpMax(),
    `${getHeroStageLabel()}の力`
  );
  setKidsParameter(els.kidsJoyPower, els.kidsJoyMeter, els.kidsJoyNote, state.joy, 100, "すき・発見で育つ");
  setKidsParameter(
    els.kidsDrivePower,
    els.kidsDriveMeter,
    els.kidsDriveNote,
    state.drive,
    100,
    `${bestDepthLabel}までしれた`
  );
  setKidsParameter(
    els.kidsThanksPower,
    els.kidsThanksMeter,
    els.kidsThanksNote,
    state.thanks,
    100,
    `${state.fieldPosts.length}このみつけたこと`
  );
  els.kidsOnboardingForm?.classList.toggle("hidden", onboardingComplete);
  els.kidsActionGrid?.classList.toggle("hidden", !onboardingComplete);
  els.kidsStatusRow?.classList.toggle("hidden", !onboardingComplete);
  els.kidsHomePanel?.classList.toggle("hidden", !onboardingComplete);
  els.kidsRecordPanel?.classList.toggle("hidden", !onboardingComplete);
  renderKidsHomePanel(child);
  renderKidsRecordPanel();
  fillKidsOnboardingForm(child, avatar);
}

function renderKidsHomePanel(child = normalizeChildProfile(state.childProfile)) {
  if (!els.kidsHomePanel) return;
  const encounters = getEncounters();
  const selected = getSelectedEncounter();
  const favoriteWords = extractInterests(child.favoriteThings || state.member.initialInterest || state.interests.join("、"));
  const recommended =
    encounters.find((encounter) =>
      favoriteWords.some((word) =>
        [encounter.title, encounter.impact, ...(encounter.tags || []), ...(encounter.keywords || [])].join(" ").includes(word)
      )
    ) || selected || encounters[0];
  const recentPost = (state.fieldPosts || [])[0];
  if (els.kidsTodayTitle) els.kidsTodayTitle.textContent = recommended?.title || "ぼうけんをえらぼう";
  if (els.kidsTodayText) {
    els.kidsTodayText.textContent = recommended
      ? `${recommended.locationName || "ちず"}で、${recommended.impact || "ワクワク"}をみつけよう。`
      : "ちずから、ちかくのワクワクをみつけよう。";
  }
  if (els.kidsRecentTitle) els.kidsRecentTitle.textContent = recentPost?.eventTitle || "まだありません";
  if (els.kidsRecentText) {
    els.kidsRecentText.textContent = recentPost?.text || (recentPost?.image?.hasPhoto ? "しゃしんをのこしました。" : "しゃしんやことばで、みつけたことをのこそう。");
  }
  const nextTasks = getNextEvolutionTasks();
  if (els.kidsNextStep) els.kidsNextStep.textContent = nextTasks[0] ? nextTasks[0].replace("探究ポイント", "ぼうけんポイント").replace("現場投稿", "みつけたこと") : "すきなものをさがす";
  if (els.kidsNextText) {
    els.kidsNextText.textContent = child.favoriteThings
      ? `${child.favoriteThings}から、ふしぎをひとつえらんでみよう。`
      : "ふしぎだなと思ったら、しゃしんをとってきろくしよう。";
  }
}

function renderKidsRecordPanel() {
  if (!els.kidsRecordPanel) return;
  const records = (state.fieldPosts || []).filter((post) => post.sourceMode === "kids").slice(0, 5);
  if (els.kidsRecordCount) els.kidsRecordCount.textContent = `${records.length}こ`;
  if (els.kidsRecordSelected) els.kidsRecordSelected.textContent = pendingKidsRecordStamp || "スタンプなし";
  document.querySelectorAll("[data-kids-record-stamp]").forEach((button) => {
    button.classList.toggle("active", button.dataset.kidsRecordStamp === pendingKidsRecordStamp);
  });
  if (!els.kidsRecordList) return;
  if (!records.length) {
    els.kidsRecordList.innerHTML = `<p>まだきろくはありません。スタンプだけでものこせます。</p>`;
    return;
  }
  els.kidsRecordList.innerHTML = records
    .map((record) => {
      const body = [record.stamp, record.text || (record.image?.hasPhoto ? "しゃしんをのこしました" : "ひとこときろく")]
        .filter(Boolean)
        .join(" / ");
      return `<article>
        <span>${escapeHtml(formatTime(new Date(record.at)))}</span>
        <strong>${escapeHtml(record.eventTitle || "きょうのきろく")}</strong>
        <p>${escapeHtml(body)}</p>
      </article>`;
    })
    .join("");
}

function setKidsRecordStatus(message, isError = false) {
  if (!els.kidsRecordStatus) return;
  els.kidsRecordStatus.textContent = message;
  els.kidsRecordStatus.classList.toggle("error", Boolean(isError));
}

function selectKidsRecordStamp(stamp) {
  pendingKidsRecordStamp = stamp || "";
  renderKidsRecordPanel();
}

function saveKidsRecord() {
  const text = els.kidsRecordText?.value.trim() || "";
  if (!text && !pendingKidsRecordStamp) {
    setKidsRecordStatus("スタンプか、ひとことを入れてください", true);
    return;
  }
  const encounter = getSelectedEncounter();
  const depth = Math.max(1, getDepth());
  const questDelta = Math.max(2, depth + 2);
  const joyDelta = pendingKidsRecordStamp ? 4 : 3;
  const post = {
    id: `kids-record-${Date.now()}`,
    eventId: encounter.id,
    eventTitle: encounter.title,
    text,
    image: null,
    location: null,
    stamp: pendingKidsRecordStamp,
    sourceMode: "kids",
    approvalStatus: "pending",
    depth,
    questDelta,
    joyDelta,
    at: new Date().toISOString(),
  };
  state.fieldPosts = [post, ...state.fieldPosts].slice(0, 80);
  addQuest(questDelta);
  state.joy = clamp(state.joy + joyDelta);
  state.drive = clamp(state.drive + 1);
  state.thanks = clamp(state.thanks + 2);
  addActivity(`きょうのきろくを保存。たんけんパワー +${questDelta} / ワクワク +${joyDelta}`);
  if (els.kidsRecordText) els.kidsRecordText.value = "";
  pendingKidsRecordStamp = "";
  setKidsRecordStatus("きろくしました。保護者確認待ちです");
  saveState();
  render();
  if (getDriveUrl()) {
    postToDrive("field_posts", fieldPostToDriveRecord(post));
  }
  queueFirebaseSync("きょうのきろく");
}

function fillKidsOnboardingForm(child = normalizeChildProfile(state.childProfile), avatar = normalizeAvatar(state.member.avatar)) {
  if (!els.kidsOnboardingForm || child.onboardingComplete) return;
  els.kidsOnboardingName.value = child.nickname || state.member.name || "";
  els.kidsOnboardingFavorites.value = child.favoriteThings || state.member.initialInterest || "";
  els.kidsOnboardingSymbol.value = avatar.symbol || "星";
  els.kidsOnboardingColor.value = child.favoriteColor || avatar.color || "#2f8f63";
  els.kidsOnboardingAura.value = avatar.aura || "ワクワク";
}

function updateKidsOnboardingAvatarPreview() {
  if (!els.kidsAvatar) return;
  renderAvatarElement(
    els.kidsAvatar,
    normalizeAvatar({
      ...state.member.avatar,
      symbol: els.kidsOnboardingSymbol?.value || state.member.avatar.symbol,
      color: els.kidsOnboardingColor?.value || state.member.avatar.color,
      aura: els.kidsOnboardingAura?.value || state.member.avatar.aura,
    })
  );
}

function saveKidsOnboarding(event) {
  event.preventDefault();
  const previous = normalizeChildProfile(state.childProfile);
  const avatar = normalizeAvatar({
    ...state.member.avatar,
    symbol: els.kidsOnboardingSymbol.value,
    color: els.kidsOnboardingColor.value,
    aura: els.kidsOnboardingAura.value,
    prompt: state.member.avatar.prompt || `${els.kidsOnboardingFavorites.value.trim()}がすきな、シンプルな初期アバター`,
  });
  const nickname = els.kidsOnboardingName.value.trim() || previous.nickname || state.member.name || "ぼうけんしゃ";
  const favoriteThings = els.kidsOnboardingFavorites.value.trim() || previous.favoriteThings;
  state.member.avatar = avatar;
  state.member.name = state.member.name || nickname;
  state.member.initialInterest = state.member.initialInterest || favoriteThings;
  state.childProfile = normalizeChildProfile({
    ...previous,
    id: previous.id || `child-${Date.now()}`,
    nickname,
    favoriteThings,
    favoriteColor: avatar.color,
    onboardingComplete: true,
    onboardingCompletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  if (favoriteThings) {
    state.interests = [...new Set([...extractInterests(favoriteThings), ...state.interests])].slice(0, 10);
    state.sparks.unshift({ text: favoriteThings, source: "kids-onboarding", at: new Date().toISOString() });
    state.sparks = state.sparks.slice(0, 20);
  }
  addActivity(`${nickname}がぼうけんを開始`);
  saveState();
  render();
  if (els.kidsOnboardingStatus) els.kidsOnboardingStatus.textContent = "ぼうけんをはじめました";
  queueFirebaseSync("Kids初回体験完了");
}

function renderGuardianMode() {
  if (!els.guardianView) return;
  const child = normalizeChildProfile(state.childProfile);
  if (els.guardianStatus) els.guardianStatus.textContent = state.ui.mode === "guardian" ? "保護者確認済み" : "待機中";
  if (els.guardianChildName) els.guardianChildName.textContent = child.nickname || state.member.name || "子どもプロフィール未設定";
  if (els.guardianChildMeta) {
    const meta = [`${child.age}歳`, child.region || state.member.region].filter(Boolean).join(" / ");
    els.guardianChildMeta.textContent = meta || "年齢・地域を保護者が確認します。";
  }
  if (els.guardianPendingCount) {
    const pendingPosts = (state.fieldPosts || []).filter((post) => post.approvalStatus === "pending").length;
    els.guardianPendingCount.textContent = `${pendingPosts}件`;
  }
  if (els.guardianActivityCount) els.guardianActivityCount.textContent = `${state.activity.length}件`;
  renderGuardianDashboard(child);
  renderGuardianApprovals();
  fillChildProfileForm();
}

function renderGuardianDashboard(child = normalizeChildProfile(state.childProfile)) {
  if (!els.guardianDashboardStatus) return;
  const posts = Array.isArray(state.fieldPosts) ? state.fieldPosts : [];
  const pending = posts.filter((post) => post.approvalStatus === "pending").length;
  const approved = posts.filter((post) => post.approvalStatus !== "pending" && post.approvalStatus !== "rejected").length;
  const rejected = posts.filter((post) => post.approvalStatus === "rejected").length;
  els.guardianDashboardStatus.textContent = child.nickname ? `${child.nickname}の状況` : "見守り中";
  if (els.guardianQuestValue) els.guardianQuestValue.textContent = state.quest;
  if (els.guardianQuestNote) {
    els.guardianQuestNote.textContent = `${getHeroStageLabel()} / 次の目安 ${getHeroHpMax()}HP`;
  }
  if (els.guardianJoyValue) els.guardianJoyValue.textContent = state.joy;
  if (els.guardianJoyNote) {
    els.guardianJoyNote.textContent = child.favoriteThings ? `好き: ${child.favoriteThings}` : "好きなことをプロフィールに入れると見守りやすくなります。";
  }
  if (els.guardianPostSummary) els.guardianPostSummary.textContent = `${posts.length}件`;
  if (els.guardianPostNote) {
    els.guardianPostNote.textContent = `承認待ち ${pending} / 承認済み ${approved} / 非表示 ${rejected}`;
  }
  if (els.guardianRecentActivity) {
    els.guardianRecentActivity.innerHTML = state.activity.length
      ? state.activity
          .slice(0, 5)
          .map((item) => `<li><time>${formatTime(new Date(item.at))}</time><span>${escapeHtml(item.text)}</span></li>`)
          .join("")
      : "<li><time>未開始</time><span>ぼうけんを始めると活動がここに表示されます。</span></li>";
  }
  if (els.guardianSafetyList) {
    const permissions = child.permissions || {};
    const rows = [
      ["写真投稿", permissions.photoPost],
      ["位置情報保存", permissions.locationSave],
      ["外部公開", permissions.publicShare],
      ["AI候補表示", permissions.aiSuggestions],
      ["Drive同期", permissions.driveSync],
    ];
    els.guardianSafetyList.innerHTML = rows
      .map(([label, enabled]) => `<div><span>${escapeHtml(label)}</span><strong class="${enabled ? "enabled" : "disabled"}">${enabled ? "許可" : "オフ"}</strong></div>`)
      .join("");
  }
}

function renderGuardianApprovals() {
  if (!els.guardianApprovalList) return;
  const child = normalizeChildProfile(state.childProfile);
  const permissions = child.permissions || {};
  const pendingPosts = (state.fieldPosts || [])
    .filter((post) => post.approvalStatus === "pending")
    .sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
  if (els.approvalListStatus) els.approvalListStatus.textContent = `${pendingPosts.length}件`;
  if (!pendingPosts.length) {
    els.guardianApprovalList.innerHTML = "<p class=\"empty-note\">承認待ちの投稿はありません。</p>";
    return;
  }
  els.guardianApprovalList.innerHTML = pendingPosts
    .map((post) => {
      const imageSrc = post.image?.dataUrl || post.image?.downloadUrl || "";
      const tags = getGuardianApprovalTags(post, permissions);
      const scope = permissions.publicShare ? "承認後: アプリ内表示・外部公開許可あり" : "承認後: アプリ内表示のみ";
      return `<article class="approval-card">
        ${imageSrc ? `<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(post.eventTitle || "投稿写真")}" />` : ""}
        <div>
          <div class="approval-card-head">
            <span>${escapeHtml(getGuardianApprovalKind(post))}</span>
            <time>${formatTime(new Date(post.at))}</time>
          </div>
          <span>${escapeHtml(post.eventTitle || "ぼうけんポイント")}</span>
          <strong>${escapeHtml([post.stamp, post.text || "写真のみの投稿"].filter(Boolean).join(" / "))}</strong>
          <div class="approval-tag-row">
            ${tags.map((tag) => `<small class="${tag.warning ? "warning" : ""}">${escapeHtml(tag.label)}</small>`).join("")}
          </div>
          <p>${post.location ? `位置情報あり / ${Number(post.location.lat).toFixed(5)}, ${Number(post.location.lng).toFixed(5)}` : "位置情報なし"}</p>
          <p class="approval-scope">${escapeHtml(scope)}</p>
          <div class="approval-actions">
            <button class="secondary-button" type="button" data-approval-id="${escapeHtml(post.id)}" data-approval-action="rejected">非表示</button>
            <button class="primary-button" type="button" data-approval-id="${escapeHtml(post.id)}" data-approval-action="approved">承認して保存</button>
          </div>
        </div>
      </article>`;
    })
    .join("");
  els.guardianApprovalList.querySelectorAll("[data-approval-id]").forEach((button) => {
    button.addEventListener("click", () => updatePostApproval(button.dataset.approvalId, button.dataset.approvalAction));
  });
}

function getGuardianApprovalKind(post) {
  if (String(post.id || "").startsWith("kids-record-")) return "きょうのきろく";
  if (post.image?.hasPhoto || post.image?.dataUrl || post.image?.downloadUrl) return "写真つき投稿";
  if (post.sourceMode === "kids") return "みつけたこと";
  return "現場投稿";
}

function getGuardianApprovalTags(post, permissions = {}) {
  const hasPhoto = Boolean(post.image?.hasPhoto || post.image?.dataUrl || post.image?.downloadUrl);
  const tags = [
    { label: post.sourceMode === "kids" ? "子ども投稿" : "通常投稿" },
    { label: post.stamp ? "スタンプあり" : "スタンプなし" },
    { label: post.text ? "ひとことあり" : "ひとことなし" },
    { label: hasPhoto ? "写真あり" : "写真なし", warning: hasPhoto && !permissions.photoPost },
    { label: post.location ? "位置情報あり" : "位置情報なし", warning: Boolean(post.location && !permissions.locationSave) },
    { label: permissions.publicShare ? "外部公開許可" : "外部公開オフ" },
  ];
  return tags;
}

function updatePostApproval(postId, approvalStatus) {
  const target = state.fieldPosts.find((post) => post.id === postId);
  if (!target) return;
  const child = normalizeChildProfile(state.childProfile);
  const publicShareAllowed = Boolean(child.permissions?.publicShare);
  target.approvalStatus = approvalStatus === "approved" ? "approved" : "rejected";
  target.visibility = target.approvalStatus === "approved" && publicShareAllowed ? "public" : target.approvalStatus === "approved" ? "private" : "hidden";
  target.approvedBy = state.auth.email || state.guardian?.id || "guardian-local";
  target.approvedAt = new Date().toISOString();
  addActivity(`${target.eventTitle || "投稿"}を${target.approvalStatus === "approved" ? "承認" : "非表示"}に変更`);
  saveState();
  render();
  queueFirebaseSync("保護者承認");
}

function fillChildProfileForm() {
  if (!els.childProfileForm) return;
  const child = normalizeChildProfile(state.childProfile);
  els.childNickname.value = child.nickname || "";
  els.childAge.value = child.age || 6;
  els.childRegion.value = child.region || "";
  els.childFavoriteColor.value = child.favoriteColor || "#2f8f63";
  els.childFavoriteThings.value = child.favoriteThings || "";
  els.childGuardianId.value = child.guardianId || state.auth.email || "";
  els.permissionPhotoPost.checked = Boolean(child.permissions.photoPost);
  els.permissionLocationSave.checked = Boolean(child.permissions.locationSave);
  els.permissionPublicShare.checked = Boolean(child.permissions.publicShare);
  els.permissionAiSuggestions.checked = Boolean(child.permissions.aiSuggestions);
  els.permissionDriveSync.checked = Boolean(child.permissions.driveSync);
  if (els.childProfileStatus) {
    els.childProfileStatus.textContent = child.updatedAt ? "保存済み" : "未保存";
  }
}

function saveChildProfile(event) {
  event.preventDefault();
  const previous = normalizeChildProfile(state.childProfile);
  const nickname = els.childNickname.value.trim();
  const age = Math.max(4, Math.min(10, Number(els.childAge.value || previous.age || 6)));
  state.childProfile = normalizeChildProfile({
    ...previous,
    id: previous.id || `child-${Date.now()}`,
    nickname,
    age,
    region: els.childRegion.value.trim(),
    favoriteColor: els.childFavoriteColor.value || previous.favoriteColor,
    favoriteThings: els.childFavoriteThings.value.trim(),
    guardianId: els.childGuardianId.value.trim() || state.auth.email || previous.guardianId,
    permissions: {
      photoPost: els.permissionPhotoPost.checked,
      locationSave: els.permissionLocationSave.checked,
      publicShare: els.permissionPublicShare.checked,
      aiSuggestions: els.permissionAiSuggestions.checked,
      driveSync: els.permissionDriveSync.checked,
    },
    updatedAt: new Date().toISOString(),
  });
  if (nickname && !state.member.name) {
    state.member.name = nickname;
  }
  if (state.childProfile.region && !state.member.region) {
    state.member.region = state.childProfile.region;
  }
  addActivity(`${state.childProfile.nickname || "子ども"}のプロフィールを保存`);
  saveState();
  render();
  if (els.childProfileStatus) els.childProfileStatus.textContent = "保存しました";
  queueFirebaseSync("子どもプロフィール更新");
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
  els.memberHeroRole.value = state.member.heroRole || "ヒーロー";
  state.member.avatar = normalizeAvatar(state.member.avatar);
  if (els.memberAvatarSymbol) els.memberAvatarSymbol.value = state.member.avatar.symbol;
  if (els.memberAvatarColor) els.memberAvatarColor.value = state.member.avatar.color;
  if (els.memberAvatarAura) els.memberAvatarAura.value = state.member.avatar.aura;
  if (els.memberAvatarPrompt) els.memberAvatarPrompt.value = state.member.avatar.prompt;
  state.member.partyRoles = normalizePartyRoles(state.member.partyRoles);
  renderAvatarEditor();
  renderPartyRoleEditor();
  setMemberStatus("");
}

function getAvatarFromEditor() {
  const current = normalizeAvatar(state.member.avatar);
  return normalizeAvatar({
    symbol: els.memberAvatarSymbol?.value,
    color: els.memberAvatarColor?.value,
    aura: els.memberAvatarAura?.value,
    prompt: els.memberAvatarPrompt?.value,
    imageDataUrl: current.imageDataUrl,
    downloadUrl: current.downloadUrl,
    storagePath: current.storagePath,
    generatedAt: current.generatedAt,
    generationStage: current.generationStage,
  });
}

function renderAvatarEditor() {
  if (!els.memberAvatarPreview) return;
  const avatar = getAvatarFromEditor();
  renderAvatarElement(els.memberAvatarPreview, avatar);
}

function updateAvatarFromEditor() {
  state.member.avatar = getAvatarFromEditor();
  renderAvatarEditor();
  renderMemberSummary();
}

function buildMemberAvatarPrompt() {
  const avatar = getAvatarFromEditor();
  const heroRole = els.memberHeroRole?.value || state.member.heroRole || "ヒーロー";
  const firstInterest = els.memberInterest?.value.trim() || state.member.initialInterest || state.interests.join("、") || "探究";
  const dimension = getHeroDimension();
  const stage = dimension <= 2 ? "まだ小さくシンプルで、成長前の相棒キャラクター" : "少し成長した探究ヒーローの相棒キャラクター";
  return [
    "中高生向け探究育成ゲームのプレイヤーアバターを1体生成する。",
    `役割: ${heroRole}`,
    `シンボル: ${avatar.symbol}`,
    `メインカラー: ${avatar.color}`,
    `オーラ: ${avatar.aura}`,
    avatar.prompt ? `ユーザーのテキスト指示: ${avatar.prompt}` : "",
    pendingAvatarReferenceImage ? "本人写真が参考画像として添付されている。顔立ち、髪型、雰囲気、表情の特徴を、写実ではなく安全で親しみやすいゲームアバターに抽象化して反映する。" : "",
    `興味: ${firstInterest}`,
    `成長段階: ${stage}`,
    "最初の姿なので、形はシンプル。丸みがあり、親しみやすい小さなキャラクター。",
    "ユーザーのテキスト指示がある場合は、その雰囲気、色、持ち物、性格を優先して反映する。",
    "全身が見える。背景は透明または白に近いシンプルな背景。",
    "武器や攻撃表現は入れない。学び、観察、発見、冒険の印象にする。",
    "文字、ロゴ、読める記号は入れない。",
    "安全で年齢に適した、明るいキャラクターデザイン。",
  ].filter(Boolean).join("\n");
}

function compressGeneratedAvatarImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onerror = () => reject(new Error("生成画像を読み込めませんでした"));
    image.onload = () => {
      const maxSide = 520;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("生成画像を処理できませんでした"));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.src = dataUrl;
  });
}

function compressAvatarReferencePhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("画像ファイルを選んでください"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("写真を読み込めませんでした"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("写真を処理できませんでした"));
      image.onload = () => {
        const maxSide = 900;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("写真を処理できませんでした"));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve({
          name: file.name,
          dataUrl: canvas.toDataURL("image/jpeg", 0.82),
        });
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderAvatarPhotoPreview() {
  if (!els.memberAvatarPhotoPreview) return;
  if (!pendingAvatarReferenceImage?.dataUrl) {
    els.memberAvatarPhotoPreview.classList.add("hidden");
    els.memberAvatarPhotoPreview.innerHTML = "";
    return;
  }
  els.memberAvatarPhotoPreview.classList.remove("hidden");
  els.memberAvatarPhotoPreview.innerHTML = `<img src="${escapeHtml(pendingAvatarReferenceImage.dataUrl)}" alt="アバター生成に使う本人写真" />
    <span>この写真は生成の参考にだけ使います</span>`;
}

async function handleAvatarPhotoChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    pendingAvatarReferenceImage = null;
    renderAvatarPhotoPreview();
    return;
  }
  if (els.memberAvatarStatus) {
    els.memberAvatarStatus.textContent = "本人写真を読み込み中...";
    els.memberAvatarStatus.classList.remove("error");
  }
  try {
    pendingAvatarReferenceImage = await compressAvatarReferencePhoto(file);
    renderAvatarPhotoPreview();
    if (els.memberAvatarStatus) {
      els.memberAvatarStatus.textContent = "本人写真を参考画像として追加しました";
    }
  } catch (error) {
    pendingAvatarReferenceImage = null;
    renderAvatarPhotoPreview();
    if (els.memberAvatarStatus) {
      els.memberAvatarStatus.textContent = error.message || "本人写真を追加できませんでした";
      els.memberAvatarStatus.classList.add("error");
    }
  }
}

async function generateMemberAvatar() {
  if (!els.generateMemberAvatarButton || !els.memberAvatarStatus) return;
  const previousText = els.generateMemberAvatarButton.textContent;
  els.generateMemberAvatarButton.disabled = true;
  els.generateMemberAvatarButton.textContent = "生成中";
  els.memberAvatarStatus.textContent = "AIでシンプルな初期アバターを生成中...";
  els.memberAvatarStatus.classList.remove("error");

  try {
    const response = await fetch(getGenerateImageApiPath(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: buildMemberAvatarPrompt(),
        referenceImageDataUrl: pendingAvatarReferenceImage?.dataUrl || "",
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    if (!data.imageDataUrl) {
      throw new Error("画像データが空です");
    }
    const compressedImage = await compressGeneratedAvatarImage(data.imageDataUrl);
    state.member.avatar = {
      ...getAvatarFromEditor(),
      imageDataUrl: compressedImage,
      generatedAt: new Date().toISOString(),
      generationStage: "simple",
    };
    saveState();
    renderMemberSummary();
    renderStats();
    els.memberAvatarStatus.textContent = `${data.model || "gpt-image-2"}で初期アバターを生成しました`;
    addActivity("AIで自分の初期アバターを生成");
    if (hasFirebaseConfig()) {
      els.memberAvatarStatus.textContent = "アバターをFirebaseへ保存中...";
      await syncFirebase();
      els.memberAvatarStatus.textContent = "アバターをFirebaseへ保存しました";
    }
  } catch (error) {
    const localHint =
      location.hostname === "127.0.0.1" || location.hostname === "localhost"
        ? "公開版でOPENAI_API_KEYを設定すると使えます"
        : "VercelのOPENAI_API_KEYと画像モデルの利用権限を確認してください";
    els.memberAvatarStatus.textContent = `アバターを生成できません: ${localHint}`;
    els.memberAvatarStatus.classList.add("error");
    console.error(error);
  } finally {
    els.generateMemberAvatarButton.disabled = false;
    els.generateMemberAvatarButton.textContent = previousText;
  }
}

function renderPartyRoleEditor() {
  if (!els.memberPartyRoles) return;
  const roles = normalizePartyRoles(state.member.partyRoles);
  els.memberPartyRoles.innerHTML = roles
    .map(
      (role, index) => `<span class="party-role-pill">
        ${escapeHtml(role)}
        <button type="button" aria-label="${escapeHtml(role)}を外す" data-role-index="${index}">×</button>
      </span>`
    )
    .join("");
  els.memberPartyRoles.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.roleIndex);
      state.member.partyRoles = roles.filter((_, roleIndex) => roleIndex !== index);
      renderPartyRoleEditor();
      renderMemberSummary();
      renderStats();
    });
  });
}

function addPartyRole() {
  const role = els.memberPartyRoleInput.value.trim();
  if (!role) {
    setMemberStatus("追加したい役割を入力してください", true);
    return;
  }
  const roles = normalizePartyRoles(state.member.partyRoles);
  state.member.partyRoles = [...new Set([...roles, role])].slice(0, 8);
  els.memberPartyRoleInput.value = "";
  setMemberStatus("");
  renderPartyRoleEditor();
  renderMemberSummary();
  renderStats();
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
  const isFirstMemberSetup = !state.member.name;
  const interestText = els.memberInterest.value.trim();
  state.member = {
    name: els.memberName.value.trim() || "中高生ユーザー",
    school: els.memberSchool.value.trim(),
    grade: els.memberGrade.value,
    region: els.memberRegion.value.trim(),
    initialInterest: interestText,
    heroRole: els.memberHeroRole.value || "ヒーロー",
    avatar: getAvatarFromEditor(),
    partyRoles: normalizePartyRoles(state.member.partyRoles),
  };
  if (interestText) {
    state.interests = [...new Set([...extractInterests(interestText), ...state.interests])].slice(0, 10);
    state.sparks.unshift({ text: interestText, source: "member-profile", at: new Date().toISOString() });
    state.sparks = state.sparks.slice(0, 20);
  }
  addActivity(isFirstMemberSetup ? `${state.member.name}が冒険を開始` : `${state.member.name}の会員情報を保存`);
  state.ui.memberEditing = false;
  const saved = saveState();
  render();
  setMemberStatus(
    saved
      ? isFirstMemberSetup
        ? "冒険を開始しました。最初の探究ポイントへ向かいましょう。"
        : "会員情報を保存しました"
      : "ブラウザ保存に失敗しました。ローカルサーバーで開き直してください。",
    !saved
  );
  if (getDriveUrl()) {
    postToDrive("users", memberToDriveRecord());
  }
  queueFirebaseSync(isFirstMemberSetup ? "初回会員登録" : "会員情報更新");
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
      state.childProfile = normalizeChildProfile(state.childProfile);
      state.guardian = { ...defaultState.guardian, ...(state.guardian || {}) };
      dedupeCustomEvents();
      await window.WakuwakuDB.writeState(appDb, state, getEncounters());
    } else {
      await window.WakuwakuDB.writeState(appDb, state, getEncounters());
    }

    dbReady = true;
    els.dbStatus.textContent = "接続中";
    render();
    if (shouldAutoLoadFirebaseSnapshot()) {
      await loadFirebaseSnapshot({ silent: true });
    }
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
        ["field", state.fieldPosts.length],
        ["avatars", state.member?.avatar ? 1 : 0],
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
    ["field", counts.fieldPosts || 0],
    ["avatars", counts.avatars || 0],
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
    character_name: event.character?.name || "",
    character_role: event.character?.role || "",
    character_message: event.character?.message || "",
    character_local_only: event.character?.localOnly !== false,
    user_created: Boolean(event.userCreated),
    created_by: state.auth.email || state.member.name || "local-user",
    created_at: event.createdAt || new Date().toISOString(),
    source_url: event.sourceUrl || "",
    source_title: event.sourceTitle || "",
    source_type: event.sourceType || "",
    verification_note: event.verificationNote || "",
  };
}

function memberToDriveRecord() {
  const child = normalizeChildProfile(state.childProfile);
  return {
    id: state.auth.email || "local-user",
    display_name: state.member.name || "中高生ユーザー",
    role: "student",
    child_id: child.id,
    child_nickname: child.nickname,
    child_age: child.age,
    child_region: child.region,
    child_favorite_things: child.favoriteThings,
    child_guardian_id: child.guardianId,
    permission_photo_post: Boolean(child.permissions.photoPost),
    permission_location_save: Boolean(child.permissions.locationSave),
    permission_public_share: Boolean(child.permissions.publicShare),
    permission_ai_suggestions: Boolean(child.permissions.aiSuggestions),
    permission_drive_sync: Boolean(child.permissions.driveSync),
    child_onboarding_complete: Boolean(child.onboardingComplete),
    child_onboarding_completed_at: child.onboardingCompletedAt,
    hero_role: state.member.heroRole || "ヒーロー",
    avatar_symbol: normalizeAvatar(state.member.avatar).symbol,
    avatar_color: normalizeAvatar(state.member.avatar).color,
    avatar_aura: normalizeAvatar(state.member.avatar).aura,
    avatar_prompt: normalizeAvatar(state.member.avatar).prompt,
    avatar_generated: Boolean(normalizeAvatar(state.member.avatar).imageDataUrl),
    avatar_download_url: normalizeAvatar(state.member.avatar).downloadUrl,
    avatar_storage_path: normalizeAvatar(state.member.avatar).storagePath,
    avatar_generation_stage: normalizeAvatar(state.member.avatar).generationStage,
    party_roles: normalizePartyRoles(state.member.partyRoles).join(","),
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

function fieldPostToDriveRecord(post) {
  return {
    id: post.id,
    user_id: state.auth.email || "local-user",
    event_id: post.eventId,
    event_title: post.eventTitle,
    text: post.text,
    stamp: post.stamp || "",
    source_mode: post.sourceMode || "",
    approval_status: post.approvalStatus || "",
    visibility: post.visibility || "",
    approved_by: post.approvedBy || "",
    approved_at: post.approvedAt || "",
    has_photo: Boolean(post.image?.dataUrl),
    photo_name: post.image?.name || "",
    latitude: post.location?.lat || "",
    longitude: post.location?.lng || "",
    accuracy: post.location?.accuracy || "",
    quest_delta: post.questDelta || 0,
    joy_delta: post.joyDelta || 0,
    created_at: post.at || new Date().toISOString(),
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
  for (const post of state.fieldPosts.slice(0, 10)) {
    await postToDrive("field_posts", fieldPostToDriveRecord(post));
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

async function startAdventure() {
  const encounter = getSelectedEncounter();
  const unlocked = await unlockLocalCharacter(encounter);
  if (!unlocked) {
    saveState();
    renderCharacterCard(encounter);
    return;
  }
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
  queueFirebaseSync("探究開始");
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
  queueFirebaseSync("振り返り");
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
  queueFirebaseSync("フィードバック");
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

function confirmGuardianMode() {
  const passcode = String(state.guardian?.passcode || "0000");
  const input = window.prompt("保護者モードのパスコードを入力してください");
  if (input === null) return false;
  if (String(input).trim() === passcode) return true;
  window.alert("パスコードが違います");
  return false;
}

function showMode(mode, options = {}) {
  if (mode === "guardian" && state.ui.mode !== "guardian" && !confirmGuardianMode()) {
    return;
  }
  const feedback = mode === "feedback";
  const eventAdmin = mode === "event-admin";
  const capital = mode === "capital";
  const settings = mode === "settings";
  const kids = mode === "kids";
  const guardian = mode === "guardian";
  state.ui.mode = mode;
  if (mode !== "quest" || !options.kidsMap) {
    state.ui.kidsMapActive = false;
  }
  saveState();
  els.questViews.forEach((view) => view.classList.toggle("hidden", feedback || eventAdmin || capital || settings || kids || guardian));
  els.feedbackView.classList.toggle("hidden", !feedback);
  els.eventAdminView.classList.toggle("hidden", !eventAdmin);
  els.heroGrowthView?.classList.toggle("hidden", !capital);
  els.settingsView?.classList.toggle("hidden", !settings);
  els.kidsView?.classList.toggle("hidden", !kids);
  els.guardianView?.classList.toggle("hidden", !guardian);
  document.querySelectorAll(".mode-tabs button").forEach((item) => {
    item.classList.toggle("active", item.dataset.mode === mode);
  });
  renderKidsMode();
  renderGuardianMode();
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
  const title = suggestion.title || "AI候補探究ポイント";
  const lat = Number(suggestion.lat);
  const lng = Number(suggestion.lng);
  const hasLatLng = Number.isFinite(lat) && Number.isFinite(lng);
  const sourceUrl = normalizeExternalUrl(suggestion.sourceUrl);
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
    description: suggestion.description || "AIが現在のワクワクから生成した探究ポイント候補です。",
    tags: tags.length ? tags : ["AI候補", "探究"],
    keywords: keywords.length ? keywords : tags,
    impact: suggestion.impact || "探究学習・地域課題",
    locationName: suggestion.locationName || "",
    eventType: suggestion.eventType === "limited" ? "limited" : "permanent",
    startDate: suggestion.eventType === "limited" ? suggestion.startDate || "" : "",
    endDate: suggestion.eventType === "limited" ? suggestion.endDate || "" : "",
    character: hasLatLng
      ? {
          name: `${(tags[0] || suggestion.impact || "探究").slice(0, 8)}ナビ`,
          role: "現地案内人",
          message: "この場所で気づいたことを3つ集めて、なぜここで起きているのかを問いにしてみよう。",
          localOnly: true,
        }
      : null,
    questionPath,
    color: ["#2f8f63", "#2f6fb3", "#c85d72", "#d49b2a"][index % 4],
    position: hasLatLng ? createPositionFromLatLng(lat, lng, state.customEvents.length) : createMapPosition(state.customEvents.length),
    boost: { joy: 4, distance: 5, reflection: 3 },
    userCreated: true,
    aiGenerated: true,
    sourceUrl,
    sourceTitle: suggestion.sourceTitle || "",
    sourceType: suggestion.sourceType || "",
    verificationNote: suggestion.verificationNote || "",
    createdAt: new Date().toISOString(),
  };
}

function isVerifiedAiSuggestion(suggestion) {
  const sourceUrl = normalizeExternalUrl(suggestion?.sourceUrl);
  const sourceType = String(suggestion?.sourceType || "");
  const verificationLevel = String(suggestion?.verificationLevel || "");
  const hasEvidence = Boolean(String(suggestion?.sourceTitle || "").trim() && String(suggestion?.verificationNote || "").trim());
  const sourceTypeOk = ["official", "venue", "municipality"].includes(sourceType) || (sourceType === "maps" && suggestion?.eventType !== "limited");
  if (!sourceUrl || !hasEvidence || !sourceTypeOk) return false;
  return verificationLevel === "strict";
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
      const sourceUrl = normalizeExternalUrl(suggestion.sourceUrl);
      const verified = isVerifiedAiSuggestion(suggestion);
      const period =
        suggestion.eventType === "limited" && (suggestion.startDate || suggestion.endDate)
          ? ` / ${[suggestion.startDate, suggestion.endDate].filter(Boolean).join("-")}`
          : "";
      return `<article class="ai-suggestion-card">
        <div>
          <strong>${escapeHtml(suggestion.title || "AI候補探究ポイント")}</strong>
          <span>${escapeHtml([suggestion.impact, suggestion.locationName, `${eventType}${period}`].filter(Boolean).join(" / "))}</span>
        </div>
        <em>${escapeHtml(suggestion.explorationIndex || 76)}</em>
        <p>${escapeHtml(suggestion.reason || suggestion.description || "現在のワクワクから一歩先へ広げる候補です。")}</p>
        <div class="ai-source-row">
          <span class="${verified ? "verified-source" : "unverified-source"}">${verified ? "厳格確認済み" : "厳格確認未完了"}</span>
          ${
            sourceUrl
              ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(suggestion.sourceTitle || "出典を開く")}</a>`
              : "<span>登録には出典URLが必要です</span>"
          }
        </div>
        ${suggestion.verificationNote ? `<p class="ai-verification-note">${escapeHtml(suggestion.verificationNote)}</p>` : ""}
        <div class="ai-suggestion-actions">
          <button class="secondary-button" type="button" data-ai-edit-index="${index}"${verified ? "" : " disabled"}>${verified ? "編集して登録" : "編集不可"}</button>
          <button class="secondary-button" type="button" data-ai-index="${index}"${verified ? "" : " disabled"}>${verified ? "そのまま登録" : "登録不可"}</button>
        </div>
      </article>`;
    })
    .join("");

  els.aiSuggestionList.querySelectorAll("[data-ai-edit-index]").forEach((button) => {
    button.addEventListener("click", () => editAiSuggestion(button.dataset.aiEditIndex));
  });

  els.aiSuggestionList.querySelectorAll("[data-ai-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const suggestion = state.aiSuggestions[Number(button.dataset.aiIndex)];
      if (!suggestion) return;
      if (!isVerifiedAiSuggestion(suggestion)) {
        els.aiSuggestionStatus.textContent = "厳格な実在確認ができていないAI候補は登録できません";
        return;
      }
      addEventRecord(suggestionToEventData(suggestion, Number(button.dataset.aiIndex)));
    });
  });
}

async function searchAiEventSuggestions() {
  if (!els.searchAiEventsButton) return;
  const previousText = els.searchAiEventsButton.textContent;
  const count = clamp(els.aiSuggestionCount?.value || 12, 3, 30);
  const searchWord = els.aiSearchWord?.value.trim() || "";
  els.searchAiEventsButton.disabled = true;
  els.searchAiEventsButton.textContent = "検索中";
  els.aiSuggestionStatus.textContent = searchWord
    ? `「${searchWord}」で実在確認できる候補をWeb検索中...`
    : `実在確認できる探究ポイントをWeb検索中...`;

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
        searchWord,
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
    state.aiSuggestions = (Array.isArray(data.events) ? data.events : []).filter(isVerifiedAiSuggestion);
    addActivity(`AI探究ポイントを${state.aiSuggestions.length}件生成`);
    saveState();
    renderAiSuggestions();
    if (!state.aiSuggestions.length) {
      els.aiSuggestionStatus.textContent = "厳格な実在確認を通過した候補がありません。検索ワードや地域を少し具体的にしてください。";
    }
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

function buildEventImagePrompt() {
  const manualPrompt = els.eventImagePrompt?.value.trim();
  if (manualPrompt) return manualPrompt;

  const title = els.eventTitle?.value.trim() || getSelectedEncounter().title || "探究ポイント";
  const impact = els.eventImpact?.value.trim() || getSelectedEncounter().impact || "地域課題";
  const description = els.eventDescription?.value.trim() || getSelectedEncounter().description || "";
  const locationName = els.eventLocation?.value.trim() || getSelectedEncounter().locationName || state.member.region || "日本の地域";
  const tags = splitList(els.eventTags?.value || "").slice(0, 4).join("、");

  return [
    "中高生向け探究ポイントのキービジュアルを作る。",
    `探究ポイント名: ${title}`,
    `社会課題: ${impact}`,
    `場所: ${locationName}`,
    tags ? `タグ: ${tags}` : "",
    description ? `内容: ${description}` : "",
    "写真とイラストの中間の、明るく現実感のあるビジュアル。",
    "中高生が観察、聞き取り、フィールドワーク、アイデア出しをしている雰囲気。",
    "文字、ロゴ、看板の読める文字は入れない。",
    "安全で年齢に適した表現にする。",
  ]
    .filter(Boolean)
    .join("\n");
}

async function generateEventImage() {
  if (!els.generateEventImageButton || !els.generatedImageStatus || !els.generatedImagePreview) return;
  const prompt = buildEventImagePrompt();
  if (!prompt.trim()) {
    els.generatedImageStatus.textContent = "画像プロンプトを入力してください";
    return;
  }

  const previousText = els.generateEventImageButton.textContent;
  els.generateEventImageButton.disabled = true;
  els.generateEventImageButton.textContent = "生成中";
  els.generatedImageStatus.textContent = "gpt-image-2で画像を生成中...";

  try {
    const response = await fetch(getGenerateImageApiPath(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    if (!data.imageDataUrl) {
      throw new Error("画像データが空です");
    }
    els.generatedImagePreview.innerHTML = `<img src="${data.imageDataUrl}" alt="AIが生成したイベント画像" />`;
    els.generatedImageStatus.textContent = `${data.model || "gpt-image-2"}で生成しました`;
    addActivity("AI画像を生成");
  } catch (error) {
    const localHint =
      location.hostname === "127.0.0.1" || location.hostname === "localhost"
        ? "公開版でOPENAI_API_KEYを設定すると使えます"
        : "VercelのOPENAI_API_KEYと画像モデルの利用権限を確認してください";
    els.generatedImageStatus.textContent = `画像を生成できません: ${localHint}`;
    console.error(error);
  } finally {
    els.generateEventImageButton.disabled = false;
    els.generateEventImageButton.textContent = previousText;
  }
}

function buildFallbackCharacter({ title, impact, description, locationName, tags }) {
  const source = tags[0] || impact || title || "探究";
  const shortName = source.replace(/\s+/g, "").slice(0, 8) || "探究";
  const placeText = locationName || "この場所";
  return {
    name: `${shortName}ナビ`,
    role: "現地案内人",
    message: `${placeText}で見えるものを3つ集めて、「なぜここで起きているのか」を問いにしてみよう。`,
    personality: description ? "探究ポイント内容から簡易作成しました" : "入力内容から簡易作成しました",
    visualPrompt: `${title || source}の現地案内キャラクター。中高生向け、親しみやすい、観察と問いづくりを促す、文字やロゴなし。`,
    fallback: true,
  };
}

function applyCharacterSuggestion(data) {
  els.eventCharacterEnabled.checked = true;
  els.eventCharacterName.value = data.name || "";
  els.eventCharacterRole.value = data.role || "現地案内人";
  els.eventCharacterMessage.value = data.message || "";
  if (els.eventImagePrompt && data.visualPrompt) {
    els.eventImagePrompt.value = data.visualPrompt;
  }
  els.characterSuggestionStatus.textContent = data.fallback
    ? `簡易作成しました: ${data.personality || "Vercel API反映後はAI生成に切り替わります"}`
    : data.personality
      ? `作成しました: ${data.personality}`
      : "キャラクターを作成しました";
}

async function suggestEventCharacter() {
  if (!els.suggestCharacterButton || !els.characterSuggestionStatus) return;
  const title = els.eventTitle.value.trim();
  const impact = els.eventImpact.value.trim();
  const description = els.eventDescription.value.trim();
  if (!title && !impact && !description) {
    els.characterSuggestionStatus.textContent = "先に探究ポイント名・社会課題・内容を少し入力してください";
    return;
  }

  const previousText = els.suggestCharacterButton.textContent;
  els.suggestCharacterButton.disabled = true;
  els.suggestCharacterButton.textContent = "作成中";
  els.characterSuggestionStatus.textContent = "AIで現地限定キャラクターを作成中...";
  const payload = {
    title,
    impact,
    description,
    locationName: els.eventLocation.value.trim(),
    tags: splitList(els.eventTags.value),
    grade: state.member.grade,
  };

  try {
    const response = await fetch(getSuggestCharacterApiPath(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 404) {
        applyCharacterSuggestion(buildFallbackCharacter(payload));
        return;
      }
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    applyCharacterSuggestion(data);
  } catch (error) {
    if (location.hostname === "127.0.0.1" || location.hostname === "localhost") {
      applyCharacterSuggestion(buildFallbackCharacter(payload));
      console.error(error);
      return;
    }
    els.characterSuggestionStatus.textContent = `キャラクターを作成できません: ${error.message || "VercelのOPENAI_API_KEYを確認してください"}`;
    console.error(error);
  } finally {
    els.suggestCharacterButton.disabled = false;
    els.suggestCharacterButton.textContent = previousText;
  }
}

function getEventIndexPayload() {
  return {
    title: els.eventTitle.value.trim(),
    impact: els.eventImpact.value.trim(),
    description: els.eventDescription.value.trim(),
    locationName: els.eventLocation.value.trim(),
    tags: splitList(els.eventTags.value),
    keywords: splitList(els.eventKeywords.value),
    grade: state.member.grade,
  };
}

function getEventIndexEvaluationKey(payload) {
  return JSON.stringify(payload);
}

function scheduleEventIndexEvaluation() {
  if (!els.eventIndexStatus) return;
  window.clearTimeout(eventIndexEvaluateTimer);
  eventIndexEvaluateTimer = window.setTimeout(evaluateEventIndexFromInput, 1200);
}

async function evaluateEventIndexFromInput() {
  if (!els.eventIndex || !els.eventIndexStatus) return;
  const payload = getEventIndexPayload();
  const textLength = `${payload.title}${payload.impact}${payload.description}`.trim().length;
  if (textLength < 12) {
    els.eventIndexStatus.textContent = "探究ポイント名・社会課題・内容を入力するとAIが評価します。";
    return;
  }
  const key = getEventIndexEvaluationKey(payload);
  if (key === lastEventIndexEvaluationKey) return;
  lastEventIndexEvaluationKey = key;
  eventIndexEvaluateToken += 1;
  const token = eventIndexEvaluateToken;
  els.eventIndexStatus.textContent = "AIが探究指数を評価中...";

  try {
    const response = await fetch(getEvaluateIndexApiPath(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    if (token !== eventIndexEvaluateToken) return;
    const score = clamp(data.score || 70);
    els.eventIndex.value = score;
    els.eventIndexStatus.textContent = `AI評価 ${score}: 魅力${data.charm || "-"} / 深さ${data.depth || "-"} / インパクト${data.impact || "-"} / 動機${data.motivation || "-"}。${data.reason || ""}`;
  } catch (error) {
    if (token !== eventIndexEvaluateToken) return;
    const localHint =
      location.hostname === "127.0.0.1" || location.hostname === "localhost"
        ? "公開版でOPENAI_API_KEYを設定すると使えます"
        : "VercelのOPENAI_API_KEYを確認してください";
    els.eventIndexStatus.textContent = `AI評価できません: ${localHint}`;
    console.error(error);
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
  addActivity(`${eventData.title}を探究ポイント登録`);
  els.eventAdminStatus.textContent = "登録済み";
  saveState();
  render();
  showMode("event-admin");
  if (getDriveUrl()) {
    postToDrive("events", eventToDriveRecord(eventData));
  }
  queueFirebaseSync("探究ポイント登録");
}

function resetEventFormToCreate(status = "新規登録") {
  state.ui.editingEventId = "";
  state.ui.aiCandidateSource = null;
  els.eventForm.reset();
  els.eventIndex.value = 78;
  els.eventColor.value = "#2f8f63";
  els.eventType.value = "permanent";
  els.eventStartDate.value = "";
  els.eventEndDate.value = "";
  els.eventLat.value = "";
  els.eventLng.value = "";
  if (els.eventCharacterEnabled) els.eventCharacterEnabled.checked = true;
  if (els.eventSubmitButton) els.eventSubmitButton.textContent = "探究ポイントを登録";
  els.cancelEventEditButton?.classList.add("hidden");
  els.eventAdminStatus.textContent = status;
  saveState();
}

function getAiCandidateSourceFields(suggestion) {
  return {
    aiGenerated: true,
    sourceUrl: normalizeExternalUrl(suggestion.sourceUrl),
    sourceTitle: suggestion.sourceTitle || "",
    sourceType: suggestion.sourceType || "",
    verificationNote: suggestion.verificationNote || "",
    verificationLevel: suggestion.verificationLevel || "",
    verifiedAt: suggestion.verifiedAt || "",
  };
}

function populateEventForm(eventData) {
  els.eventTitle.value = eventData.title || "";
  els.eventImpact.value = eventData.impact || "";
  els.eventDescription.value = eventData.description || "";
  els.eventTags.value = Array.isArray(eventData.tags) ? eventData.tags.join(", ") : "";
  els.eventKeywords.value = Array.isArray(eventData.keywords) ? eventData.keywords.join(", ") : "";
  els.eventIndex.value = eventData.index || 78;
  els.eventColor.value = eventData.color || "#2f8f63";
  els.eventLocation.value = eventData.locationName || "";
  els.eventType.value = eventData.eventType || "permanent";
  els.eventStartDate.value = eventData.startDate || "";
  els.eventEndDate.value = eventData.endDate || "";
  const character = eventData.character || {};
  if (els.eventCharacterEnabled) els.eventCharacterEnabled.checked = Boolean(eventData.character?.localOnly ?? true);
  if (els.eventCharacterName) els.eventCharacterName.value = character.name || "";
  if (els.eventCharacterRole) els.eventCharacterRole.value = character.role || "";
  if (els.eventCharacterMessage) els.eventCharacterMessage.value = character.message || "";
  const position = hasValidLatLng(eventData.position) ? eventData.position : null;
  els.eventLat.value = position ? Number(position.lat).toFixed(6) : "";
  els.eventLng.value = position ? Number(position.lng).toFixed(6) : "";
  els.eventQuestions.forEach((input, index) => {
    input.value = Array.isArray(eventData.questionPath) ? eventData.questionPath[index] || "" : "";
  });
  if (position) renderEventLocationMarker({ lat: Number(position.lat), lng: Number(position.lng) });
}

function editAiSuggestion(index) {
  const suggestion = state.aiSuggestions[Number(index)];
  if (!suggestion) return;
  if (!isVerifiedAiSuggestion(suggestion)) {
    els.aiSuggestionStatus.textContent = "厳格な実在確認ができていないAI候補は編集登録できません";
    return;
  }
  const eventData = suggestionToEventData(suggestion, Number(index));
  state.ui.editingEventId = "";
  state.ui.aiCandidateSource = getAiCandidateSourceFields(suggestion);
  populateEventForm(eventData);
  if (els.eventSubmitButton) els.eventSubmitButton.textContent = "編集して登録";
  els.cancelEventEditButton?.classList.remove("hidden");
  els.eventAdminStatus.textContent = "AI候補を編集中";
  els.eventIndexStatus.textContent = "AI候補をフォームに読み込みました。内容を確認して登録できます。";
  saveState();
  showMode("event-admin");
  els.eventTitle.focus();
}

function startEditingEvent(eventId) {
  const eventData = state.customEvents.find((event) => event.id === eventId);
  if (!eventData) return;
  state.ui.editingEventId = eventData.id;
  state.ui.aiCandidateSource = null;
  state.selected = eventData.id;
  populateEventForm(eventData);
  if (els.eventSubmitButton) els.eventSubmitButton.textContent = "変更を保存";
  els.cancelEventEditButton?.classList.remove("hidden");
  els.eventAdminStatus.textContent = "編集中";
  saveState();
  showMode("event-admin");
  els.eventTitle.focus();
}

function deleteRegisteredEvent(eventId) {
  if (!isAdminUser()) {
    els.eventAdminStatus.textContent = "管理者のみ削除できます";
    return;
  }
  const eventData = state.customEvents.find((event) => event.id === eventId);
  if (!eventData) return;
  const confirmed = window.confirm(`「${eventData.title}」を削除しますか？\nこの操作はこの端末の登録済み探究ポイントから削除します。`);
  if (!confirmed) return;

  state.customEvents = state.customEvents.filter((event) => event.id !== eventId);
  state.completed = state.completed.filter((id) => id !== eventId);
  state.reflections = state.reflections.filter((reflection) => reflection.eventId !== eventId);
  state.feedbacks = state.feedbacks.filter((feedback) => feedback.eventId !== eventId && feedback.reflectionEventId !== eventId);
  state.fieldPosts = state.fieldPosts.filter((post) => post.eventId !== eventId);
  state.visitedCharacters = state.visitedCharacters.filter((id) => id !== eventId);
  if (state.ui.editingEventId === eventId) {
    resetEventFormToCreate("削除済み");
  } else {
    els.eventAdminStatus.textContent = "削除済み";
  }
  if (state.selected === eventId) {
    state.selected = state.customEvents[0]?.id || seedEncounters[0]?.id || "";
  }
  addActivity(`${eventData.title}を削除`);
  saveState();
  render();
  showMode("event-admin");
  queueFirebaseSync("探究ポイント削除");
}

function registerAllAiSuggestions() {
  const suggestions = Array.isArray(state.aiSuggestions) ? state.aiSuggestions : [];
  if (!suggestions.length) {
    els.aiSuggestionStatus.textContent = "登録するAI候補がありません";
    return;
  }
  let added = 0;
  suggestions.forEach((suggestion, index) => {
    if (!isVerifiedAiSuggestion(suggestion)) return;
    const eventData = suggestionToEventData(suggestion, index);
    const duplicate = state.customEvents.find((event) => event.title === eventData.title && event.impact === eventData.impact);
    if (duplicate) return;
    state.customEvents.unshift(eventData);
    added += 1;
  });
  dedupeCustomEvents();
  if (state.customEvents[0]) state.selected = state.customEvents[0].id;
  els.aiSuggestionStatus.textContent = `${added}件の実在確認済み探究ポイントを登録しました`;
  els.eventAdminStatus.textContent = `${added}件まとめて登録`;
  addActivity(`AI探究ポイントを${added}件まとめて登録`);
  saveState();
  render();
  showMode("event-admin");
  if (added > 0) queueFirebaseSync("AI探究ポイント一括登録");
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
    id: state.ui.editingEventId || createEventId(title),
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
    character:
      els.eventCharacterEnabled?.checked && els.eventCharacterName?.value.trim()
        ? {
            name: els.eventCharacterName.value.trim(),
            role: els.eventCharacterRole.value.trim() || "現地案内人",
            message: els.eventCharacterMessage.value.trim() || "現地で見えたことを記録して、次の問いを見つけよう。",
            localOnly: true,
          }
        : null,
    questionPath,
    color: els.eventColor.value || "#2f8f63",
    position,
    boost: { joy: 4, distance: 4, reflection: 3 },
    userCreated: true,
    createdAt: new Date().toISOString(),
    ...(state.ui.aiCandidateSource || {}),
  };

  if (state.ui.editingEventId) {
    const targetIndex = state.customEvents.findIndex((customEvent) => customEvent.id === state.ui.editingEventId);
    if (targetIndex >= 0) {
      const previous = state.customEvents[targetIndex];
      state.customEvents[targetIndex] = {
        ...previous,
        ...eventData,
        id: previous.id,
        createdAt: previous.createdAt || eventData.createdAt,
        updatedAt: new Date().toISOString(),
      };
      state.selected = previous.id;
      addActivity(`${title}を更新`);
      resetEventFormToCreate("更新済み");
      saveState();
      render();
      showMode("event-admin");
      if (getDriveUrl()) {
        postToDrive("events", eventToDriveRecord(state.customEvents[targetIndex]));
      }
      queueFirebaseSync("探究ポイント更新");
      return;
    }
  }

  resetEventFormToCreate();
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
    character: {
      name: "ミライ防災ナビ",
      role: "現地案内人",
      message: "避難所の入口、掲示物、人の動線を観察して、情報が届く人と届きにくい人の違いを探してみよう。",
      localOnly: true,
    },
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
  const admin = isAdminUser();
  els.registeredEventCount.textContent = `${events.length}件`;
  els.registeredEventList.innerHTML = events.length
    ? events
        .map(
          (event) => `<button class="registered-event-card" type="button" data-id="${event.id}">
            <strong>${event.title}</strong>
            <span>${[event.impact, event.locationName, getEventPeriodLabel(event)].filter(Boolean).join(" / ")}</span>
            <em>${event.index}</em>
            <span class="registered-event-actions">
              <span>${state.ui.editingEventId === event.id ? "編集中" : "詳細を見る"}</span>
              <span class="registered-action-group">
                <span class="registered-edit-control" data-edit-id="${event.id}">編集</span>
                ${admin ? `<span class="registered-delete-control" data-delete-id="${event.id}">削除</span>` : ""}
              </span>
            </span>
          </button>`
        )
        .join("")
    : "<p class=\"empty-note\">まだ登録済み探究ポイントはありません。</p>";
  els.registeredEventList.querySelectorAll(".registered-event-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.selected = card.dataset.id;
      saveState();
      render();
      showMode("quest");
    });
  });
  els.registeredEventList.querySelectorAll(".registered-edit-control").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      startEditingEvent(button.dataset.editId);
    });
  });
  els.registeredEventList.querySelectorAll(".registered-delete-control").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteRegisteredEvent(button.dataset.deleteId);
    });
  });
}

document.querySelector("#start-button").addEventListener("click", startAdventure);
document.querySelector("#thanks-button").addEventListener("click", receiveThanks);
els.kidsTakePhotoButton?.addEventListener("click", openKidsFieldPost);
els.kidsStartAdventureButton?.addEventListener("click", startAdventure);
els.loginForm.addEventListener("submit", handleLogin);
els.demoLoginButton.addEventListener("click", handleDemoLogin);
els.memberForm.addEventListener("submit", saveMemberInfo);
[
  els.memberAvatarSymbol,
  els.memberAvatarColor,
  els.memberAvatarAura,
  els.memberAvatarPrompt,
].forEach((input) => input?.addEventListener("input", updateAvatarFromEditor));
els.memberAvatarPhoto?.addEventListener("change", handleAvatarPhotoChange);
els.generateMemberAvatarButton?.addEventListener("click", generateMemberAvatar);
els.addPartyRoleButton?.addEventListener("click", addPartyRole);
els.memberPartyRoleInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addPartyRole();
});
els.backLoginButton.addEventListener("click", () => {
  if (state.auth.loggedIn) {
    if (!state.member.name) {
      logout();
      return;
    }
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
els.childProfileForm?.addEventListener("submit", saveChildProfile);
els.kidsOnboardingForm?.addEventListener("submit", saveKidsOnboarding);
[
  els.kidsOnboardingSymbol,
  els.kidsOnboardingColor,
  els.kidsOnboardingAura,
].forEach((input) => input?.addEventListener("input", updateKidsOnboardingAvatarPreview));
els.eventForm.addEventListener("submit", registerEvent);
els.cancelEventEditButton?.addEventListener("click", () => resetEventFormToCreate());
els.sampleEventButton.addEventListener("click", registerSampleEvent);
els.searchAiEventsButton.addEventListener("click", searchAiEventSuggestions);
els.aiSearchWord?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  searchAiEventSuggestions();
});
els.generateEventImageButton?.addEventListener("click", generateEventImage);
els.suggestCharacterButton?.addEventListener("click", suggestEventCharacter);
els.registerAllAiEventsButton?.addEventListener("click", registerAllAiSuggestions);
[
  els.eventTitle,
  els.eventImpact,
  els.eventDescription,
  els.eventTags,
  els.eventKeywords,
  els.eventLocation,
].forEach((input) => input?.addEventListener("input", scheduleEventIndexEvaluation));
els.useMapCenterButton.addEventListener("click", useMapCenterForEvent);
els.openLocationMapButton.addEventListener("click", initializeEventLocationMap);
els.eventLat.addEventListener("input", syncEventLocationMarkerFromInputs);
els.eventLng.addEventListener("input", syncEventLocationMarkerFromInputs);
els.saveDriveUrlButton.addEventListener("click", saveDriveUrl);
els.syncDriveButton.addEventListener("click", syncAllToDrive);
els.saveFirebaseConfigButton?.addEventListener("click", saveFirebaseConfig);
els.syncFirebaseButton?.addEventListener("click", syncFirebase);
els.loadFirebaseButton?.addEventListener("click", loadFirebaseSnapshot);
els.saveMapsKeyButton.addEventListener("click", saveMapsKey);
els.loadMapsButton.addEventListener("click", initializeGoogleMap);
els.centerSearchButton?.addEventListener("click", centerGoogleMapOnSearch);
els.currentLocationButton?.addEventListener("click", centerOnCurrentLocation);
els.compactThemeButton?.addEventListener("click", toggleCompactTheme);
els.collapseThemeButton?.addEventListener("click", toggleCollapseTheme);
els.compactEncounterButton?.addEventListener("click", toggleCompactEncounter);
els.collapseEncounterButton?.addEventListener("click", toggleCollapseEncounter);
els.compactFieldPostButton?.addEventListener("click", toggleCompactFieldPost);
els.collapseFieldPostButton?.addEventListener("click", toggleCollapseFieldPost);
els.fieldPostPhoto?.addEventListener("change", handleFieldPhotoChange);
els.usePostLocationButton?.addEventListener("click", attachFieldPostLocation);
document.querySelectorAll("[data-kids-stamp]").forEach((button) => {
  button.addEventListener("click", () => selectKidsStamp(button.dataset.kidsStamp));
});
document.querySelectorAll("[data-kids-record-stamp]").forEach((button) => {
  button.addEventListener("click", () => selectKidsRecordStamp(button.dataset.kidsRecordStamp));
});
els.saveFieldPostButton?.addEventListener("click", saveFieldPost);
els.saveKidsRecordButton?.addEventListener("click", saveKidsRecord);
els.saveFeedbackButton.addEventListener("click", saveMentorFeedback);
els.quickFeedbackButtons.forEach((button) => {
  button.addEventListener("click", () => saveQuickFeedback(button.dataset.template));
});
document.querySelector("#analyze-button").addEventListener("click", selectRecommendation);
document.querySelector("#import-button").addEventListener("click", importMockApps);
document.querySelector("#reset-button").addEventListener("click", resetState);
els.exportDbButton.addEventListener("click", exportDatabase);
document.querySelectorAll("[data-kids-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.kidsAction;
    if (action === "quest") {
      state.ui.kidsMapActive = true;
      const candidate = getKidsMapCandidates()[0];
      if (candidate) state.selected = candidate.id;
      saveState();
      showMode("quest", { kidsMap: true });
      renderKidsMapGuide();
      if (candidate && googleMap && hasValidLatLng(candidate.position)) {
        focusGoogleMapPoint({ lat: Number(candidate.position.lat), lng: Number(candidate.position.lng) }, Math.max(googleMap.getZoom(), 10));
      }
      return;
    }
    if (action === "avatar") {
      showMode("capital");
      return;
    }
    if (action === "record") {
      showMode("kids");
      els.kidsRecordPanel?.scrollIntoView({ behavior: "smooth", block: "center" });
      els.kidsRecordText?.focus();
      return;
    }
    showMode("quest");
    if (action === "photo") {
      state.ui.fieldPostPanel = "open";
      saveState();
      renderFieldPostPanelState();
      els.fieldPostPanel?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
});
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
if (state.ui.mode && state.ui.mode !== "quest" && state.ui.mode !== "guardian") {
  showMode(state.ui.mode);
} else if (state.ui.mode === "guardian") {
  state.ui.mode = "quest";
  saveState();
}
initDatabase();
