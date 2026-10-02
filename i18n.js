(() => {
  const locales = window.HOURFLOW_LOCALES;
  const supported = new Set(Object.keys(locales));
  const languageCodes = { en: "EN", es: "ES", ca: "CA" };
  let currentLanguage = "en";

  const getValue = (dictionary, key) => key.split(".").reduce((value, part) => value?.[part], dictionary);

  const applyLanguage = (language) => {
    currentLanguage = supported.has(language) ? language : "en";
    const dictionary = locales[currentLanguage];
    document.documentElement.lang = currentLanguage;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = getValue(dictionary, element.dataset.i18n) ?? getValue(locales.en, element.dataset.i18n);
      if (value != null) element.textContent = value;
    });

    document.querySelectorAll("[data-i18n-html]").forEach((element) => {
      const value = getValue(dictionary, element.dataset.i18nHtml) ?? getValue(locales.en, element.dataset.i18nHtml);
      if (value != null) element.innerHTML = value;
    });

    document.querySelectorAll("[data-i18n-content]").forEach((element) => {
      const value = getValue(dictionary, element.dataset.i18nContent) ?? getValue(locales.en, element.dataset.i18nContent);
      if (value != null) element.setAttribute("content", value);
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
      const value = getValue(dictionary, element.dataset.i18nAlt) ?? getValue(locales.en, element.dataset.i18nAlt);
      if (value != null) element.alt = value;
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      const value = getValue(dictionary, element.dataset.i18nAriaLabel) ?? getValue(locales.en, element.dataset.i18nAriaLabel);
      if (value != null) element.setAttribute("aria-label", value);
    });

    document.querySelectorAll(".language-code").forEach((element) => {
      element.textContent = languageCodes[currentLanguage];
    });
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === currentLanguage));
    });

    window.dispatchEvent(new CustomEvent("hourflow:languagechange", { detail: { language: currentLanguage } }));
  };

  const setLanguageInUrl = (language) => {
    const url = new URL(window.location.href);
    if (language === "en") url.searchParams.delete("lang");
    else url.searchParams.set("lang", language);
    window.history.pushState({}, "", url);
    applyLanguage(language);
  };

  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => {
      const urlLanguage = new URLSearchParams(window.location.search).get("lang");
      const alreadyCanonical = button.dataset.language === currentLanguage &&
        (currentLanguage === "en" ? !urlLanguage : urlLanguage === currentLanguage);
      if (alreadyCanonical) {
        button.closest("details")?.removeAttribute("open");
        return;
      }
      setLanguageInUrl(button.dataset.language);
      button.closest("details")?.removeAttribute("open");
    });
  });

  document.addEventListener("click", (event) => {
    document.querySelectorAll(".language-menu[open]").forEach((menu) => {
      if (!menu.contains(event.target)) menu.removeAttribute("open");
    });
  });

  window.addEventListener("popstate", () => {
    const language = new URLSearchParams(window.location.search).get("lang");
    applyLanguage(language);
  });

  window.HourFlowI18n = {
    get language() { return currentLanguage; },
    t(key) {
      return getValue(locales[currentLanguage], key) ?? getValue(locales.en, key) ?? "";
    }
  };

  applyLanguage(new URLSearchParams(window.location.search).get("lang"));
})();
