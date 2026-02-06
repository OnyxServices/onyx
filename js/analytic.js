// ================================
// GA4 CENTRALIZED EVENT TRACKER
// Onyx Transfer
// ================================

window.TrackEvent = function (eventName, params = {}) {
  if (typeof gtag !== "function") {
    console.warn("GA4 no está cargado");
    return;
  }

  gtag("event", eventName, {
    app_name: "Onyx Transfer",
    ...params,
  });
};

// ================================
// EVENTOS DE NEGOCIO
// ================================

window.GA_EVENTS = {
  startTransfer: () =>
    trackEvent("start_transfer", {
      category: "transfer",
    }),

  openTracking: () =>
    trackEvent("open_tracking", {
      category: "tracking",
    }),

  copyZelle: () =>
    trackEvent("copy_zelle_account", {
      category: "payment",
      method: "zelle",
    }),

  transferStep: (step) =>
    trackEvent("transfer_step", {
      step_number: step,
    }),

  calculateAmount: (usd) =>
    trackEvent("calculate_amount", {
      usd_amount: usd,
    }),

  openMap: () =>
    trackEvent("open_map_selector", {
      category: "location",
    }),

  confirmLocation: () => trackEvent("confirm_location"),

  uploadProof: () =>
    trackEvent("upload_payment_proof", {
      category: "payment",
    }),

  transferCompleted: () =>
    trackEvent("transfer_completed", {
      category: "conversion",
    }),

  transferAbandoned: (step) =>
    trackEvent("transfer_abandoned", {
      step_number: step,
    }),

  formError: (field) =>
    trackEvent("form_error", {
      field: field,
    }),
};
