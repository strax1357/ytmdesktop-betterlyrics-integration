const languages = [["af","Afrikaans"],["sq","Albanian"],["am","Amharic"],["ar","Arabic"],["hy","Armenian"],["as","Assamese"],["ay","Aymara"],["az","Azerbaijani"],["bm","Bambara"],["eu","Basque"],["be","Belarusian"],["bn","Bengali"],["bho","Bhojpuri"],["bs","Bosnian"],["bg","Bulgarian"],["ca","Catalan"],["ceb","Cebuano"],["zh-CN","Chinese (Simplified)"],["zh-TW","Chinese (Traditional)"],["co","Corsican"],["hr","Croatian"],["cs","Czech"],["da","Danish"],["dv","Dhivehi"],["doi","Dogri"],["nl","Dutch"],["en","English"],["eo","Esperanto"],["et","Estonian"],["ee","Ewe"],["fil","Filipino (Tagalog)"],["fi","Finnish"],["fr","French"],["fy","Frisian"],["gl","Galician"],["ka","Georgian"],["de","German"],["el","Greek"],["gn","Guarani"],["gu","Gujarati"],["ht","Haitian Creole"],["ha","Hausa"],["haw","Hawaiian"],["he","Hebrew"],["hi","Hindi"],["hmn","Hmong"],["hu","Hungarian"],["is","Icelandic"],["ig","Igbo"],["ilo","Ilocano"],["id","Indonesian"],["ga","Irish"],["it","Italian"],["ja","Japanese"],["jv","Javanese"],["kn","Kannada"],["kk","Kazakh"],["km","Khmer"],["rw","Kinyarwanda"],["gom","Konkani"],["ko","Korean"],["kri","Krio"],["ku","Kurdish"],["ckb","Kurdish (Sorani)"],["ky","Kyrgyz"],["lo","Lao"],["la","Latin"],["lv","Latvian"],["ln","Lingala"],["lt","Lithuanian"],["lg","Luganda"],["lb","Luxembourgish"],["mk","Macedonian"],["mai","Maithili"],["mg","Malagasy"],["ms","Malay"],["ml","Malayalam"],["mt","Maltese"],["mi","Maori"],["mr","Marathi"],["mni-Mtei","Meiteilon (Manipuri)"],["lus","Mizo"],["mn","Mongolian"],["my","Myanmar (Burmese)"],["ne","Nepali"],["no","Norwegian"],["ny","Nyanja (Chichewa)"],["or","Odia (Oriya)"],["om","Oromo"],["ps","Pashto"],["fa","Persian"],["pl","Polish"],["pt","Portuguese (Portugal, Brazil)"],["pa","Punjabi"],["qu","Quechua"],["ro","Romanian"],["ru","Russian"],["sm","Samoan"],["sa","Sanskrit"],["gd","Scots Gaelic"],["nso","Sepedi"],["sr","Serbian"],["st","Sesotho"],["sn","Shona"],["sd","Sindhi"],["si","Sinhala (Sinhalese)"],["sk","Slovak"],["sl","Slovenian"],["so","Somali"],["es","Spanish"],["su","Sundanese"],["sw","Swahili"],["sv","Swedish"],["tl","Tagalog (Filipino)"],["tg","Tajik"],["ta","Tamil"],["tt","Tatar"],["te","Telugu"],["th","Thai"],["ti","Tigrinya"],["ts","Tsonga"],["tr","Turkish"],["tk","Turkmen"],["ak","Twi (Akan)"],["uk","Ukrainian"],["ur","Urdu"],["ug","Uyghur"],["uz","Uzbek"],["vi","Vietnamese"],["cy","Welsh"],["xh","Xhosa"],["yi","Yiddish"],["yo","Yoruba"],["zu","Zulu"]];
const rulesRoot = document.getElementById("rules");
const language = document.getElementById("language");
const otherTarget = document.getElementById("otherTarget");
const ruleMode = document.getElementById("ruleMode");
const status = document.getElementById("status");
let rules = [];
let saveTimer;

function getDefaultLanguage() {
  const current = navigator.language?.split("-")[0];
  return languages.some(([code]) => code.toLowerCase() === current?.toLowerCase()) ? current : "en";
}

function fillSelect(select, selected, includePlaceholder = false) {
  select.replaceChildren();
  if (includePlaceholder) {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choose a language";
    select.append(placeholder);
  }
  for (const [code, name] of languages) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = name;
    select.append(option);
  }
  select.value = languages.some(([code]) => code === selected) ? selected : getDefaultLanguage();
  if (includePlaceholder && !selected) select.value = "";
}

function renderRules() {
  rulesRoot.replaceChildren();
  rules.forEach((rule, index) => {
    const row = document.createElement("div");
    row.className = "rule";
    const source = document.createElement("select");
    source.setAttribute("aria-label", "Original language");
    fillSelect(source, rule.source, true);
    const target = document.createElement("select");
    target.setAttribute("aria-label", "Translate to");
    fillSelect(target, rule.target || otherTarget.value);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      rules.splice(index, 1);
      renderRules();
      saveSettings();
    });
    source.addEventListener("change", () => {
      if (source.value && rules.some((item, i) => i !== index && item.source === source.value)) {
        status.textContent = "Each source language can only have one rule.";
        source.value = rule.source;
        return;
      }
      rule.source = source.value;
      saveSettings();
    });
    target.addEventListener("change", () => {
      rule.target = target.value;
      saveSettings();
    });
    row.append(source, target, remove);
    rulesRoot.append(row);
  });
}

async function saveSettings() {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(async () => {
    try {
      await chrome.storage.local.set({
        translationLanguage: language.value,
        translationRules: rules.filter(rule => rule.source && rule.target),
        translationOtherTarget: otherTarget.value,
        translationRuleMode: ruleMode.checked,
      });
      status.textContent = "Saved. Lyrics will refresh.";
      window.setTimeout(() => { status.textContent = ""; }, 2500);
    } catch (error) {
      status.textContent = `Could not save settings: ${error.message}`;
    }
  }, 150);
}

function updatePanels() {
  document.getElementById("singleLanguage").hidden = ruleMode.checked;
  document.getElementById("languageRules").hidden = !ruleMode.checked;
}

ruleMode.addEventListener("change", () => {
  updatePanels();
  saveSettings();
});
language.addEventListener("change", saveSettings);
otherTarget.addEventListener("change", () => {
  renderRules();
  saveSettings();
});
document.getElementById("add").addEventListener("click", () => {
  rules.push({ source: "", target: otherTarget.value });
  renderRules();
  saveSettings();
});

async function loadSettings() {
  const defaultLanguage = getDefaultLanguage();
  const settings = await chrome.storage.local.get({
    translationLanguage: defaultLanguage,
    translationRules: [],
    translationOtherTarget: defaultLanguage,
    translationRuleMode: true,
  });
  rules = Array.isArray(settings.translationRules)
    ? settings.translationRules.filter(rule => rule && languages.some(([code]) => code === rule.source) && languages.some(([code]) => code === rule.target))
    : [];
  fillSelect(language, settings.translationLanguage || defaultLanguage);
  fillSelect(otherTarget, settings.translationOtherTarget || settings.translationLanguage || defaultLanguage);
  ruleMode.checked = settings.translationRuleMode !== false;
  updatePanels();
  renderRules();
}

loadSettings().catch(error => {
  status.textContent = `Could not load settings: ${error.message}`;
});