/*!
 * Dashboard Kit 0.11.0 — optional JavaScript. No dependencies, no innerHTML, no eval:
 * compatible with a strict Content-Security-Policy (script-src 'self').
 *
 * It activates by itself through data-kit-* attributes:
 *   data-kit-theme-set="auto|light|dark"     button that sets the theme
 *   data-kit-fs-set="md|lg|xl"               button that sets the text size (normal · large · extra large)
 *   data-kit-fs-step="1|-1"                  button that makes the text larger or smaller by one step
 *   data-kit-reset                           button that resets theme, text and width
 *   data-kit-layout-set="boxed|fluid"        button that chooses centered or full-width content
 *   data-kit-layout-toggle                   button that switches between the two widths
 *   data-kit-sidebar-toggle                  button that opens the slide-in .kit-sidebar (small screens) or collapses it to icons only (large screens, choice remembered)
 *   data-kit-toggle="#id"                    button that opens/closes a .kit-pop
 *   data-kit-select                          on .kit-select: choice of a value; on a <select>: replaces it with the kit's menu (options: data-kit-search, -empty, -placeholder)
 *   data-kit-combo                           on .kit-combo: text field with a list of suggestions (options: data-kit-combo-max, -empty, -more)
 *   data-kit-split                           on .kit-split: Esc closes it; with data-kit-split-open="#id" (button outside), data-kit-split-close and
 *                                            data-kit-split-full (inside) the panel opens, closes and goes full width
 *   data-kit-file                            on .kit-file or .kit-dropzone: file field with type and size check (data-kit-file-max in MB,
 *                                            data-kit-file-dir for folders, data-kit-file-page to drop anywhere on the page)
 *   data-kit-code="html|js|css"              on <pre class="kit-code">: colors the code (without a language it guesses it); data-kit-code-copy adds the «Copy» button
 *   data-kit-accordion="single"              on .kit-accordion: only one <details> open at a time (without a value, each opens on its own)
 *   data-kit-sort                            on .kit-table: the headers (<th>) sort the rows (with ="multi", Shift or Ctrl/⌘ + click sorts by several columns; numbers, dates and text are recognized by themselves; data-kit-type and data-kit-value to force them, data-kit-nosort to exclude a column)
 *   data-kit-validate                        on a <form>: on submit checks the fields with the HTML rules, marks is-invalid, writes the messages in .kit-feedback-invalid and moves focus to the first error (="ok" also marks is-valid; messages with data-kit-msg and data-kit-msg-required|type|pattern|min|max|minlength|maxlength|step)
 *   data-kit-password                        on a button next to a password field: shows or hides the text
 *   data-kit-count="#field"                  on a text element: shows «n / maxlength» of the characters typed in the field
 *   data-kit-datepicker                      on <input type="date|datetime-local|time">: the kit's calendar (or time picker); written and read in the language's date order, the submitted value is ISO (data-kit-min, -max, -disable, -step; data-kit-timepicker for time only)
 *   data-kit-daterange                       on a container with two <input type="date"> (from, to): range with a two-month calendar and shortcuts (data-kit-presets)
 *   data-kit-meter                           on .kit-meter: measure against a limit; reads data-kit-value, -min (0), -max (100), -warn, -danger, -good="high" and writes width, ARIA and color (is-success|warning|danger)
 *   data-kit-fix="2|3|4"                     on .kit-table-fix: pins the first 2, 3 or 4 columns (the first alone is pinned by the class, without JavaScript)
 *   data-kit-filter="#table"                 on a text field: shows only the rows that contain all the words typed
 *   data-kit-page="N"                        on .kit-table: shows N rows at a time, with pagination below (data-kit-empty changes the «No results» text)
 *   (htmx)                                   fragments inserted by htmx initialize themselves (htmx:load event)
 *   data-kit-tabs                            on .kit-tabs: tabs with data-kit-panel="#id"
 *   data-kit-nav="#id"                       button (hamburger) that opens/closes the collapsible menu of a .kit-navbar
 *   data-kit-open="#dialogId"                opens a <dialog>
 *   data-kit-close                           inside a <dialog>, closes it
 *   data-kit-confirm="Question?"             on a button, link or form: asks for confirmation first (options: data-kit-confirm-text,
 *                                            -ok, -cancel, -danger, -type="text to type")
 *   data-kit-tip="text"                     tooltip (CSS only; with kit.js Esc hides it)
 *   data-kit-dismiss                         inside a .kit-alert, removes it ("kit:dismiss" event)
 *
 * API: window.Kit.theme.get()/set(), Kit.layout.get()/set()/toggle(), Kit.sidebar.get()/set()/toggle()/open()/close(), Kit.fontSize.get()/set()/step(), Kit.reset(), Kit.toast(text, options), Kit.toast.clear(), Kit.confirm(question, options), Kit.undo(text, options), Kit.split(element), Kit.file(element, options), Kit.progress(text, options), Kit.combo(element, options), Kit.select(element, options), Kit.code(element, options), Kit.highlight(text, language), Kit.barChart(element, options), Kit.lineChart(…), Kit.donut(…), Kit.sparkline(…), Kit.table(table, options), Kit.paginate(table, rows), Kit.i18n.lang(code), Kit.i18n.add(code, dictionary), Kit.accordion(element, options), Kit.meter(element, options), Kit.datepicker(field, options), Kit.daterange(container, options), Kit.validate(form), Kit.validate.reset(form), Kit.date.parse/format/today, Kit.init(root)
 * Events: "kit:change" (select, combobox), "kit:select" (bar, point or slice of a chart), "kit:tab" (tab), "kit:files" (files chosen or dropped), "kit:copy" (code copied), "kit:sort" (table sorted), "kit:filter" (table filtered), "kit:page" (table page changed), "kit:accordion" (accordion item opened or closed), "kit:invalid" (form with invalid fields), "kit:change" also for dates and times ({ value } o { from, to }), "kit:split" (panel opened, closed or full width), "kit:theme" (theme), "kit:layout" (width), "kit:sidebar" (sidebar collapsed, expanded, opened or closed), "kit:fs" (text size), "kit:reset" (settings reset), "kit:dismiss" (alert closed)
 */
(function () {
    "use strict";

    var KEY = "kit-theme";
    var root = document.documentElement;

    /* ---------- Languages (i18n) ----------
       All the texts kit.js writes by itself (buttons, ARIA labels, messages, calendar) come from a per-language dictionary.
       The language is that of <html lang> (English if missing); Kit.i18n.lang("it") sets it by hand. With "pt-BR" pt-BR is looked up first,
       then pt, then en: a dictionary can hold only what changes. Other languages: Kit.i18n.add("de", { cancel: "Abbrechen", … }).
       Every attribute or option (data-kit-*, opts.cancel, …) takes precedence over the dictionary. */
    var I18N = {
        en: {
            close: "Close", cancel: "Cancel", confirm: "Confirm", undo: "Undo",
            confirmTitle: "Are you sure?", confirmType: "To confirm, type ",
            comboToggle: "Show the list", comboMore: "{n} more results: keep typing to narrow down",
            noResults: "No results", search: "Search…", noData: "No data", total: "Total",
            chartLine: "Line chart", chartBar: "Bar chart", chartDonut: "Donut chart", trend: "Trend",
            copy: "Copy", copied: "Copied",
            file: { type: "{name}: file type not accepted ({accept}).", size: "{name}: larger than {max} MB.", count: "{name}: only one file can be chosen.", folder: "{name}: folders are not allowed.",
                none: "No file", many: "{n} files", pick: "Choose file…", pickDir: "Choose folder…", clear: "Remove selection", drop: "Drop here to upload" },
            table: { of: "of", prev: "Previous page", next: "Next page", page: "Page {n}", nav: "Pagination" },
            password: { show: "Show password", hide: "Hide password" },
            num: { dec: "." },
            date: {
                order: "mdy", sep: "/", first: 0,
                months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
                daysLong: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                presets: { today: "Today", yesterday: "Yesterday", "7": "Last 7 days", "30": "Last 30 days", "90": "Last 90 days", month: "This month", "last-month": "Last month", year: "This year", "last-year": "Last year" },
                t: {
                    open: "Open the calendar", openTime: "Choose the time", pickDate: "Choose the date", pickDateTime: "Choose date and time", pickTime: "Choose the time", pickRange: "Choose the period",
                    today: "Today", clear: "Clear", done: "Done", close: "Close",
                    prev: "Previous month", next: "Next month", prevYear: "Previous year", nextYear: "Next year", prevYears: "Previous years", nextYears: "Next years",
                    invalid: "Enter the date as {f}", invalidDT: "Enter date and time as {f}", invalidTime: "Enter the time as {f}",
                    min: "The value cannot be earlier than {d}", max: "The value cannot be later than {d}", unavailable: "This date is not available",
                    order: "The end date is earlier than the start date", from: "Choose the start date", to: "Choose the end date",
                    hour: "Hours", minute: "Minutes", phDate: "mm/dd/yyyy", phDT: "mm/dd/yyyy hh:mm", phTime: "hh:mm"
                }
            }
        },
        it: {
            close: "Chiudi", cancel: "Annulla", confirm: "Conferma", undo: "Annulla",
            confirmTitle: "Confermi l'azione?", confirmType: "Per confermare scrivi ",
            comboToggle: "Mostra l'elenco", comboMore: "Altri {n} risultati: continua a scrivere per restringere",
            noResults: "Nessun risultato", search: "Cerca…", noData: "Nessun dato", total: "Totale",
            chartLine: "Grafico a linee", chartBar: "Grafico a barre", chartDonut: "Grafico a ciambella", trend: "Andamento",
            copy: "Copia", copied: "Copiato",
            file: { type: "{name}: tipo di file non accettato ({accept}).", size: "{name}: supera i {max} MB.", count: "{name}: si può scegliere un solo file.", folder: "{name}: le cartelle non sono ammesse.",
                none: "Nessun file", many: "{n} file", pick: "Scegli file…", pickDir: "Scegli cartella…", clear: "Rimuovi la scelta", drop: "Rilascia qui per caricare" },
            table: { of: "di", prev: "Pagina precedente", next: "Pagina successiva", page: "Pagina {n}", nav: "Paginazione" },
            password: { show: "Mostra la password", hide: "Nascondi la password" },
            num: { dec: "," },
            date: {
                order: "dmy", sep: "/", first: 1,
                months: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
                days: ["lun", "mar", "mer", "gio", "ven", "sab", "dom"],
                daysLong: ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"],
                presets: { today: "Oggi", yesterday: "Ieri", "7": "Ultimi 7 giorni", "30": "Ultimi 30 giorni", "90": "Ultimi 90 giorni", month: "Questo mese", "last-month": "Mese scorso", year: "Quest'anno", "last-year": "Anno scorso" },
                t: {
                    open: "Apri il calendario", openTime: "Scegli l'ora", pickDate: "Scegli la data", pickDateTime: "Scegli data e ora", pickTime: "Scegli l'ora", pickRange: "Scegli il periodo",
                    today: "Oggi", clear: "Cancella", done: "Fatto", close: "Chiudi",
                    prev: "Mese precedente", next: "Mese successivo", prevYear: "Anno precedente", nextYear: "Anno successivo", prevYears: "Anni precedenti", nextYears: "Anni successivi",
                    invalid: "Scrivi la data come {f}", invalidDT: "Scrivi data e ora come {f}", invalidTime: "Scrivi l'ora come {f}",
                    min: "Il valore non può essere precedente a {d}", max: "Il valore non può essere successivo a {d}", unavailable: "Questa data non è disponibile",
                    order: "La data finale è precedente a quella iniziale", from: "Scegli la data di inizio", to: "Scegli la data di fine",
                    hour: "Ore", minute: "Minuti", phDate: "gg/mm/aaaa", phDT: "gg/mm/aaaa hh:mm", phTime: "hh:mm"
                }
            }
        }
    };
    var i18nLang = "", i18nCache = {};

    function i18nIsObj(v) { return v && typeof v === "object" && !Array.isArray(v); }
    function i18nMerge(to, from) {
        Object.keys(from).forEach(function (k) {
            if (i18nIsObj(from[k])) { if (!i18nIsObj(to[k])) to[k] = {}; i18nMerge(to[k], from[k]); }
            else to[k] = from[k];
        });
        return to;
    }
    function i18nCode() { return String(i18nLang || document.documentElement.lang || "en").toLowerCase().replace(/_/g, "-"); }
    function i18nPack() {
        var code = i18nCode();
        if (i18nCache[code]) return i18nCache[code];
        var base = code.split("-")[0], chain = ["en"], out = {};
        if (base !== "en") chain.push(base);
        if (code !== base) chain.push(code);
        chain.forEach(function (c) { if (I18N[c]) i18nMerge(out, I18N[c]); });
        i18nCache[code] = out;
        return out;
    }
    /* Reads an entry ("close", "file.type", "date.t.today") from the current language; {name} is replaced with vars.name. */
    function t(key, vars) {
        var v = i18nPack();
        String(key).split(".").forEach(function (k) { v = v == null ? v : v[k]; });
        if (v == null) return String(key);
        if (typeof v === "string" && vars) v = v.replace(/\{(\w+)\}/g, function (m, n) { return vars[n] !== undefined ? vars[n] : m; });
        return v;
    }
    var i18n = {
        lang: function (code) {
            if (code !== undefined) { i18nLang = code || ""; }
            return i18nCode();
        },
        add: function (code, dict) {
            code = String(code).toLowerCase().replace(/_/g, "-");
            I18N[code] = i18nMerge(I18N[code] || {}, dict || {});
            i18nCache = {};
        },
        t: t
    };

    /* ---------- Theme ---------- */
    function readStored() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }

    var theme = {
        get: function () {
            var v = readStored();
            return v === "light" || v === "dark" ? v : "auto";
        },
        set: function (v) {
            if (v !== "light" && v !== "dark") v = "auto";
            if (v === "auto") root.removeAttribute("data-theme");
            else root.setAttribute("data-theme", v);
            try {
                if (v === "auto") localStorage.removeItem(KEY);
                else localStorage.setItem(KEY, v);
            } catch (e) { /* storage not available: the theme only applies to this page */ }
            document.querySelectorAll("[data-kit-theme-set]").forEach(function (b) {
                var on = b.getAttribute("data-kit-theme-set") === v;
                // menu item (.kit-opt, role="menuitemradio"): aria-checked and check mark; normal button: aria-pressed
                if (b.classList.contains("kit-opt")) { b.setAttribute("aria-checked", String(on)); b.classList.toggle("is-on", on); }
                else b.setAttribute("aria-pressed", String(on));
            });
            root.dispatchEvent(new CustomEvent("kit:theme", { detail: v }));
        }
    };

    /* ---------- Text size: md (default), lg, xl ---------- */
    var FKEY = "kit-fs";
    var FS_STEPS = ["md", "lg", "xl"];

    function readFs() {
        try {
            var v = localStorage.getItem(FKEY);
            return FS_STEPS.indexOf(v) >= 0 ? v : null;
        } catch (e) { return null; }
    }

    function syncFsButtons() {
        var cur = fontSize.get(), i = FS_STEPS.indexOf(cur);
        document.querySelectorAll("[data-kit-fs-set]").forEach(function (b) {
            var on = b.getAttribute("data-kit-fs-set") === cur;
            if (b.classList.contains("kit-opt")) { b.setAttribute("aria-checked", String(on)); b.classList.toggle("is-on", on); }
            else b.setAttribute("aria-pressed", String(on));
        });
        document.querySelectorAll("[data-kit-fs-step]").forEach(function (b) {
            var d = parseInt(b.getAttribute("data-kit-fs-step"), 10) || 0;
            b.disabled = i + d < 0 || i + d >= FS_STEPS.length;
        });
    }

    var fontSize = {
        get: function () {
            var v = root.getAttribute("data-kit-fs");
            return FS_STEPS.indexOf(v) >= 0 ? v : "md";
        },
        set: function (v) {
            if (FS_STEPS.indexOf(v) < 0) v = "md";
            if (v === "md") root.removeAttribute("data-kit-fs");
            else root.setAttribute("data-kit-fs", v);
            try {
                if (v === "md") localStorage.removeItem(FKEY);
                else localStorage.setItem(FKEY, v);
            } catch (e) { /* storage not available: only applies to this page */ }
            syncFsButtons();
            root.dispatchEvent(new CustomEvent("kit:fs", { detail: v }));
        },
        step: function (d) {
            var i = FS_STEPS.indexOf(fontSize.get()) + (d < 0 ? -1 : 1);
            fontSize.set(FS_STEPS[Math.max(0, Math.min(FS_STEPS.length - 1, i))]);
        }
    };

    /* ---------- Content width: centered (boxed) or full width (fluid) ---------- */
    var LKEY = "kit-layout";
    var authoredLayout = root.getAttribute("data-layout") === "fluid" ? "fluid" : "boxed";   // the one written in the HTML

    function readLayout() {
        try {
            var v = localStorage.getItem(LKEY);
            return v === "boxed" || v === "fluid" ? v : null;
        } catch (e) { return null; }
    }

    function syncLayoutButtons() {
        var cur = layout.get();
        document.querySelectorAll("[data-kit-layout-set]").forEach(function (b) {
            b.setAttribute("aria-pressed", String(b.getAttribute("data-kit-layout-set") === cur));
        });
        document.querySelectorAll("[data-kit-layout-toggle]").forEach(function (b) {
            b.setAttribute("aria-pressed", String(cur === "fluid"));
        });
    }

    var layout = {
        get: function () {
            return root.getAttribute("data-layout") === "fluid" ? "fluid" : "boxed";
        },
        set: function (v) {
            v = v === "fluid" ? "fluid" : "boxed";
            root.setAttribute("data-layout", v);
            try { localStorage.setItem(LKEY, v); } catch (e) { /* storage not available: only applies to this page */ }
            syncLayoutButtons();
            root.dispatchEvent(new CustomEvent("kit:layout", { detail: v }));
        },
        toggle: function () {
            layout.set(layout.get() === "fluid" ? "boxed" : "fluid");
        }
    };

    /* ---------- Sidebar: slide-in on small screens, compact (icons only) on large ones ----------
       <aside class="kit-sidebar"> inside .kit-app. The data-kit-sidebar-toggle button (opt. ="#id") opens/closes it when it slides in
       and collapses/expands it when inline. The compact state is <html data-kit-sidebar="collapsed|expanded"> and is remembered. */
    var SIDEKEY = "kit-sidebar";
    var authoredSide = root.getAttribute("data-kit-sidebar") === "collapsed" ? "collapsed" : "expanded";
    var sideOpener = null;       // who opened the slide-in sidebar: focus goes back there on close

    function readSide() {
        try {
            var v = localStorage.getItem(SIDEKEY);
            return v === "collapsed" || v === "expanded" ? v : null;
        } catch (e) { return null; }
    }
    function sideBar(sel) { return document.querySelector(sel || ".kit-sidebar"); }
    // Slide-in = out of the flow (position: fixed); inline = sticky in the column.
    function sideDrawer(sb) { return getComputedStyle(sb).position === "fixed"; }

    function sideSync() {
        var collapsed = root.getAttribute("data-kit-sidebar") === "collapsed";
        document.querySelectorAll(".kit-sidebar").forEach(function (sb) {
            var drawer = sideDrawer(sb);
            var open = sb.classList.contains("is-open");
            if (open && !drawer) { sb.classList.remove("is-open"); open = false; }   // the window got wider
            // the rest of the page is unreachable while the slide-in sidebar is open
            Array.prototype.forEach.call(sb.parentNode.children, function (c) {
                if (c !== sb) { if (open) c.setAttribute("inert", ""); else c.removeAttribute("inert"); }
            });
            // compact: the texts disappear (display: none), so each item carries its name as aria-label
            sb.querySelectorAll(SIDETIP).forEach(function (a) {
                if (collapsed && !drawer) {
                    if (!a.hasAttribute("aria-label") && !a.hasAttribute("aria-labelledby")) {
                        var label = sideLabel(a);
                        if (label) { a.setAttribute("aria-label", label); a.setAttribute("data-kit-autolabel", ""); }
                    }
                } else if (a.hasAttribute("data-kit-autolabel")) {
                    a.removeAttribute("aria-label");
                    a.removeAttribute("data-kit-autolabel");
                }
            });
            if (!collapsed || drawer) sideTipHide();
            document.querySelectorAll("[data-kit-sidebar-toggle]").forEach(function (b) {
                var target = sideBar(b.getAttribute("data-kit-sidebar-toggle"));
                if (target !== sb) return;
                b.setAttribute("aria-expanded", String(drawer ? open : !collapsed));
            });
        });
    }

    /* Compact sidebar: the name of each item appears right next to the icon (mouse and keyboard). It is an element outside the
       sidebar, in position: fixed, because the sidebar body scrolls and would clip a CSS tooltip. */
    var SIDETIP = ".kit-side-link, .kit-side-user, .kit-side-tools .kit-btn, .kit-sidebar-head .kit-brand";
    var sideTipEl = null, sideTipFor = null;

    function sideLabel(el) {
        var tx = el.querySelector(".kit-side-text, .kit-side-user-text > :first-child");
        var label = tx ? tx.textContent.trim() : (el.getAttribute("aria-label") || el.getAttribute("data-kit-label") || el.getAttribute("title") || "").trim();
        var badge = el.querySelector(".kit-badge");
        if (tx && badge && badge.textContent.trim()) label += " (" + badge.textContent.trim() + ")";
        return label;
    }
    function sideTipHide() {
        if (sideTipEl) { sideTipEl.classList.remove("is-on"); sideTipEl.hidden = true; }
        if (sideTipFor && sideTipFor.hasAttribute("data-kit-title")) {   // the native title removed to avoid two hints
            sideTipFor.setAttribute("title", sideTipFor.getAttribute("data-kit-title"));
            sideTipFor.removeAttribute("data-kit-title");
        }
        sideTipFor = null;
    }
    function sideTipShow(el) {
        var sb = el.closest(".kit-sidebar");
        if (!sb || root.getAttribute("data-kit-sidebar") !== "collapsed" || sideDrawer(sb)) return;
        if (el.closest(".kit-pop") || el.getAttribute("aria-expanded") === "true") return;
        var label = sideLabel(el);
        if (!label) return;
        if (sideTipFor === el) return;
        sideTipHide();
        sideTipFor = el;
        if (el.hasAttribute("title")) { el.setAttribute("data-kit-title", el.getAttribute("title")); el.removeAttribute("title"); }
        if (!sideTipEl) {
            sideTipEl = mkEl("div", "kit-side-tip");
            sideTipEl.setAttribute("role", "tooltip");
            document.body.appendChild(sideTipEl);
        }
        sideTipEl.textContent = label;
        sideTipEl.hidden = false;
        var r = el.getBoundingClientRect();
        sideTipEl.style.left = Math.round(r.right) + "px";      // the space toward the icon is the transparent border of the hint
        sideTipEl.style.top = Math.round(r.top + r.height / 2) + "px";
        void sideTipEl.offsetWidth;                 // starts the fade
        sideTipEl.classList.add("is-on");
    }
    document.addEventListener("mouseover", function (e) {
        var t = e.target instanceof Element ? e.target.closest(SIDETIP) : null;
        if (t && t.closest(".kit-sidebar")) sideTipShow(t); else if (sideTipFor) sideTipHide();
    });
    document.addEventListener("focusin", function (e) {
        var t = e.target instanceof Element ? e.target.closest(SIDETIP) : null;
        if (t && t.closest(".kit-sidebar") && t.matches(":focus-visible")) sideTipShow(t); else if (sideTipFor) sideTipHide();
    });
    document.addEventListener("focusout", function () { if (sideTipFor) sideTipHide(); });
    document.addEventListener("mouseleave", function () { if (sideTipFor) sideTipHide(); });
    document.addEventListener("click", function () { if (sideTipFor) sideTipHide(); });
    document.addEventListener("scroll", function () { if (sideTipFor) sideTipHide(); }, true);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && sideTipFor) sideTipHide(); });

    function sideNotify(sb) {
        sb.dispatchEvent(new CustomEvent("kit:sidebar", { bubbles: true, detail: { collapsed: sidebar.get() === "collapsed", open: sb.classList.contains("is-open") } }));
    }

    var sidebar = {
        get: function () { return root.getAttribute("data-kit-sidebar") === "collapsed" ? "collapsed" : "expanded"; },
        set: function (v) {
            v = v === "collapsed" ? "collapsed" : "expanded";
            root.setAttribute("data-kit-sidebar", v);
            try { localStorage.setItem(SIDEKEY, v); } catch (e) { /* storage not available: only applies to this page */ }
            sideSync();
            var sb = sideBar();
            if (sb) sideNotify(sb);
        },
        toggle: function () { sidebar.set(sidebar.get() === "collapsed" ? "expanded" : "collapsed"); },
        // Slide-in sidebar. open(opener) remembers who opened it to give focus back.
        open: function (sel, opener) {
            var sb = sideBar(sel);
            if (!sb || !sideDrawer(sb) || sb.classList.contains("is-open")) return;
            sideOpener = opener || document.activeElement;
            sb.classList.add("is-open");
            sideSync();
            sb.tabIndex = -1;
            sb.focus({ preventScroll: true });
            sideNotify(sb);
        },
        close: function (sel) {
            var sb = sideBar(sel);
            if (!sb || !sb.classList.contains("is-open")) return;
            sb.classList.remove("is-open");
            sideSync();
            if (sideOpener && sideOpener.isConnected && sideOpener.focus) sideOpener.focus({ preventScroll: true });
            sideOpener = null;
            sideNotify(sb);
        }
    };

    /* ---------- Reset: automatic theme, normal text, width written in the HTML ---------- */
    function reset() {
        theme.set("auto");
        fontSize.set("md");
        try { localStorage.removeItem(LKEY); } catch (e) { /* storage not available */ }
        root.setAttribute("data-layout", authoredLayout);
        syncLayoutButtons();
        root.dispatchEvent(new CustomEvent("kit:layout", { detail: authoredLayout }));
        try { localStorage.removeItem(SIDEKEY); } catch (e) { /* storage not available */ }
        root.setAttribute("data-kit-sidebar", authoredSide);
        sideSync();
        root.dispatchEvent(new CustomEvent("kit:reset"));
    }

    // Inside a settings panel (.kit-settings) the menu stays open: several things are changed in a row.
    function keepOpen(btn) { return !!btn.closest(".kit-settings"); }

    /* ---------- Toast ----------
       Kit.toast("text")  or  Kit.toast("text", { type, title, duration, position, action, closable, progress, onClose })
       (the second argument can also be just the duration in ms). Returns { close() }.
       Built with createElement/textContent: the text is never interpreted as HTML. */
    var TOAST_MAX = 6;                       // beyond this number the oldest closes
    var TOAST_POS = { "bottom": 1, "top": 1, "bottom-start": 1, "bottom-end": 1, "top-start": 1, "top-end": 1 };
    var TOAST_ICON = { info: "i-info", success: "i-ok", warning: "i-warn", danger: "i-error" };

    function toastBox(pos) {
        var box = document.querySelector('.kit-toasts[data-pos="' + pos + '"]');
        if (!box) {
            box = document.createElement("div");
            box.className = "kit-toasts";
            box.setAttribute("data-pos", pos);
            document.body.appendChild(box);
        }
        return box;
    }

    // When a toast enters or leaves, the others slide to their new place instead of jumping (FLIP: the position is measured
    // before, the DOM is changed, then each neighbor starts from the old position and arrives at the new one).
    function flip(box, change) {
        var items = Array.prototype.filter.call(box.children, function (e) { return !e.classList.contains("is-leaving"); });
        // Position on screen without the transitions in progress: top of the container + position in the container
        // (in bottom-anchored containers it is the container that moves, not the children).
        function y(e) { return box.getBoundingClientRect().top + e.offsetTop; }
        var before = items.map(y);
        change();
        if (!box.animate || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
        items.forEach(function (e, i) {
            if (!e.isConnected || e.classList.contains("is-leaving")) return;
            var d = before[i] - y(e);
            if (d) e.animate([{ transform: "translateY(" + d + "px)" }, { transform: "translateY(0)" }], { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" });
        });
    }

    function toast(text, opts) {
        if (typeof opts === "number") opts = { duration: opts };
        opts = opts || {};
        var type = TOAST_ICON[opts.type] ? opts.type : "neutral";
        var pos = TOAST_POS[opts.position] ? opts.position : "bottom";
        var duration = typeof opts.duration === "number" ? opts.duration : 4000;     // 0 = stays until closed
        var closable = opts.closable !== undefined ? !!opts.closable : (duration === 0 || !!opts.action);
        var box = toastBox(pos);

        var el = document.createElement("div");
        el.className = "kit-toast" + (type !== "neutral" ? " kit-toast-" + type : "");
        el.setAttribute("role", type === "danger" || type === "warning" ? "alert" : "status");

        // The icon only exists if the sprite (kit-icons.js or yours) defines the symbol.
        if (TOAST_ICON[type] && document.getElementById(TOAST_ICON[type])) {
            var NS = "http://www.w3.org/2000/svg";
            var svg = document.createElementNS(NS, "svg");
            svg.setAttribute("class", "kit-icon kit-toast-icon");
            svg.setAttribute("aria-hidden", "true");
            var use = document.createElementNS(NS, "use");
            use.setAttribute("href", "#" + TOAST_ICON[type]);
            svg.appendChild(use);
            el.appendChild(svg);
        }

        var body = document.createElement("div");
        body.className = "kit-toast-body";
        if (opts.title) {
            var t = document.createElement("strong");
            t.className = "kit-toast-title";
            t.textContent = String(opts.title);
            body.appendChild(t);
        }
        var msg = document.createElement("span");
        msg.textContent = String(text);
        body.appendChild(msg);
        el.appendChild(body);

        var timer = null, closed = false;
        var onClose = typeof opts.onClose === "function" ? opts.onClose : null;     // called once, when the toast leaves
        // The leaving toast fades out of the flow (position: absolute, where it is): the neighbors move at once.
        function leave() {
            if (closed) return;
            closed = true;
            clearTimeout(timer);
            if (onClose) setTimeout(onClose, 0);
            if (barAnim) barAnim.pause();
            // Leaving the flow the container shrinks and (if anchored at the bottom) moves: the toast must therefore be
            // anchored to where it is on the screen now, not to its position inside the container.
            var box = el.parentNode, screenTop = box.getBoundingClientRect().top + el.offsetTop;
            el.style.left = el.offsetLeft + "px";
            el.style.width = el.offsetWidth + "px";
            el.classList.remove("is-on");
            el.classList.add("is-leaving");
            el.style.top = (screenTop - box.getBoundingClientRect().top) + "px";
            setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 250);
        }
        function close() {
            if (closed || !el.parentNode) return;
            flip(el.parentNode, leave);
        }
        el.kitLeave = leave;
        el.kitClose = close;

        if (opts.action && opts.action.label) {
            var act = document.createElement("button");
            act.type = "button";
            act.className = "kit-toast-action";
            act.textContent = String(opts.action.label);
            act.addEventListener("click", function () {
                if (typeof opts.action.onClick === "function") opts.action.onClick();
                close();
            });
            el.appendChild(act);
        }
        if (closable) {
            var x = document.createElement("button");
            x.type = "button";
            x.className = "kit-toast-close";
            x.setAttribute("aria-label", t("close"));
            x.textContent = "×";
            x.addEventListener("click", close);
            el.appendChild(x);
        }

        // The timer stops while the mouse or focus is on the toast, so there is time to read and use it.
        // The bar at the bottom shortens until it closes (option progress: false removes it). When the time
        // stops and restarts from the beginning, the bar also fills up again and restarts.
        var bar = null, barAnim = null;
        if (duration > 0 && opts.progress !== false) {
            bar = document.createElement("span");
            bar.className = "kit-toast-bar";
            bar.setAttribute("aria-hidden", "true");
            el.appendChild(bar);
        }
        function runBar() {
            if (!bar || !bar.animate) return;
            if (barAnim) barAnim.cancel();
            barAnim = bar.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: duration, easing: "linear", fill: "forwards" });
        }
        function stopBar() { if (barAnim) { barAnim.cancel(); barAnim = null; } }
        function arm() { if (duration > 0 && !closed) { clearTimeout(timer); timer = setTimeout(close, duration); runBar(); } }
        function hold() { clearTimeout(timer); stopBar(); }
        el.addEventListener("mouseenter", hold);
        el.addEventListener("mouseleave", arm);
        el.addEventListener("focusin", hold);
        el.addEventListener("focusout", arm);

        flip(box, function () {
            // beyond TOAST_MAX the oldest leaves (with the same fade)
            var live = Array.prototype.filter.call(box.children, function (e) { return !e.classList.contains("is-leaving"); });
            while (live.length >= TOAST_MAX) { var old = live.shift(); if (old.kitLeave) old.kitLeave(); else box.removeChild(old); }
            box.appendChild(el);
            // On short screens six toasts may not fit: the oldest leaves until the stack fits in the window.
            live.push(el);
            while (live.length > 1 && box.offsetHeight > window.innerHeight) { var o = live.shift(); if (o.kitLeave) o.kitLeave(); else box.removeChild(o); }
        });
        void el.offsetWidth;              // forces the style computation: without it, the enter transition does not start
        el.classList.add("is-on");
        arm();
        return { close: close };
    }

    /* ---------- Undo instead of asking for confirmation ----------
       Kit.undo("Invoice deleted", { onUndo, onCommit, duration, label, type, position })
       The action is considered done at once in the interface; onCommit (the real, final one) runs when the toast
       disappears without the user having pressed "Undo" (expiry, closing with the ×, page closed or reloaded).
       Returns { undo(), commit() }. */
    function undo(text, opts) {
        opts = opts || {};
        var done = false, handle = null;
        function commit() {
            if (done) return;
            done = true;
            window.removeEventListener("pagehide", commit);
            if (typeof opts.onCommit === "function") opts.onCommit();
        }
        function undoNow() {
            if (done) return;
            done = true;
            window.removeEventListener("pagehide", commit);
            if (typeof opts.onUndo === "function") opts.onUndo();
        }
        window.addEventListener("pagehide", commit);
        handle = toast(text, {
            type: opts.type,
            position: opts.position,
            duration: typeof opts.duration === "number" ? opts.duration : 6000,
            action: { label: opts.label || t("undo"), onClick: undoNow },
            onClose: commit
        });
        return { undo: function () { undoNow(); handle.close(); }, commit: function () { commit(); handle.close(); } };
    }

    // Kit.toast.clear(): closes all open toasts
    toast.clear = function () {
        document.querySelectorAll(".kit-toast").forEach(function (el) { if (el.kitClose) el.kitClose(); else el.remove(); });
    };

    /* ---------- Confirm ----------
       Kit.confirm("Delete 12 invoices?", { text, confirm, cancel, danger, type }) → Promise<boolean>
       A modal <dialog> created on the fly (role="alertdialog"): Esc, a click on the backdrop and "Cancel" give false.
       With danger the confirm button is red and focus starts on "Cancel", so a careless Enter does no harm.
       With type: "text" the user must type that text to enable the confirmation (focus starts on the field). */
    var confirmSeq = 0;
    function mkEl(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text !== undefined) n.textContent = text;
        return n;
    }

    function confirmDialog(title, opts) {
        if (typeof opts === "string") opts = { text: opts };
        opts = opts || {};
        var danger = !!opts.danger, typed = opts.type ? String(opts.type) : "";
        var id = "kit-confirm-" + (++confirmSeq);

        var dlg = mkEl("dialog", "kit-dialog kit-confirm" + (danger ? " kit-confirm-danger" : ""));
        dlg.setAttribute("role", "alertdialog");
        dlg.setAttribute("aria-labelledby", id + "-t");

        var body = mkEl("div", "kit-card-body");
        var iconId = danger ? "i-warn" : "i-info";
        if (document.getElementById(iconId)) {
            var NS = "http://www.w3.org/2000/svg";
            var wrap = mkEl("span", "kit-confirm-icon");
            var svg = document.createElementNS(NS, "svg");
            svg.setAttribute("class", "kit-icon");
            svg.setAttribute("aria-hidden", "true");
            var use = document.createElementNS(NS, "use");
            use.setAttribute("href", "#" + iconId);
            svg.appendChild(use);
            wrap.appendChild(svg);
            body.appendChild(wrap);
        }
        var txt = mkEl("div", "kit-confirm-text");
        var h = mkEl("strong", "kit-confirm-title", String(title || t("confirmTitle")));
        h.id = id + "-t";
        txt.appendChild(h);
        if (opts.text) {
            var p = mkEl("p", "", String(opts.text));
            p.id = id + "-d";
            txt.appendChild(p);
            dlg.setAttribute("aria-describedby", id + "-d");
        }
        var input = null;
        if (typed) {
            var lab = mkEl("label", "kit-field");
            lab.appendChild(document.createTextNode(t("confirmType")));
            lab.appendChild(mkEl("b", "", typed));
            input = mkEl("input", "kit-input");
            input.type = "text";
            input.autocomplete = "off";
            input.spellcheck = false;
            input.setAttribute("autocapitalize", "off");
            lab.appendChild(input);
            txt.appendChild(lab);
        }
        body.appendChild(txt);
        dlg.appendChild(body);

        var foot = mkEl("div", "kit-card-foot");
        var cancel = mkEl("button", "kit-btn", String(opts.cancel || t("cancel")));
        cancel.type = "button";
        var ok = mkEl("button", "kit-btn " + (danger ? "kit-btn-danger-solid" : "kit-btn-primary"), String(opts.confirm || t("confirm")));
        ok.type = "button";
        if (typed) ok.disabled = true;
        foot.appendChild(cancel);
        foot.appendChild(ok);
        dlg.appendChild(foot);

        // focus starts on the field, on "Cancel" if the action is dangerous, otherwise on the confirmation
        (input || (danger ? cancel : ok)).setAttribute("autofocus", "");

        return new Promise(function (resolve) {
            cancel.addEventListener("click", function () { dlg.close("cancel"); });
            ok.addEventListener("click", function () { dlg.close("ok"); });
            if (input) {
                input.addEventListener("input", function () { ok.disabled = input.value.trim() !== typed; });
                input.addEventListener("keydown", function (e) {
                    if (e.key === "Enter") { e.preventDefault(); if (!ok.disabled) ok.click(); }
                });
            }
            dlg.addEventListener("close", function () {
                resolve(dlg.returnValue === "ok");
                setTimeout(function () { if (dlg.parentNode) dlg.parentNode.removeChild(dlg); }, 300);   // after the exit animation
            });
            document.body.appendChild(dlg);
            dlg.showModal();
        });
    }

    // data-kit-confirm: confirmation is asked before any other action of the element (your click handlers too).
    var passing = null;   // the element that has just been confirmed: its click or submit must be let through

    function confirmFor(el) {
        var a = function (n) { return el.getAttribute("data-kit-confirm" + n); };
        return confirmDialog(a("") || undefined, {
            text: a("-text"),
            confirm: a("-ok"),
            cancel: a("-cancel"),
            danger: el.hasAttribute("data-kit-confirm-danger"),
            type: a("-type")
        });
    }

    document.addEventListener("click", function (e) {
        var t = e.target instanceof Element && e.target.closest("[data-kit-confirm]");
        if (!t || t.tagName === "FORM" || t === passing) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        confirmFor(t).then(function (yes) {
            if (!yes) return;
            passing = t;
            try { t.click(); } finally { passing = null; }
        });
    }, true);

    document.addEventListener("submit", function (e) {
        var f = e.target;
        if (!(f instanceof HTMLFormElement) || !f.hasAttribute("data-kit-confirm") || f === passing) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        var sub = e.submitter;
        confirmFor(f).then(function (yes) {
            if (!yes) return;
            passing = f;
            try { f.requestSubmit(sub || undefined); } finally { passing = null; }
        });
    }, true);

    /* ---------- Popover ---------- */
    var openPop = null;

    function setPop(pop, btn, open) {
        pop.hidden = !open;
        if (btn) {
            btn.setAttribute("aria-expanded", String(open));
            if (!open) btn.removeAttribute("aria-activedescendant");
        }
        openPop = open ? { pop: pop, btn: btn } : null;
    }

    function closePop(returnFocus) {
        if (!openPop) return;
        var p = openPop;
        setPop(p.pop, p.btn, false);
        if (returnFocus && p.btn) p.btn.focus();
    }

    function togglePop(btn, pop) {
        var wasOpen = !pop.hidden;
        closePop(false);
        if (!wasOpen) {
            setPop(pop, btn, true);
            var first = pop.querySelector(".kit-opt.is-on:not([aria-disabled='true']), .kit-opt:not([aria-disabled='true'])");
            if (first) first.classList.add("is-active");
            pop.tabIndex = -1;
            pop.focus({ preventScroll: true });
        }
    }

    /* ---------- Keyboard navigation in options ---------- */
    function options(pop) {
        // disabled items (aria-disabled) are skipped with the arrows
        return Array.prototype.slice.call(pop.querySelectorAll(".kit-opt:not([aria-disabled='true'])"));
    }

    function moveActive(pop, dir) {
        var list = options(pop);
        if (!list.length) return;
        var i = list.findIndex(function (o) { return o.classList.contains("is-active"); });
        list.forEach(function (o) { o.classList.remove("is-active"); });
        i = i < 0 ? (dir > 0 ? 0 : list.length - 1) : (i + dir + list.length) % list.length;
        list[i].classList.add("is-active");
        list[i].scrollIntoView({ block: "nearest" });
        // in the combobox focus stays in the field: the active item is signaled with aria-activedescendant
        if (openPop && openPop.btn && openPop.btn.getAttribute("role") === "combobox" && list[i].id) openPop.btn.setAttribute("aria-activedescendant", list[i].id);
    }

    function chooseOption(opt) {
        var pop = opt.closest(".kit-pop");
        var ns = selByWrap.get(opt.closest("[data-kit-native]"));
        if (ns) { nativeChoose(ns, opt); return; }
        var cb = opt.closest("[data-kit-combo]");
        if (cb) { comboChoose(cb, opt); closePop(true); return; }
        var sel = opt.closest("[data-kit-select]");
        if (sel) {
            Array.prototype.forEach.call(pop.querySelectorAll(".kit-opt"), function (o) {
                var on = o === opt;
                o.classList.toggle("is-on", on);
                o.setAttribute("aria-selected", String(on));
            });
            var label = sel.querySelector(".kit-select-value");
            var text = opt.querySelector(".kit-opt-text b");
            if (label) label.textContent = (text || opt).textContent.trim();
            sel.dataset.value = opt.dataset.value || "";
            sel.dispatchEvent(new CustomEvent("kit:change", { bubbles: true, detail: { value: sel.dataset.value } }));
        }
        closePop(true);
    }

    /* ---------- Combobox: text field with a list of suggestions ----------
       <div class="kit-combo" data-kit-combo><input class="kit-input"></div>
       Items are given with Kit.combo(el, { items }) or as .kit-opt inside a .kit-pop already written in the HTML. */
    var comboState = new WeakMap();
    var comboUid = 0;

    function normItem(x) {
        if (x !== null && typeof x === "object") {
            var label = x.label != null ? String(x.label) : String(x.value);
            return { value: x.value != null ? String(x.value) : label, label: label, hint: x.hint ? String(x.hint) : "" };
        }
        return { value: String(x), label: String(x), hint: "" };
    }

    function comboRender(st) {
        var q = st.input.value.trim().toLowerCase();
        var src = typeof st.items === "function" ? st.items(q) : st.items;
        var all = (src || []).map(normItem);
        var hit = (q && st.filter) ? all.filter(function (i) { return (i.label + " " + i.hint + " " + i.value).toLowerCase().indexOf(q) >= 0; }) : all;
        st.pop.textContent = "";
        hit.slice(0, st.max).forEach(function (i, n) {
            var o = mkEl("div", "kit-opt");
            o.id = st.id + "-" + n;
            o.setAttribute("role", "option");
            o.setAttribute("aria-selected", String(i.value === st.input.value));
            o.dataset.value = i.value;
            var box = mkEl("span", "kit-opt-text");
            box.appendChild(mkEl("b", "", i.label));
            if (i.hint) box.appendChild(mkEl("small", "", i.hint));
            o.appendChild(box);
            st.pop.appendChild(o);
        });
        if (hit.length > st.max) st.pop.appendChild(mkEl("div", "kit-pop-empty", st.more.replace("{n}", String(hit.length - st.max))));
        if (!hit.length && st.empty) st.pop.appendChild(mkEl("div", "kit-pop-empty", st.empty));
        var first = st.pop.querySelector(".kit-opt");
        if (first && st.autoActive) first.classList.add("is-active");
        return st.pop.childNodes.length > 0;
    }

    function comboOpen(st) {
        if (!comboRender(st)) { if (!st.pop.hidden) closePop(false); return; }
        if (st.pop.hidden) { closePop(false); setPop(st.pop, st.input, true); }
        var a = st.pop.querySelector(".kit-opt.is-active");
        if (a) st.input.setAttribute("aria-activedescendant", a.id); else st.input.removeAttribute("aria-activedescendant");
    }

    function comboChoose(wrap, opt) {
        var st = comboState.get(wrap);
        if (!st) return;
        var b = opt.querySelector(".kit-opt-text b");
        st.choosing = true;
        st.input.value = opt.dataset.value || "";
        // the "input" event tells whoever listens to the field that the value has changed
        st.input.dispatchEvent(new Event("input", { bubbles: true }));
        st.choosing = false;
        wrap.dispatchEvent(new CustomEvent("kit:change", { bubbles: true, detail: { value: st.input.value, label: (b || opt).textContent.trim() } }));
    }

    function combo(target, opts) {
        var wrap = typeof target === "string" ? document.querySelector(target) : target;
        if (!wrap) return null;
        if (wrap.matches("input")) {
            var inp0 = wrap;
            wrap = mkEl("div", "kit-combo");
            inp0.parentNode.insertBefore(wrap, inp0);
            wrap.appendChild(inp0);
        }
        opts = opts || {};
        var st = comboState.get(wrap);
        if (st) {
            if (opts.items) st.items = opts.items;
            return st.api;
        }
        wrap.classList.add("kit-combo");
        wrap.setAttribute("data-kit-combo", "");
        var d = wrap.dataset;
        var input = wrap.querySelector("input");
        var pop = wrap.querySelector(".kit-pop");
        if (!input) return null;
        var items = opts.items;
        if (!items && pop) {
            items = Array.prototype.map.call(pop.querySelectorAll(".kit-opt"), function (o) {
                var b = o.querySelector("b"), s = o.querySelector("small");
                var label = (b || o).textContent.trim();
                return { value: o.dataset.value || label, label: label, hint: s ? s.textContent.trim() : "" };
            });
        }
        if (!pop) { pop = mkEl("div", "kit-pop"); wrap.appendChild(pop); }
        pop.hidden = true;
        pop.setAttribute("role", "listbox");
        var id = "kit-combo-" + (++comboUid);
        pop.id = pop.id || id + "-list";
        input.setAttribute("role", "combobox");
        input.setAttribute("aria-autocomplete", "list");
        input.setAttribute("aria-expanded", "false");
        input.setAttribute("aria-controls", pop.id);
        input.setAttribute("autocomplete", "off");
        var chev = wrap.querySelector(".kit-combo-btn");
        if (!chev) {
            chev = mkEl("button", "kit-combo-btn");
            chev.type = "button";
            chev.tabIndex = -1;
            chev.setAttribute("aria-label", opts.buttonLabel || d.kitComboLabel || t("comboToggle"));
            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("class", "kit-icon");
            var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
            use.setAttribute("href", "#i-chev");
            svg.appendChild(use);
            chev.appendChild(svg);
            wrap.insertBefore(chev, pop);
        }
        st = {
            input: input, pop: pop, id: id, items: items || [], choosing: false,
            max: opts.max || parseInt(d.kitComboMax, 10) || 50,
            filter: opts.filter !== false,
            autoActive: opts.autoActive !== false,
            empty: opts.empty !== undefined ? opts.empty : (d.kitComboEmpty || t("noResults")),
            more: opts.more || d.kitComboMore || t("comboMore")
        };
        st.api = {
            setItems: function (list) { st.items = list; if (!pop.hidden) comboOpen(st); },
            open: function () { input.focus(); comboOpen(st); },
            close: function () { if (!pop.hidden) closePop(false); }
        };
        comboState.set(wrap, st);

        input.addEventListener("input", function () { if (!st.choosing) comboOpen(st); });
        input.addEventListener("keydown", function (e) {
            if ((e.key === "ArrowDown" || e.key === "ArrowUp") && pop.hidden) {
                e.preventDefault();
                e.stopPropagation();   // otherwise the arrow would count twice (opens and moves)
                comboOpen(st);
            }
        });
        chev.addEventListener("mousedown", function (e) { e.preventDefault(); });
        chev.addEventListener("click", function () {
            if (!pop.hidden) closePop(false);
            else { input.focus(); comboOpen(st); }
        });
        // the mouse on the items must not take focus away from the field
        pop.addEventListener("mousedown", function (e) { e.preventDefault(); });
        wrap.addEventListener("focusout", function (e) {
            if (!wrap.contains(e.relatedTarget) && openPop && openPop.pop === pop) closePop(false);
        });
        return st.api;
    }

    /* ---------- Native select: <select data-kit-select> with the kit's menu ----------
       The <select> remains the data source (value, form, required, 'change'); the kit puts a button and menu next to it.
       Groups (<optgroup>), sub-text (data-kit-hint) and, beyond 20 items, a search field in the menu.
       After changing value, items or disabled by hand: api.sync(). Kit.select(el, { search, empty, placeholder }) does the same from JavaScript. */
    var selByWrap = new WeakMap();
    var selByNative = new WeakMap();
    var selUid = 0;

    function mkIcon(name, cls) {
        var svg = document.createElementNS(SVG_NS, "svg");
        svg.setAttribute("class", cls || "kit-icon");
        svg.setAttribute("aria-hidden", "true");
        var use = document.createElementNS(SVG_NS, "use");
        use.setAttribute("href", "#i-" + name);
        svg.appendChild(use);
        return svg;
    }

    function nativeItems(sel) {
        var out = [];
        function one(o, off) {
            if (o.hidden) return;
            out.push({ value: o.value, label: o.textContent.trim(), short: o.getAttribute("data-kit-short") || "", hint: o.getAttribute("data-kit-hint") || "", disabled: off || o.disabled });
        }
        Array.prototype.forEach.call(sel.children, function (c) {
            if (c.tagName === "OPTGROUP") {
                out.push({ group: c.label });
                Array.prototype.forEach.call(c.children, function (o) { one(o, c.disabled); });
            } else if (c.tagName === "OPTION") one(c, false);
        });
        return out;
    }

    function nativeSync(st) {
        var o = st.sel.selectedOptions[0];
        var t = o ? (o.getAttribute("data-kit-short") || o.textContent.trim()) : "";
        st.value.textContent = t;
        st.btn.classList.toggle("is-empty", !o || o.value === "");
        st.btn.disabled = st.sel.disabled;
    }

    function nativeList(st) {
        var q = st.q.trim().toLowerCase(), cur = st.sel.value, head = null, shown = 0, n = 0;
        st.list.textContent = "";
        nativeItems(st.sel).forEach(function (x) {
            if (x.group !== undefined) { head = x.group; return; }
            if (q && (x.label + " " + x.hint).toLowerCase().indexOf(q) < 0) return;
            if (head !== null) { st.list.appendChild(mkEl("div", "kit-pop-group", head)); head = null; }
            var on = x.value === cur;
            var o = mkEl("div", "kit-opt" + (on ? " is-on" : ""));
            o.id = st.id + "-" + (n++);
            o.setAttribute("role", "option");
            o.setAttribute("aria-selected", String(on));
            if (x.disabled) o.setAttribute("aria-disabled", "true");
            o.dataset.value = x.value;
            var box = mkEl("span", "kit-opt-text");
            box.appendChild(mkEl("b", "", x.label));
            if (x.hint) box.appendChild(mkEl("small", "", x.hint));
            o.appendChild(box);
            o.appendChild(mkIcon("check", "kit-icon kit-opt-check"));
            st.list.appendChild(o);
            shown++;
        });
        if (!shown) st.list.appendChild(mkEl("div", "kit-pop-empty", st.empty));
        var a = st.list.querySelector(".kit-opt.is-on:not([aria-disabled='true'])") || st.list.querySelector(".kit-opt:not([aria-disabled='true'])");
        if (a) { a.classList.add("is-active"); if (!q) a.scrollIntoView({ block: "nearest" }); }
    }

    function nativeOpen(st) {
        closePop(false);
        st.q = "";
        var count = nativeItems(st.sel).filter(function (x) { return x.group === undefined; }).length;
        var withSearch = st.search === true || (typeof st.search === "number" && count > st.search);
        st.pop.textContent = "";
        st.input = null;
        if (withSearch) {
            var box = mkEl("div", "kit-pop-search");
            var inp = mkEl("input", "kit-input");
            inp.type = "search";
            inp.placeholder = st.placeholder;
            inp.setAttribute("autocomplete", "off");
            inp.setAttribute("aria-label", st.placeholder.replace(/…$/, ""));
            inp.addEventListener("input", function () { st.q = inp.value; nativeList(st); });
            box.appendChild(inp);
            st.pop.appendChild(box);
            st.input = inp;
        }
        st.list = mkEl("div", "kit-pop-list");
        st.list.setAttribute("role", "listbox");
        st.pop.appendChild(st.list);
        nativeList(st);
        st.pop.classList.remove("kit-pop-right");
        setPop(st.pop, st.btn, true);
        if (st.pop.getBoundingClientRect().right > window.innerWidth - 8) st.pop.classList.add("kit-pop-right");
        st.pop.tabIndex = -1;
        (st.input || st.pop).focus({ preventScroll: true });
        st.pop.scrollIntoView({ block: "nearest" });
    }

    function nativeChoose(st, opt) {
        var v = opt.dataset.value || "";
        var changed = st.sel.value !== v;
        st.sel.value = v;
        nativeSync(st);
        closePop(true);
        if (!changed) return;
        st.sel.dispatchEvent(new Event("change", { bubbles: true }));
        var o = st.sel.selectedOptions[0];
        st.wrap.dispatchEvent(new CustomEvent("kit:change", { bubbles: true, detail: { value: v, label: o ? o.textContent.trim() : "" } }));
    }

    function nativeSelect(target, opts) {
        var sel = typeof target === "string" ? document.querySelector(target) : target;
        if (!sel || sel.tagName !== "SELECT") return null;
        var old = selByNative.get(sel);
        if (old) return old.api;
        opts = opts || {};
        var d = sel.dataset;
        var search = opts.search !== undefined ? opts.search : (d.kitSearch !== undefined ? (d.kitSearch === "off" ? false : d.kitSearch === "" ? true : parseInt(d.kitSearch, 10)) : 20);
        var wrap = mkEl("div", "kit-select");
        wrap.setAttribute("data-kit-select", "");
        wrap.setAttribute("data-kit-native", "");
        sel.parentNode.insertBefore(wrap, sel);
        wrap.appendChild(sel);
        sel.removeAttribute("data-kit-select");
        sel.classList.add("kit-sr");
        sel.tabIndex = -1;
        sel.setAttribute("aria-hidden", "true");
        var id = "kit-sel-" + (++selUid);
        var btn = mkEl("button", "kit-select-btn");
        btn.type = "button";
        btn.setAttribute("aria-haspopup", "listbox");
        btn.setAttribute("aria-expanded", "false");
        var value = mkEl("span", "kit-select-value");
        value.id = id + "-v";
        btn.appendChild(value);
        btn.appendChild(mkIcon("chev"));
        var lab = sel.labels && sel.labels[0];
        if (sel.getAttribute("aria-label")) btn.setAttribute("aria-label", sel.getAttribute("aria-label"));
        else if (lab) { lab.id = lab.id || id + "-l"; btn.setAttribute("aria-labelledby", lab.id + " " + value.id); }
        var pop = mkEl("div", "kit-pop");
        pop.hidden = true;
        wrap.appendChild(btn);
        wrap.appendChild(pop);
        var st = {
            sel: sel, wrap: wrap, btn: btn, value: value, pop: pop, id: id, q: "", input: null, list: null, search: search,
            empty: opts.empty !== undefined ? opts.empty : (d.kitEmpty || t("noResults")),
            placeholder: opts.placeholder || d.kitPlaceholder || t("search")
        };
        st.api = {
            sync: function () { nativeSync(st); if (!pop.hidden) nativeList(st); },
            open: function () { if (pop.hidden && !btn.disabled) nativeOpen(st); },
            close: function () { if (!pop.hidden) closePop(false); }
        };
        selByWrap.set(wrap, st);
        selByNative.set(sel, st);
        nativeSync(st);

        btn.addEventListener("keydown", function (e) {
            if ((e.key === "ArrowDown" || e.key === "ArrowUp") && pop.hidden) {
                e.preventDefault();
                e.stopPropagation();   // otherwise the arrow would count twice (opens and moves)
                nativeOpen(st);
            }
        });
        // the mouse on the items must not take focus away from the menu (the search field does receive it)
        pop.addEventListener("mousedown", function (e) { if (!(e.target instanceof Element && e.target.closest("input"))) e.preventDefault(); });
        wrap.addEventListener("focusout", function (e) {
            if (!wrap.contains(e.relatedTarget) && openPop && openPop.pop === pop) closePop(false);
        });
        sel.addEventListener("focus", function () { btn.focus(); });   // a <label for> or focus() on the select go to the button
        sel.addEventListener("change", function () { nativeSync(st); });
        if (sel.form) sel.form.addEventListener("reset", function () { setTimeout(function () { st.api.sync(); }, 0); });
        if (window.MutationObserver) new MutationObserver(function () { st.api.sync(); }).observe(sel, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "label", "hidden", "data-kit-hint", "data-kit-short"], characterData: true });
        return st.api;
    }

    /* ---------- Charts: bars, lines, donut, sparkline ----------
       Kit.barChart(el, { data: [{ label, group, values: [..] }], series: [{ name, color }], stacked, format, onSelect, ... })
       Kit.lineChart(el, { same options; values can contain null (gap), area, zero, markers })
       Kit.donut(el, { data: [{ label, value, color }], centerValue, centerLabel, format, onSelect })
       Kit.sparkline(el, { values, type: "line" | "bar", color, area })
       They draw an SVG (no innerHTML), follow the theme and the text size. */
    var SVG_NS = "http://www.w3.org/2000/svg";
    var charts = new WeakMap();

    function svgEl(name, attrs, text) {
        var e = document.createElementNS(SVG_NS, name);
        for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
        if (text != null) e.textContent = text;
        return e;
    }

    function niceTop(max) {
        var e = Math.pow(10, Math.floor(Math.log10(max))), f = max / e;
        return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e;
    }

    function compactNumber(v) {
        var nf = new Intl.NumberFormat(root.lang || undefined, { maximumFractionDigits: 2 });
        var a = Math.abs(v);
        return a >= 1e6 ? nf.format(v / 1e6) + " M" : a >= 1e3 ? nf.format(v / 1e3) + " k" : nf.format(v);
    }

    function colorOf(s, i) { return s.color || "var(--kit-c" + (i % 4 + 1) + ")"; }

    function resolveEl(el) { return typeof el === "string" ? document.querySelector(el) : el; }



    /* The life cycle is the same for all: one chart per element, calling the function again updates it. */
    function mountChart(el, opts, build) {
        var prev = charts.get(el);
        if (prev) { prev.update(opts); return prev; }
        var o = {};
        var inst = build(el, o);
        var api = {
            update: function (next) {
                if (next) for (var k in next) o[k] = next[k];
                inst.draw(true);
            },
            destroy: function () {
                if (inst.destroy) inst.destroy();
                charts.delete(el);
                el.textContent = "";
                el.className = el.className.replace(/\bkit-(chart-click|chart|donut|spark)\b/g, "").trim();
            }
        };
        charts.set(el, api);
        api.update(opts || {});
        return api;
    }

    function cartesian(el, opts, kind) {
        el = resolveEl(el);
        if (!el) return null;
        return mountChart(el, opts, function (el, o) {
            var scrollEnd = true, lastW = 0;
            var legend = mkEl("div", "kit-legend");
            var scroller = mkEl("div", "kit-chart-scroll");
            el.classList.add("kit-chart");
            el.textContent = "";
            el.appendChild(legend);
            el.appendChild(scroller);
            var isLine = kind === "line";

            function draw(fresh) {
                if (fresh) scrollEnd = o.scrollEnd !== false;
                var data = o.data || [];
                var series = o.series && o.series.length ? o.series : [{ name: o.name || t("total") }];
                var fmt = o.format || function (v) { return new Intl.NumberFormat(root.lang || undefined).format(v); };
                var axisFmt = o.axisFormat || compactNumber;
                var u = (parseFloat(getComputedStyle(el).fontSize) || 14) / 14;
                var L = Math.round(58 * u), R = Math.round((isLine ? 14 : 6) * u), T = Math.round(10 * u), B = Math.round(34 * u);
                var H = Math.round((o.height || 260) * u), ph = H - B - T, n = data.length;
                var avail = Math.max(scroller.clientWidth, 300);
                var slot = Math.max((o.minSlot || 34) * u, (avail - L - R) / Math.max(n, 1));
                var W = Math.max(avail, Math.ceil(L + R + slot * n));
                var ns = series.length;
                var stacked = !isLine && o.stacked === true && ns > 1;
                var interactive = typeof o.onSelect === "function";

                legend.textContent = "";
                legend.hidden = !(o.legend === true || (o.legend !== false && ns > 1));
                series.forEach(function (s, i) {
                    var sp = mkEl("span", "");
                    var sw = mkEl("i", "");
                    sw.style.background = colorOf(s, i);
                    sp.appendChild(sw);
                    sp.appendChild(document.createTextNode(s.name || ""));
                    legend.appendChild(sp);
                });
                if (o.legendNote) legend.appendChild(mkEl("span", "", o.legendNote));

                scroller.textContent = "";
                el.classList.toggle("kit-chart-click", interactive);
                if (!n) { scroller.appendChild(mkEl("div", "kit-pop-empty", o.empty || t("noData"))); return; }

                // Vertical scale. Bars: from 0 to a round value. Lines: from the minimum to the maximum (with margin), unless zero:true.
                var ticks = o.ticks || 4, lo = 0, hi, step;
                var vmin = Infinity, vmax = 0;
                data.forEach(function (d) {
                    var sum = 0;
                    series.forEach(function (s, j) {
                        var v = d.values[j];
                        if (v == null) return;
                        if (v < vmin) vmin = v;
                        if (stacked) sum += Math.max(0, v); else if (v > vmax) vmax = v;
                    });
                    if (stacked && sum > vmax) vmax = sum;
                });
                if (!isFinite(vmin)) vmin = 0;
                if (isLine && o.zero !== true && o.min == null) {
                    lo = vmin; hi = vmax;
                    if (hi - lo < 1e-9) { lo -= Math.abs(lo) * .05 || 1; hi += Math.abs(hi) * .05 || 1; }
                    else { var pad = (hi - lo) * .12; lo -= pad; hi += pad; }
                    step = niceTop((hi - lo) / ticks);
                    lo = Math.floor(lo / step) * step;
                    ticks = Math.max(1, Math.ceil((hi - lo) / step - 1e-9));
                    hi = lo + step * ticks;
                } else {
                    lo = o.min != null ? o.min : 0;
                    hi = o.max || niceTop(Math.max(1, vmax));
                    step = (hi - lo) / ticks;
                }
                var Y = function (v) { return T + ph - (v - lo) / (hi - lo) * ph; };
                var X = function (i) { return L + i * slot + slot / 2; };

                var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: interactive ? "group" : "img", "aria-label": o.label || (isLine ? t("chartLine") : t("chartBar")) });
                for (var t = 0; t <= ticks; t++) {
                    var gy = Y(lo + step * t);
                    svg.appendChild(svgEl("line", { "class": "kit-chart-grid", x1: L, x2: W - R, y1: gy, y2: gy }));
                    svg.appendChild(svgEl("text", { "class": "kit-chart-axis", x: L - 8, y: gy + 4, "text-anchor": "end" }, axisFmt(lo + step * t)));
                }
                // labels under the axis
                data.forEach(function (d, i) {
                    svg.appendChild(svgEl("text", { "class": "kit-chart-label", x: X(i), y: T + ph + 14 * u, "text-anchor": "middle" }, d.label));
                    if (d.group && (i === 0 || d.group !== data[i - 1].group)) {
                        svg.appendChild(svgEl("text", { "class": "kit-chart-group", x: L + i * slot + 4, y: H - 3 * u }, d.group));
                    }
                });

                function tip(d, s, j, v) {
                    return d.label + (d.group ? " " + d.group : "") + (ns > 1 ? " · " + (s.name || "") : "") + ": " + fmt(v);
                }
                function mark(node, d, s, j, v, i, cls) {
                    var text = tip(d, s, j, v);
                    node.setAttribute("class", cls);
                    node.setAttribute("data-i", i);
                    node.setAttribute("data-s", j);
                    node.appendChild(svgEl("title", {}, text));
                    if (interactive) { node.setAttribute("tabindex", "0"); node.setAttribute("role", "button"); node.setAttribute("aria-label", text); }
                    svg.appendChild(node);
                }

                if (!isLine) {
                    var bw = Math.min(slot - 8, 64 * u);
                    data.forEach(function (d, i) {
                        var x0 = L + i * slot + (slot - bw) / 2, w1 = stacked ? bw : bw / ns, acc = 0;
                        series.forEach(function (s, j) {
                            var v = Math.max(0, d.values[j] || 0);
                            var h = Math.max(v ? 1 : 0, v / (hi - lo) * ph);
                            var y = stacked ? T + ph - (acc + v) / (hi - lo) * ph : T + ph - h;
                            acc += v;
                            mark(svgEl("rect", { x: stacked ? x0 : x0 + j * w1, y: y, width: Math.max(1, w1 - (ns > 1 && !stacked ? 1 : 0)), height: h, rx: stacked ? 0 : 2, fill: colorOf(s, j) }), d, s, j, v, i, "kit-chart-bar");
                        });
                    });
                } else {
                    series.forEach(function (s, j) {
                        var col = colorOf(s, j), segs = [], cur = [];
                        data.forEach(function (d, i) {
                            var v = d.values[j];
                            if (v == null) { if (cur.length) segs.push(cur); cur = []; } else cur.push([X(i), Y(v)]);
                        });
                        if (cur.length) segs.push(cur);
                        segs.forEach(function (sg) {
                            if (sg.length < 2) return;
                            var pts = sg.map(function (p, k) { return (k ? "L" : "M") + p[0] + " " + p[1]; }).join(" ");
                            if (o.area) svg.appendChild(svgEl("path", { "class": "kit-chart-area", fill: col, d: pts + " L" + sg[sg.length - 1][0] + " " + Y(lo) + " L" + sg[0][0] + " " + Y(lo) + " Z" }));
                            svg.appendChild(svgEl("path", { "class": "kit-chart-line", stroke: col, d: pts }));
                        });
                        // points: circle, square, triangle… so the series can be told apart even without color
                        if (o.markers !== false) data.forEach(function (d, i) {
                            var v = d.values[j];
                            if (v == null) return;
                            var x = X(i), y = Y(v), m = j % 3, node;
                            if (m === 0) node = svgEl("circle", { cx: x, cy: y, r: 4.5 * u, fill: col });
                            else if (m === 1) node = svgEl("rect", { x: x - 4 * u, y: y - 4 * u, width: 8 * u, height: 8 * u, fill: col });
                            else node = svgEl("polygon", { points: x + "," + (y - 5 * u) + " " + (x + 5 * u) + "," + (y + 4 * u) + " " + (x - 5 * u) + "," + (y + 4 * u), fill: col });
                            mark(node, d, s, j, v, i, "kit-chart-pt");
                        });
                    });
                }
                scroller.appendChild(svg);
                if (scrollEnd && W > avail) scroller.scrollLeft = scroller.scrollWidth;
            }

            function pick(target) {
                var r = target instanceof Element && target.closest(".kit-chart-bar, .kit-chart-pt");
                if (!r || typeof o.onSelect !== "function") return;
                var i = +r.getAttribute("data-i"), s = +r.getAttribute("data-s");
                o.onSelect(o.data[i], i, s);
                el.dispatchEvent(new CustomEvent("kit:select", { bubbles: true, detail: { index: i, series: s, item: o.data[i] } }));
            }
            scroller.addEventListener("click", function (e) { pick(e.target); });
            scroller.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(e.target); }
            });

            var ro = typeof ResizeObserver === "function" ? new ResizeObserver(function () {
                var w = el.clientWidth;
                if (w && w !== lastW) { lastW = w; scrollEnd = false; draw(false); }
            }) : null;
            if (ro) ro.observe(el);
            function onFs() { scrollEnd = false; draw(false); }
            root.addEventListener("kit:fs", onFs);
            return { draw: draw, destroy: function () { if (ro) ro.disconnect(); root.removeEventListener("kit:fs", onFs); } };
        });
    }

    function barChart(el, opts) { return cartesian(el, opts, "bar"); }
    function lineChart(el, opts) { return cartesian(el, opts, "line"); }

    function donut(el, opts) {
        el = resolveEl(el);
        if (!el) return null;
        return mountChart(el, opts, function (el, o) {
            el.classList.add("kit-donut");
            function draw() {
                var data = (o.data || []).filter(function (d) { return d.value > 0; });
                var fmt = o.format || function (v) { return new Intl.NumberFormat(root.lang || undefined).format(v); };
                var total = data.reduce(function (a, d) { return a + d.value; }, 0);
                var interactive = typeof o.onSelect === "function";
                el.textContent = "";
                el.classList.toggle("kit-chart-click", interactive);
                if (!total) { el.appendChild(mkEl("div", "kit-pop-empty", o.empty || t("noData"))); return; }
                var pct = new Intl.NumberFormat(root.lang || undefined, { style: "percent", maximumFractionDigits: 1 });
                var r = 40, w = o.thickness || 16, C = 2 * Math.PI * r, acc = 0;
                var svg = svgEl("svg", { "class": "kit-donut-svg", viewBox: "0 0 100 100", role: "img", "aria-label": o.label || t("chartDonut") });
                var legend = mkEl("div", "kit-donut-legend");
                data.forEach(function (d, i) {
                    var col = d.color || "var(--kit-c" + (i % 4 + 1) + ")";
                    var len = d.value / total * C, gap = data.length > 1 ? Math.min(1.2, len * .3) : 0;
                    var text = d.label + ": " + fmt(d.value) + " (" + pct.format(d.value / total) + ")";
                    var seg = svgEl("circle", { "class": "kit-donut-seg", cx: 50, cy: 50, r: r, fill: "none", stroke: col, "stroke-width": w,
                        "stroke-dasharray": (len - gap) + " " + (C - len + gap), "stroke-dashoffset": -acc, transform: "rotate(-90 50 50)", "data-i": i });
                    seg.appendChild(svgEl("title", {}, text));
                    svg.appendChild(seg);
                    acc += len;
                    var row = mkEl(interactive ? "button" : "div", "kit-donut-row");
                    if (interactive) { row.type = "button"; row.setAttribute("data-i", i); }
                    var sw = mkEl("i", ""); sw.style.background = col;
                    row.appendChild(sw);
                    row.appendChild(mkEl("span", "kit-donut-name", d.label));
                    row.appendChild(mkEl("b", "", fmt(d.value)));
                    row.appendChild(mkEl("small", "", pct.format(d.value / total)));
                    legend.appendChild(row);
                });
                var cv = o.centerValue != null ? o.centerValue : fmt(total);
                svg.appendChild(svgEl("text", { "class": "kit-donut-value", x: 50, y: o.centerLabel === "" ? 54 : 50, "text-anchor": "middle" }, String(cv)));
                if (o.centerLabel !== "") svg.appendChild(svgEl("text", { "class": "kit-donut-label", x: 50, y: 61, "text-anchor": "middle" }, o.centerLabel || t("total")));
                el.appendChild(svg);
                if (o.legend !== false) el.appendChild(legend);
                var dd = data;
                el.onclick = function (e) {
                    var t = e.target instanceof Element && e.target.closest("[data-i]");
                    if (!t || !interactive) return;
                    var i = +t.getAttribute("data-i");
                    o.onSelect(dd[i], i);
                    el.dispatchEvent(new CustomEvent("kit:select", { bubbles: true, detail: { index: i, item: dd[i] } }));
                };
            }
            return { draw: draw };
        });
    }

    function sparkline(el, opts) {
        el = resolveEl(el);
        if (!el) return null;
        return mountChart(el, opts, function (el, o) {
            el.classList.add("kit-spark");
            function draw() {
                var vals = (o.values || []).filter(function (v) { return v != null; });
                var type = o.type === "bar" ? "bar" : "line";
                el.textContent = "";
                if (!vals.length) return;
                var W = 100, H = 30, pad = 2;
                var lo = type === "bar" ? Math.min(0, Math.min.apply(null, vals)) : Math.min.apply(null, vals);
                var hi = Math.max.apply(null, vals);
                if (hi - lo < 1e-9) { hi = lo + 1; }
                var col = o.color || "var(--kit-c1)";
                var Y = function (v) { return H - pad - (v - lo) / (hi - lo) * (H - 2 * pad); };
                var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", role: "img", "aria-label": o.label || t("trend") });
                var n = vals.length;
                if (type === "bar") {
                    var bw = W / n;
                    vals.forEach(function (v, i) {
                        var y = Y(Math.max(v, 0)), y0 = Y(Math.min(0, lo) < 0 ? 0 : lo);
                        svg.appendChild(svgEl("rect", { x: i * bw + bw * .15, y: Math.min(y, y0), width: bw * .7, height: Math.max(1, Math.abs(y0 - y)), fill: col }));
                    });
                } else {
                    var pts = vals.map(function (v, i) { return [n === 1 ? W / 2 : pad + i * (W - 2 * pad) / (n - 1), Y(v)]; });
                    var d = pts.map(function (p, i) { return (i ? "L" : "M") + p[0] + " " + p[1]; }).join(" ");
                    if (o.area !== false) svg.appendChild(svgEl("path", { "class": "kit-chart-area", fill: col, d: d + " L" + pts[n - 1][0] + " " + H + " L" + pts[0][0] + " " + H + " Z" }));
                    svg.appendChild(svgEl("path", { "class": "kit-chart-line", stroke: col, d: d }));
                }
                el.appendChild(svg);
            }
            return { draw: draw };
        });
    }

    /* ---------- Side panel (kit-split): open, close, full width ----------
       Also works if is-open is set by hand; with data-kit-split on the container Esc closes it (first it leaves "full width"). */
    var SPLIT = ".kit-split, .kit-split-lg";
    var splitOpener = new WeakMap();

    function splitSet(sp, open, full) {
        var was = sp.classList.contains("is-open"), wasFull = sp.classList.contains("is-full");
        if (open === undefined) open = was;
        if (!open) full = false;
        if (full === undefined) full = wasFull;
        sp.classList.toggle("is-open", open);
        sp.classList.toggle("is-full", open && full);
        var panel = sp.querySelector(".kit-split-panel");
        if (open && !was) {
            splitOpener.set(sp, document.activeElement);
            if (panel) { panel.tabIndex = -1; panel.focus({ preventScroll: true }); }
        }
        if (!open && was) {
            var o = splitOpener.get(sp);
            if (o && o.isConnected && o.focus) o.focus({ preventScroll: true });
        }
        if (open !== was || (open && full !== wasFull)) {
            sp.dispatchEvent(new CustomEvent("kit:split", { bubbles: true, detail: { open: open, full: open && full } }));
        }
    }

    function split(target) {
        var sp = typeof target === "string" ? document.querySelector(target) : target;
        if (!sp) return null;
        return {
            open: function () { splitSet(sp, true); },
            close: function () { splitSet(sp, false); },
            full: function (on) { splitSet(sp, true, on !== false); },
            isOpen: function () { return sp.classList.contains("is-open"); },
            isFull: function () { return sp.classList.contains("is-full"); }
        };
    }

    /* ---------- File field and drop zone ----------
       <div class="kit-file" data-kit-file><input type="file" accept=".xml" multiple></div>        compact field
       <div class="kit-dropzone" data-kit-file><input type="file" multiple> …text…</div>          drop zone
       Checks type and size, accepts folders (data-kit-file-dir or webkitdirectory) and, with data-kit-file-page,
       files dropped anywhere on the page. "kit:files" event with { files, items, rejected }. */
    var fileState = new WeakMap();
    var pageFileZone = null, pageDragN = 0, dropVeil = null;

    function fileMsgs() { var m = t("file"); return { type: m.type, size: m.size, count: m.count, folder: m.folder }; }

    function fmtSize(n) {
        if (n < 1024) return n + " B";
        var dec = t("num.dec");
        if (n < 1048576) return (n / 1024).toFixed(n < 10240 ? 1 : 0).replace(".", dec) + " kB";
        return (n / 1048576).toFixed(n < 10485760 ? 1 : 0).replace(".", dec) + " MB";
    }

    function acceptTest(accept) {
        var toks = (accept || "").split(",").map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
        if (!toks.length) return function () { return true; };
        return function (f) {
            var name = f.name.toLowerCase(), type = (f.type || "").toLowerCase();
            return toks.some(function (t) {
                if (t.charAt(0) === ".") return name.slice(-t.length) === t;
                if (t.slice(-2) === "/*") return type.indexOf(t.slice(0, -1)) === 0;
                return type === t;
            });
        };
    }

    // Reads the files of a dropped folder (webkitGetAsEntry), with their path.
    function readEntry(entry, path) {
        return new Promise(function (resolve) {
            if (!entry) return resolve([]);
            if (entry.isFile) {
                entry.file(function (f) { resolve([{ file: f, path: path + f.name, fromDir: path !== "" }]); }, function () { resolve([]); });
            } else if (entry.isDirectory) {
                var reader = entry.createReader(), out = [];
                (function next() {
                    reader.readEntries(function (batch) {
                        if (!batch.length) {
                            Promise.all(out).then(function (lists) { resolve([].concat.apply([], lists)); });
                            return;
                        }
                        batch.forEach(function (en) { out.push(readEntry(en, path + entry.name + "/")); });
                        next();
                    }, function () { resolve([]); });
                })();
            } else resolve([]);
        });
    }

    function fileUI(wrap, st) {
        var input = st.input, n = st.items.length, name = st.nameEl;
        wrap.classList.toggle("has-files", n > 0);
        if (st.clearBtn) st.clearBtn.hidden = n === 0;
        var text;
        if (!n) text = st.empty;
        else {
            var total = st.items.reduce(function (a, i) { return a + i.file.size; }, 0);
            var dir = st.items[0].path.indexOf("/") > 0 ? st.items[0].path.split("/")[0] : "";
            if (dir) text = dir + " · " + t("file.many", { n: n }) + " (" + fmtSize(total) + ")";
            else if (n === 1) text = st.items[0].file.name + " (" + fmtSize(total) + ")";
            else text = t("file.many", { n: n }) + " (" + fmtSize(total) + ")";
        }
        name.textContent = text;
        name.title = n > 1 ? st.items.slice(0, 20).map(function (i) { return i.path; }).join("\n") : "";
        st.err.textContent = st.errors.join(" ");
        st.err.hidden = !st.errors.length;
        wrap.classList.toggle("is-invalid", st.errors.length > 0);
        if (st.errors.length) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
    }

    function fileApply(wrap, st, found) {
        var ok = [], rejected = [];
        var test = acceptTest(st.input.getAttribute("accept"));
        found.forEach(function (it) {
            var why = null;
            if (it.isDir) { if (!st.dir) why = "folder"; }
            else if (!test(it.file)) why = it.fromDir ? "skip" : "type";   // files of another type inside folders are silently ignored
            else if (st.max && it.file.size > st.max * 1048576) why = "size";
            else if (!st.input.multiple && !st.dir && ok.length >= 1) why = "count";
            if (!why) ok.push(it);
            else if (why !== "skip") rejected.push({ file: it.file, path: it.path, reason: why });
        });
        st.errors = rejected.map(function (r) {
            return st.msg[r.reason].replace("{name}", r.path || r.file.name).replace("{accept}", st.input.getAttribute("accept") || "").replace("{max}", String(st.max));
        });
        st.items = ok;
        // the form field must hold the same files (needed for the normal form submit)
        try {
            var dt = new DataTransfer();
            st.items.forEach(function (i) { dt.items.add(i.file); });
            st.input.files = dt.files;
        } catch (e) { /* browser without DataTransfer: the native choice remains */ }
        fileUI(wrap, st);
        var detail = { files: st.items.map(function (i) { return i.file; }), items: st.items.slice(), rejected: rejected };
        wrap.dispatchEvent(new CustomEvent("kit:files", { bubbles: true, detail: detail }));
        if (typeof st.onFiles === "function") st.onFiles(detail);
    }

    // A drop: the DataTransfer data must be read at once, before any wait.
    function fileDrop(wrap, st, dt) {
        var ents = [];
        var items = dt.items ? Array.prototype.slice.call(dt.items).filter(function (i) { return i.kind === "file"; }) : [];
        items.forEach(function (i) { ents.push(i.webkitGetAsEntry ? i.webkitGetAsEntry() : null); });
        var plain = Array.prototype.slice.call(dt.files || []);
        var jobs;
        if (ents.length && ents.every(Boolean)) {
            jobs = ents.map(function (en) {
                if (en.isDirectory && !st.dir) return Promise.resolve([{ file: { name: en.name, size: 0, type: "" }, path: en.name, isDir: true }]);
                return readEntry(en, "");
            });
        } else jobs = [Promise.resolve(plain.map(function (f) { return { file: f, path: f.name }; }))];
        Promise.all(jobs).then(function (lists) { fileApply(wrap, st, [].concat.apply([], lists)); });
    }

    function fileField(target, opts) {
        var wrap = typeof target === "string" ? document.querySelector(target) : target;
        if (!wrap) return null;
        var st = fileState.get(wrap);
        if (st) return st.api;
        opts = opts || {};
        var input = wrap.querySelector('input[type="file"]');
        if (!input) return null;
        var d = wrap.dataset, zone = wrap.classList.contains("kit-dropzone");
        st = {
            input: input, items: [], errors: [], onFiles: opts.onFiles,
            dir: opts.directory != null ? !!opts.directory : (input.hasAttribute("webkitdirectory") || d.kitFileDir !== undefined),
            max: opts.max != null ? opts.max : (parseFloat(d.kitFileMax) || 0),
            empty: opts.empty || d.kitFileEmpty || (zone ? "" : t("file.none")),
            msg: Object.assign(fileMsgs(), opts.messages || {})
        };
        wrap.classList.add("is-ready");
        if (!input.id) input.id = "kit-file-" + (++comboUid);

        st.nameEl = wrap.querySelector(".kit-file-name") || mkEl("span", "kit-file-name");
        st.err = wrap.querySelector(".kit-file-error") || mkEl("small", "kit-file-error kit-danger");
        st.err.hidden = true;
        st.err.setAttribute("role", "alert");
        if (!zone) {
            var pick = wrap.querySelector(".kit-file-btn");
            if (!pick) {
                pick = mkEl("button", "kit-btn kit-file-btn", opts.button || d.kitFileButton || (st.dir ? t("file.pickDir") : t("file.pick")));
                pick.type = "button";
                wrap.insertBefore(pick, input.nextSibling);
            }
            pick.addEventListener("click", function () { input.click(); });
            if (!st.nameEl.parentNode) wrap.insertBefore(st.nameEl, pick.nextSibling);
            st.clearBtn = wrap.querySelector(".kit-file-clear");
            if (!st.clearBtn) {
                st.clearBtn = mkEl("button", "kit-btn kit-btn-ghost kit-btn-icon kit-file-clear");
                st.clearBtn.type = "button";
                st.clearBtn.setAttribute("aria-label", opts.clearLabel || d.kitFileClear || t("file.clear"));
                var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"), use = document.createElementNS("http://www.w3.org/2000/svg", "use");
                svg.setAttribute("class", "kit-icon");
                use.setAttribute("href", "#i-x");
                svg.appendChild(use);
                st.clearBtn.appendChild(svg);
                wrap.insertBefore(st.clearBtn, st.nameEl.nextSibling);
            }
            st.clearBtn.hidden = true;
            st.clearBtn.addEventListener("click", function () { fileApply(wrap, st, []); });
            wrap.appendChild(st.err);
        } else {
            if (!st.nameEl.parentNode) wrap.appendChild(st.nameEl);
            if (!wrap.contains(st.err)) wrap.appendChild(st.err);
        }
        st.nameEl.textContent = st.empty;

        input.addEventListener("change", function () {
            var list = Array.prototype.slice.call(input.files || []);
            fileApply(wrap, st, list.map(function (f) { return { file: f, path: f.webkitRelativePath || f.name, fromDir: !!f.webkitRelativePath }; }));
        });
        wrap.addEventListener("dragenter", function (e) { if (hasFiles(e)) { e.preventDefault(); wrap.classList.add("is-over"); } });
        wrap.addEventListener("dragover", function (e) { if (hasFiles(e)) { e.preventDefault(); wrap.classList.add("is-over"); } });
        wrap.addEventListener("dragleave", function (e) { if (!wrap.contains(e.relatedTarget)) wrap.classList.remove("is-over"); });
        wrap.addEventListener("drop", function (e) {
            if (!hasFiles(e)) return;
            e.preventDefault();
            e.stopPropagation();   // if there is also the "page" zone, the drop counts only once
            wrap.classList.remove("is-over");
            endPageDrag();
            fileDrop(wrap, st, e.dataTransfer);
        });
        if (d.kitFilePage !== undefined) { pageFileZone = { wrap: wrap, st: st, text: d.kitFilePage || t("file.drop") }; }
        st.api = {
            files: function () { return st.items.map(function (i) { return i.file; }); },
            items: function () { return st.items.slice(); },
            clear: function () { fileApply(wrap, st, []); }
        };
        fileState.set(wrap, st);
        fileUI(wrap, st);
        return st.api;
    }

    function hasFiles(e) {
        var t = e.dataTransfer && e.dataTransfer.types;
        return !!t && Array.prototype.indexOf.call(t, "Files") >= 0;
    }

    function endPageDrag() {
        pageDragN = 0;
        if (dropVeil) dropVeil.classList.remove("is-on");
    }

    /* ---------- Full-screen progress ----------
       var p = Kit.progress("Reading…", { value: 0.2, onCancel }); p.update("Reading 40 of 200", 0.4); p.close(); */
    function progressDialog(text, opts) {
        opts = opts || {};
        var dlg = mkEl("dialog", "kit-dialog kit-dialog-sm kit-busy");
        dlg.setAttribute("aria-live", "polite");
        var body = mkEl("div", "kit-card-body kit-stack");
        var label = mkEl("div", "kit-busy-text", text || "");
        var bar = mkEl("div", "kit-progress");
        var fill = mkEl("i", "");
        bar.appendChild(fill);
        body.appendChild(label);
        body.appendChild(bar);
        dlg.appendChild(body);
        var cancelBtn = null;
        if (typeof opts.onCancel === "function") {
            var foot = mkEl("div", "kit-card-foot");
            cancelBtn = mkEl("button", "kit-btn", opts.cancel || t("cancel"));
            cancelBtn.type = "button";
            foot.appendChild(cancelBtn);
            dlg.appendChild(foot);
        }
        var closed = false, shown = false, timer = null;
        function setValue(v) {
            if (v == null) { bar.classList.add("kit-progress-indeterminate"); bar.removeAttribute("role"); fill.style.removeProperty("--kit-value"); return; }
            bar.classList.remove("kit-progress-indeterminate");
            var pct = Math.max(0, Math.min(1, v)) * 100;
            fill.style.setProperty("--kit-value", pct + "%");
            bar.setAttribute("role", "progressbar");
            bar.setAttribute("aria-valuenow", String(Math.round(pct)));
            bar.setAttribute("aria-valuemin", "0");
            bar.setAttribute("aria-valuemax", "100");
        }
        function close() {
            if (closed) return;
            closed = true;
            clearTimeout(timer);
            if (shown && dlg.open) dlg.close();
            setTimeout(function () { dlg.remove(); }, 300);
        }
        function cancel() { if (typeof opts.onCancel === "function") opts.onCancel(); close(); }
        function show() {
            if (closed) return;
            document.body.appendChild(dlg);
            dlg.showModal();
            dlg.tabIndex = -1;
            if (!cancelBtn) dlg.focus({ preventScroll: true });
            shown = true;
        }
        // Esc does not close the progress, unless there is a way to cancel the operation.
        dlg.addEventListener("cancel", function (e) { e.preventDefault(); if (cancelBtn) cancel(); });
        if (cancelBtn) cancelBtn.addEventListener("click", cancel);
        setValue(opts.value);
        if (opts.delay > 0) timer = setTimeout(show, opts.delay); else show();
        return {
            update: function (t, v) {
                if (t != null) label.textContent = t;
                if (v !== undefined) setValue(v);
            },
            close: close
        };
    }

    /* ---------- Navbar: collapsible menu ---------- */
    function setNav(menu, open) {
        menu.classList.toggle("is-open", open);
        document.querySelectorAll('[data-kit-nav="#' + menu.id + '"]').forEach(function (b) { b.setAttribute("aria-expanded", String(open)); });
        if (!open) closePop(false);
    }

    function openNavs() { return Array.prototype.slice.call(document.querySelectorAll(".kit-navbar-menu.is-open")); }

    window.addEventListener("resize", function () {
        // If the menu has become visible inline (the button is hidden), the "open" state is no longer needed.
        openNavs().forEach(function (m) {
            var b = document.querySelector('[data-kit-nav="#' + m.id + '"]');
            if (b && b.offsetParent === null) setNav(m, false);
        });
    });

    /* ---------- Tabs ---------- */
    function selectTab(tabs, tab) {
        tabs.querySelectorAll(".kit-tab").forEach(function (t) {
            var on = t === tab;
            t.classList.toggle("is-on", on);
            t.setAttribute("aria-selected", String(on));
            t.tabIndex = on ? 0 : -1;
            var id = t.getAttribute("data-kit-panel");
            var panel = id && document.querySelector(id);
            if (panel) panel.hidden = !on;
        });
        tabs.dispatchEvent(new CustomEvent("kit:tab", { bubbles: true, detail: { tab: tab } }));
    }

    /* ---------- Events (delegated: they also apply to content added later) ---------- */
    document.addEventListener("click", function (e) {
        var t = e.target;
        if (!(t instanceof Element)) return;

        var sideBtn = t.closest("[data-kit-sidebar-toggle]");
        if (sideBtn) {
            var sbT = sideBar(sideBtn.getAttribute("data-kit-sidebar-toggle"));
            if (!sbT) return;
            if (!sideDrawer(sbT)) sidebar.toggle();
            else if (sbT.classList.contains("is-open")) sidebar.close();
            else sidebar.open(sideBtn.getAttribute("data-kit-sidebar-toggle"), sideBtn);
            return;
        }
        var sbIn = t.closest(".kit-sidebar");
        if (sbIn) {
            // compact: the item with sub-items expands the sidebar; once a page is chosen, the slide-in one closes
            if (!sideDrawer(sbIn) && sidebar.get() === "collapsed" && t.closest("summary")) sidebar.set("expanded");
            else if (sideDrawer(sbIn) && sbIn.classList.contains("is-open") && t.closest("a[href]")) sidebar.close();
        } else {
            var sbOpen = document.querySelector(".kit-sidebar.is-open");
            if (sbOpen) sidebar.close();            // click outside (on the dark backdrop)
        }
        var navBtn = t.closest("[data-kit-nav]");
        if (navBtn) {
            var menu = document.querySelector(navBtn.getAttribute("data-kit-nav"));
            if (menu) { closePop(false); setNav(menu, !menu.classList.contains("is-open")); }
            return;
        }
        // A click outside the bar, or on a menu link, closes the collapsible menu.
        openNavs().forEach(function (m) {
            var bar = m.closest(".kit-navbar") || m.parentNode;
            var link = t.closest("a[href]");
            if (!bar.contains(t) || (link && m.contains(link))) setNav(m, false);
        });

        var themeBtn = t.closest("[data-kit-theme-set]");
        if (themeBtn) { theme.set(themeBtn.getAttribute("data-kit-theme-set")); if (!keepOpen(themeBtn)) closePop(false); return; }

        var fsBtn = t.closest("[data-kit-fs-set]");
        if (fsBtn) { fontSize.set(fsBtn.getAttribute("data-kit-fs-set")); if (!keepOpen(fsBtn)) closePop(false); return; }

        var fsStep = t.closest("[data-kit-fs-step]");
        if (fsStep) { fontSize.step(parseInt(fsStep.getAttribute("data-kit-fs-step"), 10) || 0); return; }

        if (t.closest("[data-kit-reset]")) { reset(); return; }

        var layoutBtn = t.closest("[data-kit-layout-set]");
        if (layoutBtn) { layout.set(layoutBtn.getAttribute("data-kit-layout-set")); return; }

        if (t.closest("[data-kit-layout-toggle]")) { layout.toggle(); return; }

        var opt = t.closest(".kit-opt");
        if (opt && opt.closest(".kit-pop") && !opt.hasAttribute("aria-disabled")) { chooseOption(opt); return; }

        var tog = t.closest("[data-kit-toggle]");
        if (tog) {
            var pop = document.querySelector(tog.getAttribute("data-kit-toggle"));
            if (pop) togglePop(tog, pop);
            return;
        }

        var selBtn = t.closest("[data-kit-select] .kit-select-btn");
        if (selBtn) {
            var nst = selByWrap.get(selBtn.closest("[data-kit-select]"));
            if (nst) { if (!nst.pop.hidden) closePop(false); else nativeOpen(nst); return; }
            var p = selBtn.closest("[data-kit-select]").querySelector(".kit-pop");
            if (p) togglePop(selBtn, p);
            return;
        }

        var tab = t.closest("[data-kit-tabs] .kit-tab");
        if (tab) { selectTab(tab.closest("[data-kit-tabs]"), tab); return; }

        var spOpen = t.closest("[data-kit-split-open]");
        if (spOpen) {
            var sp1 = document.querySelector(spOpen.getAttribute("data-kit-split-open"));
            if (sp1) splitSet(sp1, true);
            return;
        }
        var spClose = t.closest("[data-kit-split-close]");
        if (spClose) { var sp2 = spClose.closest(SPLIT); if (sp2) splitSet(sp2, false); return; }
        var spFull = t.closest("[data-kit-split-full]");
        if (spFull) { var sp3 = spFull.closest(SPLIT); if (sp3) splitSet(sp3, true, !sp3.classList.contains("is-full")); return; }
        // The veil behind the panel (when it covers the list) is the container's ::after: a click there is a click on the container.
        if (t.matches(SPLIT) && t.hasAttribute("data-kit-split") && t.classList.contains("is-open")) {
            var pn = t.querySelector(".kit-split-panel");
            if (pn && getComputedStyle(pn).position === "fixed") { splitSet(t, false); return; }
        }

        var open = t.closest("[data-kit-open]");
        if (open) {
            var dlg = document.querySelector(open.getAttribute("data-kit-open"));
            if (dlg && dlg.showModal) {
                dlg.showModal();
                // The browser would give focus to the first element (often the close X, with its ring):
                // it is moved to the dialog itself, unless the author has marked an [autofocus].
                if (!dlg.querySelector("[autofocus]")) { dlg.tabIndex = -1; dlg.focus({ preventScroll: true }); }
            }
            return;
        }

        var dismiss = t.closest("[data-kit-dismiss]");
        if (dismiss) {
            var al = dismiss.closest(".kit-alert");
            if (al) {
                var parent = al.parentNode;
                al.remove();
                parent.dispatchEvent(new CustomEvent("kit:dismiss", { bubbles: true }));
            }
            return;
        }

        var close = t.closest("[data-kit-close]");
        if (close) {
            var d = close.closest("dialog");
            if (d) d.close();
            return;
        }

        // Click outside an open popover: closes it.
        // (a click in a combobox field does not close it)
        if (openPop && !openPop.pop.contains(t) && !(t.closest("[data-kit-combo]") && t.closest("[data-kit-combo]").contains(openPop.pop))) closePop(false);

        // Click on the backdrop (::backdrop) of a dialog: closes it.
        if (t instanceof HTMLDialogElement && t.classList.contains("kit-dialog") && !t.classList.contains("kit-busy")) {
            var r = t.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) t.close();
        }
    });

    document.addEventListener("keydown", function (e) {
        // Esc hides the visible tooltips (until the mouse or focus leave the element)
        if (e.key === "Escape") {
            document.querySelectorAll("[data-kit-tip]:is(:hover, :focus-visible)").forEach(function (el) {
                el.setAttribute("data-kit-tip-hide", "");
                function show() {
                    el.removeAttribute("data-kit-tip-hide");
                    el.removeEventListener("mouseleave", show);
                    el.removeEventListener("blur", show);
                }
                el.addEventListener("mouseleave", show);
                el.addEventListener("blur", show);
            });
        }

        if (openPop) {
            if (e.key === "Escape") { e.preventDefault(); closePop(true); return; }
            if (e.key === "Tab" && openPop.pop.querySelector(".kit-pop-search")) closePop(false);
            if (e.key === "ArrowDown") { e.preventDefault(); moveActive(openPop.pop, 1); return; }
            if (e.key === "ArrowUp") { e.preventDefault(); moveActive(openPop.pop, -1); return; }
            // in a combobox or search field the space is a character like any other
            if (e.key === "Enter" || (e.key === " " && !(e.target instanceof Element && e.target.closest("[data-kit-combo], .kit-pop-search")))) {
                var a = openPop.pop.querySelector(".kit-opt.is-active");
                // click() activates the item like a real click: its handlers and links run too
                if (a) { e.preventDefault(); a.click(); return; }
            }
        }
        // Esc closes the side panel (or brings it back next to the list, if it was full width).
        if (e.key === "Escape" && !e.defaultPrevented && !document.querySelector("dialog[open]") && !(e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable]"))) {
            var osp = document.querySelector("[data-kit-split].is-open");
            if (osp && osp.matches(SPLIT)) {
                if (osp.classList.contains("is-full")) splitSet(osp, true, false); else splitSet(osp, false);
                return;
            }
        }
        // Esc closes the slide-in sidebar and returns focus to whoever opened it.
        if (e.key === "Escape" && !e.defaultPrevented && !document.querySelector("dialog[open]") && document.querySelector(".kit-sidebar.is-open")) {
            sidebar.close();
            return;
        }
        // Esc closes the navbar's collapsible menu and returns focus to its button.
        if (e.key === "Escape") {
            var om = openNavs()[0];
            if (om) {
                setNav(om, false);
                var ob = document.querySelector('[data-kit-nav="#' + om.id + '"]');
                if (ob && ob.offsetParent !== null) ob.focus();
                return;
            }
        }
        // Left/right arrows between tabs.
        var tab = e.target instanceof Element && e.target.closest("[data-kit-tabs] .kit-tab");
        if (tab && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
            var tabs = tab.closest("[data-kit-tabs]");
            var all = Array.prototype.slice.call(tabs.querySelectorAll(".kit-tab"));
            var next = all[(all.indexOf(tab) + (e.key === "ArrowRight" ? 1 : -1) + all.length) % all.length];
            next.focus();
            selectTab(tabs, next);
        }
    });

    /* ---------- Initialization ---------- */
    /* ---------- Code snippets ----------
       <pre class="kit-code" data-kit-code="html|js|css"><code>…</code></pre> colors the code as in an editor (without the
       language it guesses it); data-kit-code-copy adds the «Copy» button. A small highlighter for HTML, JavaScript and
       CSS: it builds text nodes and <span>, never HTML, so the code shown is not executed. */
    function hlPut(out, cls, text) {
        if (!text) return;
        out.appendChild(cls ? mkEl("span", "kit-hl-" + cls, text) : document.createTextNode(text));
    }

    function hlText(out, text) {   // text of a page: entities (&amp;, &#8364;) are highlighted
        var re = /&#?\w+;/g, last = 0, m;
        while ((m = re.exec(text))) {
            hlPut(out, "", text.slice(last, m.index));
            hlPut(out, "num", m[0]);
            last = re.lastIndex;
        }
        hlPut(out, "", text.slice(last));
    }

    // Block comment from `from`: goes up to "*/" (if it does not close, to the end). With indexOf, not a regex, to stay linear.
    function hlComment(src, from, out) {
        var end = src.indexOf("*/", from + 2);
        end = end < 0 ? src.length : end + 2;
        hlPut(out, "com", src.slice(from, end));
        return end;
    }

    function hlJs(src, out) {
        var re = /(\/\/[^\n]*|\/\*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\[\s\S]|[^`\\])*`)|(\b\d[\d.]*\b)|\b(var|let|const|function|return|if|else|for|while|do|new|typeof|instanceof|in|of|this|true|false|null|undefined|class|async|await|try|catch|throw|break|continue|switch|case|default|delete|void)\b|\b([A-Z][\w$]*)|([A-Za-z_$][\w$]*)(?=\s*\()/g;
        var last = 0, m;
        while ((m = re.exec(src))) {
            hlPut(out, "", src.slice(last, m.index));
            if (m[0] === "/*") { re.lastIndex = hlComment(src, m.index, out); last = re.lastIndex; continue; }
            hlPut(out, m[1] ? "com" : m[2] ? "str" : m[3] ? "num" : m[4] ? "kw" : m[5] ? "type" : "fn", m[0]);
            last = re.lastIndex;
        }
        hlPut(out, "", src.slice(last));
    }

    function hlCssValue(src, out) {
        var re = /(\/\*)|("[^"]*"|'[^']*')|(#[0-9a-fA-F]{3,8}\b)|(-?\d*\.?\d+(?:px|rem|em|%|vh|vw|s|ms|deg|fr|ch)?)|\b(var|calc|color-mix|light-dark|rgba?|hsla?|min|max|clamp)(?=\()|(--[\w-]+)|(!important)/g;
        var last = 0, m;
        while ((m = re.exec(src))) {
            hlPut(out, "", src.slice(last, m.index));
            if (m[1]) { re.lastIndex = hlComment(src, m.index, out); last = re.lastIndex; continue; }
            hlPut(out, m[2] ? "str" : (m[3] || m[4]) ? "num" : m[5] ? "fn" : m[6] ? "attr" : "kw", m[0]);
            last = re.lastIndex;
        }
        hlPut(out, "", src.slice(last));
    }

    function hlCssSelector(seg, out) {
        var at = seg.match(/^(\s*)(@[\w-]+)([\s\S]*)$/);
        if (at) { hlPut(out, "", at[1]); hlPut(out, "kw", at[2]); hlCssValue(at[3], out); return; }
        var re = /(\.[\w-]+|#[\w-]+)|(::?[\w-]+(?:\([^)]{0,200}\))?)|(\[[^\]]{0,200}\])|([A-Za-z][\w-]*)/g;
        var last = 0, m;
        while ((m = re.exec(seg))) {
            hlPut(out, "", seg.slice(last, m.index));
            hlPut(out, m[2] ? "fn" : m[3] ? "str" : "tag", m[0]);
            last = re.lastIndex;
        }
        hlPut(out, "", seg.slice(last));
    }

    function hlCss(src, out) {
        var re = /(\/\*)|([{};])|([^{};\/]+|\/)/g, m;
        while ((m = re.exec(src))) {
            if (m[1]) re.lastIndex = hlComment(src, m.index, out);
            else if (m[2]) hlPut(out, "punct", m[2]);
            else if (src.charAt(re.lastIndex) === "{") hlCssSelector(m[3], out);
            else {
                var d = m[3].match(/^(\s*)(--?[\w-]+)(\s*:)([\s\S]*)$/);
                if (d) { hlPut(out, "", d[1]); hlPut(out, "attr", d[2]); hlPut(out, "punct", d[3]); hlCssValue(d[4], out); }
                else hlPut(out, "", m[3]);
            }
        }
    }

    function hlAttrs(str, out) {
        var re = /(\s+)([^\s=\/>"']+)(?:(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'>]+))?|([\s\S])/g, m;
        while ((m = re.exec(str))) {
            if (m[5] !== undefined) { hlPut(out, "", m[5]); continue; }
            hlPut(out, "", m[1]);
            hlPut(out, "attr", m[2]);
            if (m[3]) { hlPut(out, "punct", m[3]); hlPut(out, "str", m[4]); }
        }
    }

    // End of a tag: the first ">" outside quotes, or -1. A single pass: a text full of "<a" without ">" does not become quadratic.
    function hlTagEnd(src, from) {
        var q = "", ch;
        for (var i = from; i < src.length; i++) {
            ch = src.charAt(i);
            if (q) { if (ch === q) q = ""; }
            else if (ch === '"' || ch === "'") q = ch;
            else if (ch === ">") return i;
        }
        return -1;
    }

    function hlHtml(src, out) {
        var re = /<(!--|!doctype|\/?[A-Za-z][\w:-]*)/gi;
        var lower = src.toLowerCase(), last = 0, m;
        while ((m = re.exec(src))) {
            var start = m.index, tok = m[1], end;
            if (tok === "!--" || tok.toLowerCase() === "!doctype") {
                end = src.indexOf(tok === "!--" ? "-->" : ">", start + 2);
                end = end < 0 ? src.length : end + (tok === "!--" ? 3 : 1);
                hlText(out, src.slice(last, start));
                hlPut(out, "com", src.slice(start, end));
                last = re.lastIndex = end;
                continue;
            }
            var close = hlTagEnd(src, re.lastIndex);
            if (close < 0) break;   // no ">" until the end: the rest is text
            hlText(out, src.slice(last, start));
            var closing = tok.charAt(0) === "/", name = closing ? tok.slice(1) : tok;
            var attrs = src.slice(re.lastIndex, close), self = attrs.slice(-1) === "/";
            if (self) attrs = attrs.slice(0, -1);
            hlPut(out, "punct", closing ? "</" : "<");
            hlPut(out, "tag", name);
            hlAttrs(attrs, out);
            hlPut(out, "punct", (self ? "/" : "") + ">");
            last = re.lastIndex = close + 1;
            var low = name.toLowerCase();
            if (!closing && !self && (low === "script" || low === "style")) {
                var stop = lower.indexOf("</" + low, last);
                if (stop < 0) stop = src.length;
                (low === "script" ? hlJs : hlCss)(src.slice(last, stop), out);
                last = re.lastIndex = stop;
            }
        }
        hlText(out, src.slice(last));
    }

    function hlDetect(t) {
        t = t.trim();
        if (t.charAt(0) === "<") return "html";
        if (/^(@|:root)/.test(t) || /^[.#\[\w*,\s>+~:-]+\{/.test(t)) return "css";
        return "js";
    }

    var HL_MAX = 100000;   // beyond this length the text stays uncolored: highlighting must not be able to freeze the page

    // Kit.highlight(text, "html"|"js"|"css") → DOM fragment with the colored code (the language, if missing or unknown, is guessed)
    function highlight(text, lang) {
        var out = document.createDocumentFragment();
        text = String(text);
        if (text.length > HL_MAX) { out.appendChild(document.createTextNode(text)); return out; }
        lang = String(lang || "").toLowerCase();
        if (lang === "javascript") lang = "js";
        if (lang !== "html" && lang !== "js" && lang !== "css") lang = hlDetect(text);
        (lang === "html" ? hlHtml : lang === "css" ? hlCss : hlJs)(text, out);
        return out;
    }

    function copyText(text, done) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
            return;
        }
        var ta = mkEl("textarea"), ok = false;
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "0";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        ta.remove();
        done(ok);
    }

    var codeState = new WeakMap();

    // Kit.code(pre, { lang, text, copy, copyLabel, copiedLabel }) → { set(text, lang), text() }
    function code(target, opts) {
        var el = typeof target === "string" ? document.querySelector(target) : target;
        if (!el) return null;
        var pre = el.matches("code") && el.parentNode.matches("pre") ? el.parentNode : el;
        var st = codeState.get(pre);
        opts = opts || {};
        if (st) {
            if (opts.text !== undefined || opts.lang) st.api.set(opts.text !== undefined ? opts.text : st.text, opts.lang || st.lang);
            return st.api;
        }
        var c = pre.matches("code") ? pre : pre.querySelector("code");
        if (!c) {
            c = mkEl("code", "", pre.textContent);
            pre.textContent = "";
            pre.appendChild(c);
        }
        st = { text: opts.text !== undefined ? String(opts.text) : c.textContent, lang: opts.lang || pre.getAttribute("data-kit-code") || "" };
        function render() {
            c.textContent = "";
            try { c.appendChild(highlight(st.text, st.lang)); }
            catch (e) { c.textContent = st.text; }   // on error the code is shown without colors, never lost
        }
        st.api = {
            set: function (text, lang) { st.text = String(text); if (lang) st.lang = lang; render(); },
            text: function () { return st.text; }
        };
        codeState.set(pre, st);
        render();

        var wantCopy = opts.copy !== undefined ? opts.copy : pre.hasAttribute("data-kit-code-copy");
        if (wantCopy && pre.parentNode) {
            var label = opts.copyLabel || (typeof wantCopy === "string" ? wantCopy : "") || pre.getAttribute("data-kit-code-copy") || t("copy");
            var done = opts.copiedLabel || pre.getAttribute("data-kit-code-copied") || t("copied");
            var wrap = mkEl("div", "kit-snippet");
            pre.parentNode.insertBefore(wrap, pre);
            wrap.appendChild(pre);
            var btn = mkEl("button", "kit-btn kit-btn-ghost kit-snippet-copy", label);
            btn.type = "button";
            btn.setAttribute("aria-live", "polite");
            btn.addEventListener("click", function () {
                copyText(st.text, function (ok) {
                    btn.textContent = ok ? done : "—";
                    if (ok) pre.dispatchEvent(new CustomEvent("kit:copy", { bubbles: true, detail: { text: st.text } }));
                    setTimeout(function () { btn.textContent = label; }, 1500);
                });
            });
            wrap.appendChild(btn);
        }
        return st.api;
    }

    /* ---------- Table: sorting, text filter and pagination ----------
       <table class="kit-table" data-kit-sort data-kit-page="10" data-kit-empty="No results">   (each attribute is optional)
       <input class="kit-input" data-kit-filter="#table">                                          search field
       Sort and filter work on the rows of the first <tbody>; the type of a column (numbers, dates, text) is recognized from the content
       or written on <th data-kit-type="num|date|text">; a cell's value can differ from its text (<td data-kit-value="…">). */
    var tableState = new WeakMap();
    function tblLabels() { var m = t("table"); return { empty: t("noResults"), of: m.of, prev: m.prev, next: m.next, page: m.page, nav: m.nav }; }
    var NUM_RE = /^[+\-]?\s*[€$£]?\s*[+\-]?\d[\d.,\s]*\s*[%€$£]?$/;
    var DATE_DMY = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})(?:[ T,]+(\d{1,2}):(\d{2}))?$/;   // the day/month order depends on the language
    var DATE_YMD = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?$/;

    function tblText(node, skipSmall) {
        if (node.nodeType === 3) return node.nodeValue;
        if (node.nodeType !== 1 || (skipSmall && node.nodeName === "SMALL")) return "";
        var out = [];
        node.childNodes.forEach(function (n) { out.push(tblText(n, skipSmall)); });
        return out.join(node.nodeName === "SPAN" || node.nodeName === "B" || node.nodeName === "A" ? "" : " ");
    }

    function tblPlain(s) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

    function tblNumber(s) {
        s = s.replace(/[\s\u00a0]/g, "").replace(/[\u2212\u2013]/g, "-");
        if (!NUM_RE.test(s)) return null;
        var neg = s.indexOf("-") >= 0;
        s = s.replace(/[^\d.,]/g, "");
        var c = s.lastIndexOf(","), d = s.lastIndexOf(".");
        if (c >= 0 && d >= 0) s = c > d ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
        else if (c >= 0 || d >= 0) {
            // a single kind of separator: if it is the language's decimal one it is a decimal; otherwise it is a thousands separator only if the groups are of three digits
            var sep = c >= 0 ? "," : ".", dec = t("num.dec") === "," ? "," : ".";
            if (sep !== dec && new RegExp("^\\d{1,3}(\\" + sep + "\\d{3})+$").test(s)) s = s.split(sep).join("");
            else s = s.split(sep === "," ? "." : ",").join("").replace(",", ".");
        }
        var n = parseFloat(s);
        return isNaN(n) ? null : (neg ? -n : n);
    }

    function tblDate(s) {
        var m = DATE_DMY.exec(s), y, mo, d;
        if (m) { if (DT.order === "mdy") { mo = +m[1]; d = +m[2]; } else { d = +m[1]; mo = +m[2]; } y = +m[3]; }
        else if ((m = DATE_YMD.exec(s))) { y = +m[1]; mo = +m[2]; d = +m[3]; }
        else return null;
        if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
        return Date.UTC(y, mo - 1, d, +(m[4] || 0), +(m[5] || 0));
    }

    function tblEmpty(s) { return s === "" || s === "-" || s === "\u2014" || s === "\u2013"; }

    function tblTable(target, opts) {
        var table = resolveEl(target);
        if (!table || table.nodeName !== "TABLE") return null;
        if (tableState.has(table)) {
            var old = tableState.get(table);
            if (opts) old.configure(opts);
            return old.api;
        }
        var st = { table: table, rows: [], sorts: [], multi: false, query: "", size: 0, page: 1, labels: {}, sortable: false };
        var collator = null, wrap = table.parentNode && table.parentNode.classList.contains("kit-table-wrap") ? table.parentNode : null;
        var emptyRow = null, pager = null, info = null, pages = null;
        st.labels = tblLabels();

        function body() { return table.tBodies[0]; }
        function heads() { return table.tHead && table.tHead.rows.length ? Array.prototype.slice.call(table.tHead.rows[table.tHead.rows.length - 1].cells) : []; }
        function lab(k, n) { return String(st.labels[k]).replace("{n}", n); }

        function collect() {
            var b = body();
            st.rows = [];
            if (!b) return;
            Array.prototype.forEach.call(b.rows, function (tr, i) {
                if (tr.classList.contains("kit-table-empty")) return;
                if (tr.__kitIdx === undefined) tr.__kitIdx = i;
                st.rows.push(tr);
            });
            st.rows.forEach(function (tr, i) { tr.__kitIdx = i; tr.__kitText = null; });
        }

        function cellValue(tr, col) {
            var td = tr.cells[col];
            if (!td) return "";
            var v = td.getAttribute("data-kit-value");
            return (v !== null ? v : tblText(td, true)).replace(/\s+/g, " ").trim();
        }

        function colType(col) {
            var th = heads()[col], t = th && th.getAttribute("data-kit-type");
            if (t === "num" || t === "date" || t === "text") return t;
            var vals = st.rows.map(function (tr) { return cellValue(tr, col); }).filter(function (v) { return !tblEmpty(v); });
            if (!vals.length) return "text";
            if (vals.every(function (v) { return tblNumber(v) !== null; })) return "num";
            if (vals.every(function (v) { return tblDate(v) !== null; })) return "date";
            return "text";
        }

        function sortRows(list) {
            if (!st.sorts.length) return list.slice().sort(function (a, b) { return a.__kitIdx - b.__kitIdx; });
            if (!collator) collator = new Intl.Collator(i18nCode(), { numeric: true, sensitivity: "base" });
            var crit = st.sorts.map(function (c) { return { col: c.col, type: colType(c.col), dir: c.dir === "descending" ? -1 : 1 }; });
            var keyed = list.map(function (tr) {
                return { tr: tr, keys: crit.map(function (c) {
                    var raw = cellValue(tr, c.col);
                    return tblEmpty(raw) ? null : c.type === "num" ? tblNumber(raw) : c.type === "date" ? tblDate(raw) : raw;
                }) };
            });
            keyed.sort(function (a, b) {
                for (var n = 0; n < crit.length; n++) {
                    var x = a.keys[n], y = b.keys[n];
                    if (x === null || y === null) { if (x !== y) return x === null ? 1 : -1; continue; }
                    var r = crit[n].type === "text" ? collator.compare(x, y) : x - y;
                    if (r) return r * crit[n].dir;
                }
                return a.tr.__kitIdx - b.tr.__kitIdx;
            });
            return keyed.map(function (k) { return k.tr; });
        }

        function matches(tr, words) {
            if (!words.length) return true;
            if (tr.__kitText == null) tr.__kitText = tblPlain(tblText(tr, false).replace(/\s+/g, " "));
            return words.every(function (w) { return tr.__kitText.indexOf(w) >= 0; });
        }

        function ensurePager() {
            if (pager || !st.size) return;
            pager = mkEl("nav", "kit-pagination");
            pager.setAttribute("aria-label", st.labels.nav);
            info = mkEl("p", "kit-pagination-info");
            info.setAttribute("aria-live", "polite");
            pages = mkEl("div", "kit-pagination-pages");
            pager.appendChild(info);
            pager.appendChild(pages);
            (wrap || table).insertAdjacentElement("afterend", pager);
            pager.addEventListener("click", function (e) {
                var b = e.target instanceof Element && e.target.closest("button[data-p]");
                if (!b || b.disabled) return;
                goPage(+b.getAttribute("data-p"));
            });
        }

        function pageBtn(n, text, label, current, disabled) {
            var b = mkEl("button", "kit-btn kit-btn-ghost", text);
            b.type = "button";
            b.setAttribute("data-p", n);
            b.setAttribute("aria-label", label);
            if (current) { b.setAttribute("aria-current", "page"); b.classList.remove("kit-btn-ghost"); }
            if (disabled) b.disabled = true;
            return b;
        }

        function drawPager(total, from, to, nPages) {
            var hadFocus = pager.contains(document.activeElement), want = hadFocus ? document.activeElement.getAttribute("data-p") : null;
            info.textContent = total ? from + "\u2013" + to + " " + st.labels.of + " " + total : "0 " + st.labels.of + " " + st.rows.length;
            pages.textContent = "";
            pages.hidden = nPages <= 1;
            if (nPages <= 1) return;
            var cur = st.page;
            var pb = pageBtn(cur - 1, "\u2039", lab("prev"), false, cur === 1);
            pb.classList.add("kit-btn-icon");
            pages.appendChild(pb);
            var shown = [], last = 0;
            for (var p = 1; p <= nPages; p++) if (p === 1 || p === nPages || Math.abs(p - cur) <= 1 || (cur <= 3 && p <= 4) || (cur >= nPages - 2 && p >= nPages - 3)) shown.push(p);
            shown.forEach(function (p) {
                if (last && p - last > 1) { var gap = mkEl("span", "kit-pagination-gap", "\u2026"); gap.setAttribute("aria-hidden", "true"); pages.appendChild(gap); }
                pages.appendChild(pageBtn(p, String(p), lab("page", p), p === cur, false));
                last = p;
            });
            var nb = pageBtn(cur + 1, "\u203a", lab("next"), false, cur === nPages);
            nb.classList.add("kit-btn-icon");
            pages.appendChild(nb);
            if (want !== null) {
                var f = pages.querySelector('button[data-p="' + want + '"]:not(:disabled)') || pages.querySelector('[aria-current="page"]');
                if (f) f.focus({ preventScroll: true });
            }
        }

        // Redraws: order, filter, page. Events come from the methods that change the state, not from here.
        function render() {
            var b = body();
            if (!b) return;
            var words = tblPlain(st.query).split(/\s+/).filter(Boolean);
            var ordered = sortRows(st.rows);
            ordered.forEach(function (tr) { b.appendChild(tr); });
            var hit = ordered.filter(function (tr) { return matches(tr, words); });
            var nPages = st.size ? Math.max(1, Math.ceil(hit.length / st.size)) : 1;
            st.page = Math.min(Math.max(1, st.page), nPages);
            var from = st.size ? (st.page - 1) * st.size : 0, to = st.size ? Math.min(hit.length, from + st.size) : hit.length;
            var vis = hit.slice(from, to), set = new Set(vis);
            st.rows.forEach(function (tr) { tr.hidden = !set.has(tr); tr.classList.remove("is-last"); });
            if (vis.length) vis[vis.length - 1].classList.add("is-last");
            if (!emptyRow) {
                emptyRow = mkEl("tr", "kit-table-empty");
                emptyRow.appendChild(mkEl("td"));
            }
            emptyRow.firstChild.colSpan = Math.max(1, heads().length || (st.rows[0] ? st.rows[0].cells.length : 1));
            emptyRow.firstChild.textContent = st.labels.empty;
            if (!vis.length && !emptyRow.parentNode) b.appendChild(emptyRow);
            if (vis.length && emptyRow.parentNode) b.removeChild(emptyRow);
            if (!vis.length) emptyRow.classList.add("is-last"); else emptyRow.classList.remove("is-last");
            ensurePager();
            if (pager) drawPager(hit.length, from + 1, to, nPages);
            st.count = hit.length;
            st.pages = nPages;
        }

        function syncHeads() {
            heads().forEach(function (th, i) {
                if (!st.sortable || th.hasAttribute("data-kit-nosort")) return;
                var pos = -1;
                st.sorts.forEach(function (c, n) { if (c.col === i) pos = n; });
                th.setAttribute("aria-sort", pos >= 0 ? st.sorts[pos].dir : "none");
                if (th.__kitN) {
                    th.__kitN.textContent = pos >= 0 && st.sorts.length > 1 ? String(pos + 1) : "";
                    th.__kitN.hidden = th.__kitN.textContent === "";
                }
            });
        }

        function setupHeads() {
            heads().forEach(function (th, i) {
                if (th.hasAttribute("data-kit-nosort")) { th.removeAttribute("aria-sort"); return; }
                var cur = th.getAttribute("aria-sort");
                if ((cur === "ascending" || cur === "descending") && (st.multi || !st.sorts.length) && !st.sorts.some(function (c) { return c.col === i; })) st.sorts.push({ col: i, dir: cur });
                if (!th.querySelector(".kit-sort-btn")) {
                    var btn = mkEl("button", "kit-sort-btn");
                    btn.type = "button";
                    while (th.firstChild) btn.appendChild(th.firstChild);
                    var n = mkEl("span", "kit-sort-n");
                    n.hidden = true;
                    n.setAttribute("aria-hidden", "true");
                    btn.appendChild(n);
                    th.appendChild(btn);
                    th.__kitN = n;
                }
                th.setAttribute("aria-sort", cur === "ascending" || cur === "descending" ? cur : "none");
                th.__kitCol = i;
            });
        }

        function fire(name, detail) { table.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail })); }
        function sortDetail() {
            var c = st.sorts[0];
            return { column: c ? c.col : -1, direction: c ? c.dir : "none", criteria: st.sorts.map(function (c) { return { column: c.col, direction: c.dir }; }) };
        }

        // sortBy(col, dir) = a single column; sortBy([[col, dir], ...]) = several columns (only with data-kit-sort="multi")
        function sortBy(col, dir) {
            var list = Array.isArray(col) ? col : [[col, dir]];
            st.sorts = [];
            list.forEach(function (c) {
                var cc = Array.isArray(c) ? c[0] : c.column, dd = Array.isArray(c) ? c[1] : c.direction;
                if (dd === undefined && !Array.isArray(col)) dd = "ascending";
                if (dd !== "ascending" && dd !== "descending") return;
                if (!(cc >= 0) || st.sorts.some(function (x) { return x.col === cc; })) return;
                if (st.sorts.length && !st.multi) return;
                st.sorts.push({ col: cc, dir: dd });
            });
            st.page = 1;
            syncHeads();
            render();
            fire("kit:sort", sortDetail());
        }

        // Click on a header. With Shift or Ctrl/⌘ (and data-kit-sort="multi") the column is added, reversed or removed
        // from the list; without, it becomes the only criterion (and, if it already was, goes to descending, then to none).
        function headClick(col, add) {
            var cur = null;
            st.sorts.forEach(function (c) { if (c.col === col) cur = c; });
            var next = !cur ? "ascending" : cur.dir === "ascending" ? "descending" : "none";
            if (add && st.multi) {
                var list = st.sorts.filter(function (c) { return c.col !== col; }).map(function (c) { return [c.col, c.dir]; });
                if (next !== "none") {
                    if (cur) list.splice(st.sorts.indexOf(cur), 0, [col, next]); else list.push([col, next]);
                }
                sortBy(list);
            } else {
                if (st.sorts.length > 1) next = "ascending";
                sortBy(next === "none" ? [] : [[col, next]]);
            }
        }

        function setFilter(q) {
            q = q == null ? "" : String(q);
            if (q === st.query) return;
            st.query = q;
            st.page = 1;
            render();
            fire("kit:filter", { query: q, count: st.count });
        }

        function goPage(n) {
            var before = st.page;
            st.page = Math.max(1, Math.round(+n) || 1);
            render();
            if (st.page !== before) fire("kit:page", { page: st.page, pages: st.pages, size: st.size, total: st.count });
        }

        function setSize(n) {
            st.size = Math.max(0, Math.round(+n) || 0);
            st.page = 1;
            if (!st.size && pager) { pager.remove(); pager = info = pages = null; }
            render();
        }

        function configure(o) {
            if (o.labels) Object.keys(o.labels).forEach(function (k) { st.labels[k] = o.labels[k]; });
            if (o.empty != null) st.labels.empty = o.empty;
            if (o.sort !== undefined && (!!o.sort !== st.sortable || (o.sort === "multi") !== st.multi)) {
                st.multi = o.sort === "multi";
                st.sortable = !!o.sort;
                if (st.sortable) setupHeads();
                syncHeads();
            }
            if (o.size !== undefined) st.size = Math.max(0, Math.round(+o.size) || 0);
            if (o.filter !== undefined) st.query = String(o.filter);
            if (o.page !== undefined) st.page = Math.max(1, Math.round(+o.page) || 1);
            if (pager) pager.setAttribute("aria-label", st.labels.nav);
            render();
        }

        var api = {
            sort: function (col, dir) { sortBy(col, dir); },
            filter: function (q) { setFilter(q); },
            page: function (n) { if (n === undefined) return st.page; goPage(n); },
            pageSize: function (n) { if (n === undefined) return st.size; setSize(n); },
            refresh: function () { collect(); render(); },
            state: function () { return { sort: sortDetail(), query: st.query, page: st.page, pages: st.pages, size: st.size, total: st.rows.length, count: st.count }; }
        };
        st.api = api;
        st.configure = configure;
        tableState.set(table, st);

        table.addEventListener("click", function (e) {
            var th = e.target instanceof Element && e.target.closest("th");
            if (!th || !st.sortable || th.__kitCol === undefined || th.parentNode.parentNode !== table.tHead || th.hasAttribute("data-kit-nosort")) return;
            headClick(th.__kitCol, e.shiftKey || e.ctrlKey || e.metaKey);
        });

        collect();
        var o = opts || {};
        if (o.sort === undefined) o.sort = table.hasAttribute("data-kit-sort") ? (table.getAttribute("data-kit-sort") === "multi" ? "multi" : true) : false;
        if (o.size === undefined && table.hasAttribute("data-kit-page")) o.size = table.getAttribute("data-kit-page");
        if (o.empty === undefined && table.hasAttribute("data-kit-empty")) o.empty = table.getAttribute("data-kit-empty");
        configure(o);
        return api;
    }

    function tblPaginate(target, size) {
        var table = resolveEl(target);
        return tblTable(table, { size: size == null ? 10 : size });
    }

    function tblFilterInput(input) {
        if (input.__kitFilter) return;
        var table = resolveEl(input.getAttribute("data-kit-filter"));
        var api = table && tblTable(table);
        if (!api) return;
        input.__kitFilter = true;
        if (table.id && !input.hasAttribute("aria-controls")) input.setAttribute("aria-controls", table.id);
        if (input.value) api.filter(input.value);
        input.addEventListener("input", function () { api.filter(input.value); });
    }

    /* ---------- Accordion (kit-accordion): "only one open" and API ----------
       <div class="kit-accordion" data-kit-accordion="single"><details>…</details>…</div>
       Applies to the direct-child <details> (an accordion inside another is independent). "kit:accordion" event with { item, index, open }. */
    var accState = new WeakMap();

    function accordion(target, opts) {
        var el = resolveEl(target);
        if (!el) return null;
        var o = opts || {};
        var st = accState.get(el);
        if (!st) {
            st = { single: false };
            accState.set(el, st);
            el.addEventListener("toggle", function (e) {
                var d = e.target;
                if (!(d instanceof Element) || d.parentNode !== el || d.nodeName !== "DETAILS") return;
                if (st.single && d.open) items().forEach(function (x) { if (x !== d && x.open) x.open = false; });
                el.dispatchEvent(new CustomEvent("kit:accordion", { bubbles: true, detail: { item: d, index: items().indexOf(d), open: d.open } }));
            }, true);
        }
        function items() { return Array.prototype.filter.call(el.children, function (x) { return x.nodeName === "DETAILS"; }); }
        function pick(x) { return typeof x === "number" ? items()[x] : x; }
        function set(x, open) { var d = pick(x); if (d && d.parentNode === el) d.open = open === undefined ? !d.open : open; }
        st.single = o.single !== undefined ? !!o.single : el.getAttribute("data-kit-accordion") === "single";
        if (st.single) {
            var first = null;
            items().forEach(function (d) { if (d.open) { if (first) d.open = false; else first = d; } });
        }
        return {
            open: function (x) { set(x, true); },
            close: function (x) { set(x, false); },
            toggle: function (x) { set(x); },
            openAll: function () { if (!st.single) items().forEach(function (d) { d.open = true; }); },
            closeAll: function () { items().forEach(function (d) { d.open = false; }); },
            items: items
        };
    }

    /* ---------- Meter (kit-meter): a measure against a limit ----------
       <div class="kit-meter" data-kit-meter data-kit-value="78" data-kit-max="100" data-kit-warn="80" data-kit-danger="95" aria-label="Space"><i></i></div>
       The thresholds are in the same unit as the value (like the <meter> element). By default higher is worse: from warn up it is orange, from danger up
       red, below it is green. With data-kit-good="high" (a score) it reads the other way: up to warn orange, up to danger red.
       Without thresholds the bar stays in the accent color. Writes role="meter", aria-valuenow/min/max and --kit-value. Kit.meter(el).set(value). */
    function meter(target, opts) {
        var el = resolveEl(target);
        if (!el) return null;
        var o = opts || {};
        function num(name, key, def) {
            var v = o[key] !== undefined ? o[key] : el.getAttribute("data-kit-" + name);
            v = v === null || v === "" || v === undefined ? NaN : Number(v);
            return isNaN(v) ? def : v;
        }
        var min = num("min", "min", 0), max = num("max", "max", 100);
        if (max <= min) max = min + 100;
        var warn = num("warn", "warn", null), danger = num("danger", "danger", null);
        var high = (o.good !== undefined ? o.good : el.getAttribute("data-kit-good")) === "high";
        function state(v) {
            if (warn === null && danger === null) return "";
            if (high) return danger !== null && v <= danger ? "danger" : warn !== null && v <= warn ? "warning" : "success";
            return danger !== null && v >= danger ? "danger" : warn !== null && v >= warn ? "warning" : "success";
        }
        function set(value) {
            var v = Math.min(max, Math.max(min, Number(value)));
            if (isNaN(v)) v = min;
            el.setAttribute("role", "meter");
            el.setAttribute("aria-valuemin", String(min));
            el.setAttribute("aria-valuemax", String(max));
            el.setAttribute("aria-valuenow", String(v));
            el.style.setProperty("--kit-value", ((v - min) / (max - min) * 100) + "%");
            var s = state(v);
            ["success", "warning", "danger"].forEach(function (k) { el.classList.toggle("is-" + k, k === s); });
            el.setAttribute("data-kit-value", String(v));
            return v;
        }
        set(num("value", "value", min));
        return {
            set: set,
            value: function () { return Number(el.getAttribute("aria-valuenow")); },
            state: function () { return state(Number(el.getAttribute("aria-valuenow"))) || null; }
        };
    }

    /* ---------- Dates and times: calendar, range, date and time, time ----------
       <input class="kit-input" type="date" name="date" data-kit-datepicker>          calendar (also type="datetime-local" or "time")
       <div class="kit-daterange" data-kit-daterange><input type="date" name="from"><input type="date" name="to"></div>
       The visible field is text and shows the language's date order (dd/mm/yyyy or mm/dd/yyyy); the value sent with the form is always ISO (yyyy-mm-dd), in a
       hidden field that takes the name. Dates are ISO strings and the calculations are done in UTC: no time zone involved. */
    var DT = {
        get months() { return t("date.months"); },
        get days() { return t("date.days"); },
        get daysLong() { return t("date.daysLong"); },
        get presets() { return t("date.presets"); },
        get t() { return t("date.t"); },
        get order() { return t("date.order"); },
        get sep() { return t("date.sep"); },
        get first() { return t("date.first") === 0 ? 0 : 1; }
    };
    /* old period names (data-kit-presets) → today's names */
    var PRESET_ALIAS = { oggi: "today", ieri: "yesterday", mese: "month", "mese-scorso": "last-month", anno: "year", "anno-scorso": "last-year" };
    function presetKey(k) { return PRESET_ALIAS[k] || k; }
    var DTNS = "http://www.w3.org/2000/svg";
    var DTIC = {
        cal: [["rect", { x: 4, y: 5, width: 16, height: 15, rx: 2 }], ["path", { d: "M4 10h16M8 3v4M16 3v4" }]],
        clock: [["circle", { cx: 12, cy: 12, r: 9 }], ["path", { d: "M12 7v5l3 2" }]],
        left: [["path", { d: "m15 6-6 6 6 6" }]],
        right: [["path", { d: "m9 6 6 6-6 6" }]],
        x: [["path", { d: "M6 6l12 12M18 6 6 18" }]]
    };
    var dtMap = new WeakMap();
    var dtActive = null;
    var dtUid = 0;

    function dtIcon(shapes) {
        var s = document.createElementNS(DTNS, "svg");
        s.setAttribute("class", "kit-icon");
        s.setAttribute("viewBox", "0 0 24 24");
        s.setAttribute("aria-hidden", "true");
        shapes.forEach(function (sh) {
            var e = document.createElementNS(DTNS, sh[0]);
            Object.keys(sh[1]).forEach(function (k) { e.setAttribute(k, sh[1][k]); });
            s.appendChild(e);
        });
        return s;
    }

    function p2(n) { return (n < 10 ? "0" : "") + n; }
    function isoOf(y, m, d) { return ("000" + y).slice(-4) + "-" + p2(m) + "-" + p2(d); }
    function dim(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
    function isoParts(s) { return [+s.slice(0, 4), +s.slice(5, 7), +s.slice(8, 10)]; }
    function dtOkYear(iso) { var y = +iso.slice(0, 4); return y >= 1000 && y <= 9999; }
    function addDays(iso, n) {
        var a = isoParts(iso), d = new Date(Date.UTC(a[0], a[1] - 1, a[2] + n));
        return isoOf(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    }
    function addMonths(iso, n) {
        var a = isoParts(iso), t = a[0] * 12 + (a[1] - 1) + n, y = Math.floor(t / 12), m = t % 12 + 1;
        return isoOf(y, m, Math.min(a[2], dim(y, m)));
    }
    function monthStart(iso) { return iso.slice(0, 8) + "01"; }
    function monthEnd(iso) { var a = isoParts(iso); return isoOf(a[0], a[1], dim(a[0], a[1])); }
    function dowMon(iso) { var a = isoParts(iso); return (new Date(Date.UTC(a[0], a[1] - 1, a[2])).getUTCDay() + 6) % 7; }
    function todayIso() { var n = new Date(); return isoOf(n.getFullYear(), n.getMonth() + 1, n.getDate()); }
    function validYmd(y, m, d) { return y >= 1000 && y <= 9999 && m >= 1 && m <= 12 && d >= 1 && d <= dim(y, m); }
    /* day column in the language's week (Monday or Sunday first) */
    function dowCol(iso) { var w = dowMon(iso); return DT.first === 0 ? (w + 1) % 7 : w; }
    function fmtDate(iso) {
        if (!iso) return "";
        var y = iso.slice(0, 4), m = iso.slice(5, 7), d = iso.slice(8, 10), sp = DT.sep, o = DT.order;
        return o === "mdy" ? m + sp + d + sp + y : o === "ymd" ? y + sp + m + sp + d : d + sp + m + sp + y;
    }
    function dayLabel(iso) { var a = isoParts(iso); return DT.daysLong[dowMon(iso)] + " " + a[2] + " " + DT.months[a[1] - 1] + " " + a[0]; }

    /* Accepts the date written in the language's order (dd/mm/yyyy, mm/dd/yyyy or yyyy/mm/dd; also with . - or space, also d/m/yy or ddmmyyyy)
       and always yyyy-mm-dd. "" if empty, null if it is not a real date. */
    function parseDate(text) {
        var s = String(text == null ? "" : text).trim(), m, y, mo, d, o = DT.order;
        if (!s) return "";
        if ((m = /^(\d{4})[\/.\-\s](\d{1,2})[\/.\-\s](\d{1,2})$/.exec(s)) || (o === "ymd" && (m = /^(\d{4})(\d{2})(\d{2})$/.exec(s)))) { y = +m[1]; mo = +m[2]; d = +m[3]; }
        else if (o !== "ymd" && ((m = /^(\d{1,2})[\/.\-\s](\d{1,2})[\/.\-\s](\d{4}|\d{2})$/.exec(s)) || (m = /^(\d{2})(\d{2})(\d{4}|\d{2})$/.exec(s)))) {
            if (o === "mdy") { mo = +m[1]; d = +m[2]; } else { d = +m[1]; mo = +m[2]; }
            y = +m[3];
            if (m[3].length === 2) y += y < 70 ? 2000 : 1900;
        } else return null;
        return validYmd(y, mo, d) ? isoOf(y, mo, d) : null;
    }
    /* "9", "9:30", "9.30", "930", "09:30:15" → "09:30" */
    function parseTime(text) {
        var s = String(text == null ? "" : text).trim(), m;
        if (!s) return "";
        if (!((m = /^(\d{1,2})(?:[:.,hH\s](\d{2}))?(?::\d{2})?$/.exec(s)) || (m = /^(\d{1,2})(\d{2})$/.exec(s)))) return null;
        var h = +m[1], mi = +(m[2] || 0);
        return h < 24 && mi < 60 ? p2(h) + ":" + p2(mi) : null;
    }
    /* "12/11/2026 09:30", "2026-11-12T09:30" → "2026-11-12T09:30"; a date alone means midnight */
    function parseDateTime(text) {
        var s = String(text == null ? "" : text).trim();
        if (!s) return "";
        var m = /^(\S+?)(?:[T\s]+(.+))?$/.exec(s);
        if (!m) return null;
        var d = parseDate(m[1]), t = m[2] ? parseTime(m[2]) : "00:00";
        return d && t !== null ? d + "T" + t : null;
    }
    /* limits: ISO, "today" or an offset in days from today ("+7", "-30") */
    function dtBound(raw, kind, isMax) {
        raw = String(raw || "").trim().toLowerCase();
        if (!raw) return "";
        if (kind === "time") return parseTime(raw) || "";
        var d;
        if (raw === "oggi" || raw === "today") d = todayIso();
        else if (/^[+-]\d+$/.test(raw)) d = addDays(todayIso(), +raw);
        else d = parseDate(raw.slice(0, 10));
        if (!d) return "";
        if (kind === "date") return d;
        var tp = raw.length > 10 ? parseTime(raw.slice(11)) : "";
        return d + "T" + (tp || (isMax ? "23:59" : "00:00"));
    }
    /* "sab", "sat", "Saturday"… → 0 (Monday) … 6 (Sunday), in any loaded language; -1 if it is not a day */
    function dtDayIndex(w) {
        var k = String(w).toLowerCase().slice(0, 3), i = DT.days.indexOf(k);
        for (var c in I18N) if (i < 0 && I18N[c].date && I18N[c].date.days) i = I18N[c].date.days.indexOf(k);
        return i;
    }
    /* non-selectable days: "sat,sun,2026-12-25" or a function (iso) => true */
    function dtDisable(spec) {
        if (typeof spec === "function") return spec;
        var wd = {}, dates = {};
        String(spec || "").split(/[\s,;]+/).forEach(function (w) {
            if (!w) return;
            var i = dtDayIndex(w);
            if (i >= 0) wd[i] = true; else { var iso = parseDate(w); if (iso) dates[iso] = true; }
        });
        return function (iso) { return !!(wd[dowMon(iso)] || dates[iso]); };
    }
    function dtPreset(key) {
        var t = todayIso(), a = isoParts(t);
        switch (presetKey(key)) {
            case "today": return [t, t];
            case "yesterday": return [addDays(t, -1), addDays(t, -1)];
            case "7": case "30": case "90": return [addDays(t, 1 - +key), t];
            case "month": return [monthStart(t), monthEnd(t)];
            case "last-month": var pm = addMonths(monthStart(t), -1); return [pm, monthEnd(pm)];
            case "year": return [isoOf(a[0], 1, 1), isoOf(a[0], 12, 31)];
            case "last-year": return [isoOf(a[0] - 1, 1, 1), isoOf(a[0] - 1, 12, 31)];
        }
        return null;
    }

    /* ----- The popup (one per field) ----- */
    function dtPop(cfg) {
        var T = DT.t, mode = cfg.mode, hasCal = mode !== "time", hasTime = mode === "time" || mode === "datetime";
        var pop = mkEl("div", "kit-datepop");
        var S = { open: false, sub: "days", view: "", focus: "", yearBase: 0, step: "from", hover: "", sheet: false, panes: 1, hintEl: null, lockOv: null, raf: 0 };
        var hasPopover = typeof pop.showPopover === "function";
        pop.id = "kit-dp-" + (++dtUid);
        pop.setAttribute("role", "dialog");
        pop.setAttribute("aria-label", cfg.label);
        if (hasPopover) pop.setAttribute("popover", "manual");
        pop.hidden = true;
        var api = { pop: pop, isOpen: function () { return S.open; } };

        function bounds() { return cfg.bounds(); }
        function blocked(iso) {
            var b = bounds();
            return !!((b.min && iso < b.min) || (b.max && iso > b.max) || cfg.disabled(iso));
        }
        function clampDay(iso) {
            var b = bounds();
            if (b.min && iso < b.min) return b.min;
            if (b.max && iso > b.max) return b.max;
            return iso;
        }
        function sheetNow() { return window.matchMedia("(max-width: 575.98px)").matches; }
        function panesNow() { return mode === "range" && !sheetNow() && document.documentElement.clientWidth >= 720 ? 2 : 1; }
        function lastDay() { return monthEnd(addMonths(S.view, S.panes - 1)); }

        function btn(cls, text, act) {
            var b = mkEl("button", cls, text);
            b.type = "button";
            if (act) b.dataset.act = act;
            return b;
        }
        function navBtn(dir, show, dis, label) {
            var b = btn("kit-cal-nav" + (show ? "" : " is-void"), undefined, dir);
            b.setAttribute("aria-label", label);
            b.appendChild(dtIcon(dir === "prev" ? DTIC.left : DTIC.right));
            if (!show) { b.tabIndex = -1; b.disabled = true; b.setAttribute("aria-hidden", "true"); } else b.disabled = !!dis;
            return b;
        }
        function head(title, titleAct, showPrev, showNext, prevDis, nextDis, lp, ln) {
            var h = mkEl("div", "kit-cal-head");
            h.appendChild(navBtn("prev", showPrev, prevDis, lp));
            var tb = btn("kit-cal-title", title, titleAct);
            tb.setAttribute("aria-live", "polite");
            h.appendChild(tb);
            h.appendChild(navBtn("next", showNext, nextDis, ln));
            return h;
        }

        /* current value in a convenient form: {date, time} or {from, to} */
        function cur() { return cfg.get(); }
        function isSel(iso) {
            var v = cur();
            return mode === "range" ? (iso === v.from || iso === v.to) : iso === v.date;
        }

        function fixFocus() {
            var first = S.view, last = lastDay();
            if (S.focus && S.focus >= first && S.focus <= last) return;
            var v = cur(), c = mode === "range" ? (v.from || v.to) : v.date;
            if (c && c >= first && c <= last) S.focus = c;
            else {
                var t = todayIso();
                S.focus = t >= first && t <= last ? t : first;
            }
        }

        function paneDays(first, idx) {
            var a = isoParts(first), title = DT.months[a[1] - 1] + " " + a[0], b = bounds();
            var pane = mkEl("div", "kit-cal");
            pane.appendChild(head(title, "months", idx === 0, idx === S.panes - 1,
                idx === 0 && !!b.min && addDays(first, -1) < b.min, idx === S.panes - 1 && !!b.max && addMonths(first, 1) > b.max, T.prev, T.next));
            var table = mkEl("table", "kit-cal-grid");
            table.setAttribute("role", "grid");
            table.setAttribute("aria-label", title);
            var tr = mkEl("tr");
            for (var wc = 0; wc < 7; wc++) {
                var wi = DT.first === 0 ? (wc + 6) % 7 : wc;
                var th = mkEl("th", "", DT.days[wi]);
                th.scope = "col";
                th.abbr = DT.daysLong[wi];
                tr.appendChild(th);
            }
            var thead = mkEl("thead");
            thead.appendChild(tr);
            table.appendChild(thead);
            var tbody = mkEl("tbody"), start = addDays(first, -dowCol(first)), today = todayIso(), ym = first.slice(0, 7);
            for (var r = 0; r < 6; r++) {
                var row = mkEl("tr");
                for (var c = 0; c < 7; c++) {
                    var iso = addDays(start, r * 7 + c), out = iso.slice(0, 7) !== ym, td = mkEl("td");
                    td.setAttribute("role", "gridcell");
                    if (out && S.panes > 1) { row.appendChild(td); continue; }
                    td.dataset.d = iso;
                    var d = mkEl("button", "kit-cal-day" + (out ? " is-out" : "") + (iso === today ? " is-today" : ""), String(+iso.slice(8)));
                    d.type = "button";
                    d.dataset.d = iso;
                    d.tabIndex = iso === S.focus ? 0 : -1;
                    d.setAttribute("aria-label", dayLabel(iso));
                    if (iso === today) d.setAttribute("aria-current", "date");
                    if (blocked(iso)) d.setAttribute("aria-disabled", "true");
                    if (isSel(iso)) { d.classList.add("is-on"); td.setAttribute("aria-selected", "true"); }
                    td.appendChild(d);
                    row.appendChild(td);
                }
                tbody.appendChild(row);
            }
            table.appendChild(tbody);
            pane.appendChild(table);
            return pane;
        }

        function pickGrid(items, onCls) {
            var g = mkEl("div", "kit-cal-pick");
            items.forEach(function (it) {
                var b = mkEl("button", onCls(it) + (it.now ? " is-now" : ""), it.label);
                b.type = "button";
                Object.keys(it.data).forEach(function (k) { b.dataset[k] = it.data[k]; });
                if (it.on) b.classList.add("is-on");
                if (it.off) b.disabled = true;
                g.appendChild(b);
            });
            return g;
        }
        function paneMonths() {
            var y = +S.view.slice(0, 4), m0 = +S.view.slice(5, 7), pane = mkEl("div", "kit-cal"), b = bounds(), c = cur(), cv = mode === "range" ? c.from : c.date, now = todayIso();
            pane.appendChild(head(String(y), "years", true, true, !!b.min && y <= +b.min.slice(0, 4), !!b.max && y >= +b.max.slice(0, 4), T.prevYear, T.nextYear));
            pane.appendChild(pickGrid(DT.months.map(function (n, i) {
                var first = isoOf(y, i + 1, 1);
                return {
                    label: n.slice(0, 3), data: { m: String(i + 1) }, on: !!cv && cv.slice(0, 7) === first.slice(0, 7), now: now.slice(0, 7) === first.slice(0, 7),
                    off: !!((b.min && monthEnd(first) < b.min) || (b.max && first > b.max))
                };
            }), function () { return ""; }));
            return pane;
        }
        function paneYears() {
            var base = S.yearBase, pane = mkEl("div", "kit-cal"), b = bounds(), c = cur(), cv = mode === "range" ? c.from : c.date, ny = +todayIso().slice(0, 4), items = [];
            pane.appendChild(head(base + " – " + (base + 11), "days", true, true, base <= 1000, base + 11 >= 9999, T.prevYears, T.nextYears));
            for (var y = base; y < base + 12; y++) {
                items.push({
                    label: String(y), data: { y: String(y) }, on: !!cv && +cv.slice(0, 4) === y, now: y === ny,
                    off: y < 1000 || y > 9999 || !!((b.min && y < +b.min.slice(0, 4)) || (b.max && y > +b.max.slice(0, 4)))
                });
            }
            pane.appendChild(pickGrid(items, function () { return ""; }));
            return pane;
        }

        function timeCol(label, n, step, sel, key) {
            var wrap = mkEl("div", "kit-timecol-wrap");
            wrap.appendChild(mkEl("b", "", label));
            var list = mkEl("div", "kit-timecol");
            list.setAttribute("role", "listbox");
            list.setAttribute("aria-label", label);
            for (var v = 0; v < n; v += step) {
                var o = mkEl("button", "kit-timeopt" + (p2(v) === sel ? " is-on" : ""), p2(v));
                o.type = "button";
                o.dataset.t = key;
                o.dataset.v = p2(v);
                o.setAttribute("role", "option");
                o.setAttribute("aria-selected", String(p2(v) === sel));
                o.tabIndex = -1;
                list.appendChild(o);
            }
            wrap.appendChild(list);
            return wrap;
        }
        function timeEl() {
            var tm = cur().time || "", box = mkEl("div", "kit-timecols" + (hasCal ? " kit-datepop-time" : ""));
            box.appendChild(timeCol(T.hour, 24, 1, tm.slice(0, 2), "h"));
            box.appendChild(timeCol(T.minute, 60, cfg.step, tm.slice(3, 5), "m"));
            return box;
        }
        function timeSync() {
            var tm = cur().time || "", h = tm.slice(0, 2), mi = tm.slice(3, 5);
            pop.querySelectorAll(".kit-timecol").forEach(function (col) {
                var any = null;
                Array.prototype.forEach.call(col.children, function (o) {
                    var on = o.dataset.v === (o.dataset.t === "h" ? h : mi);
                    o.classList.toggle("is-on", on);
                    o.setAttribute("aria-selected", String(on));
                    o.tabIndex = -1;
                    if (on) any = o;
                });
                (any || col.firstChild).tabIndex = 0;
            });
        }
        function timeScroll() {
            pop.querySelectorAll(".kit-timecol").forEach(function (col) {
                var on = col.querySelector(".is-on");
                if (on) col.scrollTop = on.offsetTop - col.offsetTop - (col.clientHeight - on.offsetHeight) / 2;
            });
        }

        function presetsEl() {
            var box = mkEl("div", "kit-datepop-presets"), v = cur();
            box.setAttribute("role", "group");
            cfg.presets.forEach(function (k) {
                var r = dtPreset(k);
                if (!r) return;
                var b = bounds(), from = b.min && r[0] < b.min ? b.min : r[0], to = b.max && r[1] > b.max ? b.max : r[1];
                var e = mkEl("button", "", DT.presets[presetKey(k)] || k);
                e.type = "button";
                e.dataset.preset = k;
                if (from > to) e.disabled = true;
                else if (v.from === from && v.to === to) e.classList.add("is-on");
                box.appendChild(e);
            });
            return box;
        }
        function footEl() {
            var left = [], right = [];
            if (mode === "date") {
                var td = btn("kit-btn kit-btn-ghost", T.today, "today");
                if (blocked(todayIso())) td.disabled = true;
                left.push(td);
            }
            if (!cfg.required()) (mode === "date" ? right : left).push(btn("kit-btn kit-btn-ghost", T.clear, "clear"));
            if (mode === "datetime" || mode === "time") right.push(btn("kit-btn kit-btn-primary", T.done, "done"));
            if (!left.length && !right.length) return null;
            var f = mkEl("div", "kit-datepop-foot");
            left.concat(right).forEach(function (b) { f.appendChild(b); });
            return f;
        }
        function hintText() { return S.step === "to" ? T.to : T.from; }

        function paintRange() {
            if (mode !== "range") return;
            var v = cur(), from = v.from, end = v.to || (S.step === "to" && from && S.hover > from ? S.hover : "");
            pop.querySelectorAll(".kit-cal-grid td[data-d]").forEach(function (td) {
                var d = td.dataset.d;
                td.classList.toggle("is-range", !!(from && end && d > from && d < end));
                td.classList.toggle("is-start", !!(from && end && d === from));
                td.classList.toggle("is-end", !!(from && end && d === end));
                if (td.firstChild) td.firstChild.classList.toggle("is-on", d === from || d === v.to);
            });
            if (S.hintEl) S.hintEl.textContent = hintText();
        }

        function render(focusSel) {
            var scrolls = Array.prototype.map.call(pop.querySelectorAll(".kit-timecol"), function (c) { return c.scrollTop; });
            pop.textContent = "";
            pop.classList.toggle("is-sheet", S.sheet);
            if (hasCal && S.sub === "days") fixFocus();
            var top = mkEl("div", "kit-datepop-top");
            top.appendChild(mkEl("span", "", cfg.label));
            var x = btn("kit-btn kit-btn-ghost kit-btn-icon", undefined, "close");
            x.setAttribute("aria-label", T.close);
            x.appendChild(dtIcon(DTIC.x));
            top.appendChild(x);
            pop.appendChild(top);
            S.hintEl = null;
            if (mode === "range") { S.hintEl = mkEl("p", "kit-datepop-hint", hintText()); pop.appendChild(S.hintEl); }
            var body = mkEl("div", "kit-datepop-body");
            if (mode === "range" && cfg.presets.length) body.appendChild(presetsEl());
            if (hasCal) {
                var cals = mkEl("div", "kit-datepop-cals");
                if (S.sub === "days") for (var i = 0; i < S.panes; i++) cals.appendChild(paneDays(addMonths(S.view, i), i));
                else cals.appendChild(S.sub === "months" ? paneMonths() : paneYears());
                body.appendChild(cals);
            }
            if (hasTime) body.appendChild(timeEl());
            pop.appendChild(body);
            if (hasTime) timeSync();
            var foot = footEl();
            if (foot) pop.appendChild(foot);
            paintRange();
            Array.prototype.forEach.call(pop.querySelectorAll(".kit-timecol"), function (c, i) { if (scrolls[i] != null) c.scrollTop = scrolls[i]; });
            if (focusSel) {
                var el = pop.querySelector(focusSel);
                if (el && !el.disabled) el.focus({ preventScroll: true });
            }
        }

        function place() {
            if (S.sheet) { pop.style.top = ""; pop.style.left = ""; pop.style.maxHeight = ""; return; }
            var a = cfg.anchor.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = window.innerHeight;
            pop.style.maxHeight = "";
            pop.style.top = "0px";
            pop.style.left = "0px";
            var w = pop.offsetWidth, h = pop.offsetHeight;
            var left = Math.max(8, Math.min(a.left, vw - w - 8)), below = vh - a.bottom - 14, above = a.top - 14, top;
            if (h <= below) top = a.bottom + 6;
            else if (h <= above) top = a.top - 6 - h;
            else if (below >= above) { top = a.bottom + 6; pop.style.maxHeight = Math.max(160, below) + "px"; }   // there is room neither above nor below: the wider side is used and the popup scrolls
            else { pop.style.maxHeight = Math.max(160, above) + "px"; top = Math.max(8, a.top - 6 - pop.offsetHeight); }
            pop.style.left = left + "px";
            pop.style.top = top + "px";
        }
        function relayout() {
            if (!S.open) return;
            if (!cfg.anchor.isConnected) { close(false); return; }
            var sh = sheetNow(), pn = panesNow();
            if (sh !== S.sheet || pn !== S.panes) {
                var ae = document.activeElement, d = ae && pop.contains(ae) ? ae.dataset.d : "";
                S.sheet = sh;
                S.panes = pn;
                lock(sh);
                render(d ? 'button[data-d="' + d + '"]' : null);
            }
            place();
        }
        function onWin(e) {
            if (e.type === "scroll" && e.target instanceof Node && pop.contains(e.target)) return;
            if (S.raf) return;
            S.raf = requestAnimationFrame(function () { S.raf = 0; relayout(); });
        }
        function lock(on) {
            if (on && S.lockOv === null) { S.lockOv = root.style.overflow; root.style.overflow = "hidden"; }
            else if (!on && S.lockOv !== null) { root.style.overflow = S.lockOv; S.lockOv = null; }
        }

        function open(o) {
            if (S.open || cfg.readonly()) return;
            o = o || {};
            if (dtActive && dtActive !== api) dtActive.close(false);
            closePop(false);
            S.sheet = sheetNow();
            S.panes = panesNow();
            S.sub = "days";
            S.step = o.step || "from";
            S.hover = "";
            var v = cur(), c = mode === "range" ? (S.step === "to" && v.from ? v.from : v.from || v.to) : v.date;
            S.focus = c || clampDay(todayIso());
            S.view = monthStart(S.focus);
            if (hasCal) fixFocus();
            render(null);
            pop.hidden = false;
            if (hasPopover) { try { pop.showPopover(); } catch (e) { /* already open */ } }
            S.open = true;
            dtActive = api;
            lock(S.sheet);
            place();
            window.addEventListener("resize", onWin);
            window.addEventListener("scroll", onWin, true);
            cfg.onToggle(true);
            if (hasCal) {
                var d = pop.querySelector('button[data-d="' + S.focus + '"]');
                if (d) d.focus({ preventScroll: true });
            }
            if (hasTime) { timeScroll(); if (!hasCal) { var s0 = pop.querySelector('.kit-timeopt[tabindex="0"]'); if (s0) s0.focus({ preventScroll: true }); } }
        }
        function close(returnFocus) {
            if (!S.open) return;
            S.open = false;
            if (dtActive === api) dtActive = null;
            window.removeEventListener("resize", onWin);
            window.removeEventListener("scroll", onWin, true);
            lock(false);
            if (hasPopover) { try { pop.hidePopover(); } catch (e) { /* already closed */ } }
            pop.hidden = true;
            cfg.onToggle(false);
            if (returnFocus) {
                var i = cfg.input();
                if (i && i.getAttribute("inputmode") === "none") i = cfg.button;   // on the phone the field would open the keyboard
                if (i && i.isConnected) i.focus({ preventScroll: true });
            }
        }
        api.open = open;
        api.close = close;
        api.render = function () { if (S.open) render(null); };

        /* ----- actions ----- */
        function showMonthOf(iso, spec) {
            S.focus = iso;
            if (iso < S.view) S.view = monthStart(iso);
            else if (iso > lastDay()) S.view = addMonths(monthStart(iso), -(S.panes - 1));
            render(spec);
        }
        function pickDay(iso) {
            if (blocked(iso)) return;
            var sel = 'button[data-d="' + iso + '"]';
            if (mode === "range") {
                var v = cur();
                if (S.step === "to" && v.from && iso >= v.from) { cfg.set({ from: v.from, to: iso }, true); close(true); return; }
                cfg.set({ from: iso, to: "" }, false);
                S.step = "to";
                S.hover = iso;
                S.focus = iso;
                if (iso.slice(0, 7) < S.view.slice(0, 7) || iso > lastDay()) showMonthOf(iso, sel); else paintRange();
                return;
            }
            cfg.set({ date: iso }, true);
            if (mode === "date") { close(true); return; }
            S.focus = iso;
            if (iso < S.view || iso > lastDay()) showMonthOf(iso, sel); else render(sel);
        }
        function nav(dir) {
            if (S.sub === "days") {
                var f = addMonths(S.focus, dir), v = addMonths(S.view, dir);
                if (!dtOkYear(f) || !dtOkYear(v)) return;
                S.focus = f; S.view = v;
            } else if (S.sub === "months") {
                var y = +S.view.slice(0, 4) + dir;
                if (y < 1000 || y > 9999) return;
                S.view = isoOf(y, +S.view.slice(5, 7), 1);
                S.focus = S.view;
            } else {
                S.yearBase = Math.max(1000, Math.min(9988, S.yearBase + dir * 12));
            }
            render('[data-act="' + (dir < 0 ? "prev" : "next") + '"]:not(:disabled)');
            if (!pop.contains(document.activeElement)) {
                var d = pop.querySelector('.kit-cal-day[tabindex="0"], .kit-cal-pick button:not(:disabled)');
                if (d) d.focus({ preventScroll: true });
            }
        }
        function pickTime(key, val) {
            var tm = cur().time || "", h = key === "h" ? val : (tm.slice(0, 2) || "00"), m = key === "m" ? val : (tm.slice(3, 5) || "00");
            var hadDate = mode === "datetime" && !!cur().date;
            cfg.set({ time: h + ":" + m }, true);
            if (mode === "datetime" && !hadDate) { S.focus = cur().date; showMonthOf(S.focus, '.kit-timeopt[data-t="' + key + '"][data-v="' + val + '"]'); }
            else timeSync();
        }

        pop.addEventListener("click", function (e) {
            e.preventDefault();   // a click inside the popup must not reach the <label> that contains it
            var t = e.target instanceof Element ? e.target.closest("button") : null;
            if (!t || !pop.contains(t) || t.disabled) return;
            var ds = t.dataset;
            if (ds.d) { pickDay(ds.d); return; }
            if (ds.m) {
                var y = +S.view.slice(0, 4), mo = +ds.m, fd = +S.focus.slice(8, 10);
                S.sub = "days";
                S.view = isoOf(y, mo, 1);
                S.focus = clampDay(isoOf(y, mo, Math.min(fd, dim(y, mo))));
                render(null);
                var nd = pop.querySelector('button[data-d="' + S.focus + '"]');
                if (nd) nd.focus({ preventScroll: true });
                return;
            }
            if (ds.y) {
                S.sub = "months";
                S.view = isoOf(+ds.y, +S.view.slice(5, 7), 1);
                render(".kit-cal-pick button.is-on, .kit-cal-pick button");
                return;
            }
            if (ds.t) { pickTime(ds.t, ds.v); return; }
            if (ds.preset) {
                var r = dtPreset(ds.preset), b = bounds();
                if (r) cfg.set({ from: b.min && r[0] < b.min ? b.min : r[0], to: b.max && r[1] > b.max ? b.max : r[1] }, true);
                close(true);
                return;
            }
            switch (ds.act) {
                case "prev": nav(-1); break;
                case "next": nav(1); break;
                case "months":
                    S.sub = "months";
                    render(".kit-cal-title");
                    break;
                case "years":
                    var yy = +S.view.slice(0, 4);
                    S.sub = "years";
                    S.yearBase = Math.max(1000, Math.min(9988, yy - (yy % 12)));
                    render(".kit-cal-title");
                    break;
                case "days":
                    S.sub = "days";
                    render(null);
                    var dd = pop.querySelector('.kit-cal-day[tabindex="0"]');
                    if (dd) dd.focus({ preventScroll: true });
                    break;
                case "today": pickDay(todayIso()); break;
                case "clear":
                    cfg.set(mode === "range" ? { from: "", to: "" } : mode === "time" ? { time: "" } : { date: "", time: "" }, true);
                    close(true);
                    break;
                case "done": case "close": close(true); break;
            }
        });

        pop.addEventListener("mouseover", function (e) {
            if (mode !== "range" || S.step !== "to" || !(e.target instanceof Element)) return;
            var b = e.target.closest(".kit-cal-day");
            if (b && b.dataset.d !== S.hover) { S.hover = b.dataset.d; paintRange(); }
        });
        pop.addEventListener("focusin", function (e) {
            if (mode !== "range" || S.step !== "to" || !(e.target instanceof Element)) return;
            var b = e.target.closest(".kit-cal-day");
            if (b && b.dataset.d !== S.hover) { S.hover = b.dataset.d; paintRange(); }
        });

        pop.addEventListener("keydown", function (e) {
            if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(true); return; }
            if (e.key === "Tab") {
                var f = Array.prototype.filter.call(pop.querySelectorAll("button"), function (b) { return !b.disabled && b.tabIndex >= 0 && b.offsetParent !== null; });
                if (!f.length) return;
                var edge = e.shiftKey ? f[0] : f[f.length - 1];
                if (document.activeElement === edge) {
                    if (S.sheet) { e.preventDefault(); (e.shiftKey ? f[f.length - 1] : f[0]).focus({ preventScroll: true }); }
                    else { close(false); var i = cfg.input(); if (i && i.getAttribute("inputmode") !== "none") i.focus({ preventScroll: true }); }   // Tab continues from the field
                }
                return;
            }
            var t = e.target instanceof Element ? e.target : null;
            if (!t) return;
            var n = null;
            if (t.dataset.d) {
                var d = t.dataset.d;
                switch (e.key) {
                    case "ArrowLeft": n = addDays(d, -1); break;
                    case "ArrowRight": n = addDays(d, 1); break;
                    case "ArrowUp": n = addDays(d, -7); break;
                    case "ArrowDown": n = addDays(d, 7); break;
                    case "Home": n = addDays(d, -dowCol(d)); break;
                    case "End": n = addDays(d, 6 - dowCol(d)); break;
                    case "PageUp": n = addMonths(d, e.shiftKey ? -12 : -1); break;
                    case "PageDown": n = addMonths(d, e.shiftKey ? 12 : 1); break;
                }
                if (n) {
                    e.preventDefault();
                    if (!dtOkYear(n)) return;
                    var nb = pop.querySelector('button[data-d="' + n + '"]');
                    if (nb) { t.tabIndex = -1; nb.tabIndex = 0; S.focus = n; nb.focus({ preventScroll: true }); }
                    else showMonthOf(n, 'button[data-d="' + n + '"]');
                }
            } else if (t.closest(".kit-cal-pick")) {
                var list = Array.prototype.filter.call(t.parentNode.children, function (b) { return !b.disabled; }), i2 = list.indexOf(t), step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 }[e.key];
                if (step && list[i2 + step]) { e.preventDefault(); list[i2 + step].focus({ preventScroll: true }); }
            } else if (t.dataset.t) {
                var col = t.parentNode, opts = Array.prototype.slice.call(col.children), i3 = opts.indexOf(t), nx = null;
                if (e.key === "ArrowDown") nx = opts[i3 + 1];
                else if (e.key === "ArrowUp") nx = opts[i3 - 1];
                else if (e.key === "Home") nx = opts[0];
                else if (e.key === "End") nx = opts[opts.length - 1];
                else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    var cols = pop.querySelectorAll(".kit-timecol"), oc = cols[e.key === "ArrowRight" ? 1 : 0];
                    if (oc && oc !== col) nx = oc.querySelector('.kit-timeopt[tabindex="0"]') || oc.firstChild;
                }
                if (nx) { e.preventDefault(); nx.focus({ preventScroll: true }); }
            }
        });

        return api;
    }

    /* ----- A text field (date, date and time, time) ----- */
    function dtSlot(input, kind, role) {
        var d = input.dataset, s = { input: input, kind: kind, role: role || "", value: "", hidden: null, bad: false, other: null, disabled: function () { return false; } };
        s.rawMin = d.kitMin || input.getAttribute("min") || "";
        s.rawMax = d.kitMax || input.getAttribute("max") || "";
        s.min = function () { return dtBound(s.rawMin, kind, false); };
        s.max = function () { return dtBound(s.rawMax, kind, true); };
        s.parse = kind === "time" ? parseTime : kind === "datetime" ? parseDateTime : parseDate;
        s.fmt = function (v) {
            if (!v) return "";
            return kind === "time" ? v : kind === "datetime" ? fmtDate(v.slice(0, 10)) + " " + v.slice(11, 16) : fmtDate(v);
        };
        var start = s.parse(input.value);
        s.value = start || "";
        if (kind !== "time") {
            s.hidden = document.createElement("input");
            s.hidden.type = "hidden";
            if (input.name) { s.hidden.name = input.name; input.removeAttribute("name"); }
            if (input.getAttribute("form")) s.hidden.setAttribute("form", input.getAttribute("form"));
            s.hidden.defaultValue = s.value;
            s.hidden.value = s.value;
            s.hidden.disabled = input.disabled;
            input.parentNode.insertBefore(s.hidden, input.nextSibling);
        }
        input.type = "text";
        input.setAttribute("inputmode", window.matchMedia("(pointer: coarse)").matches ? "none" : "numeric");
        input.setAttribute("autocomplete", "off");
        input.setAttribute("autocapitalize", "off");
        input.setAttribute("spellcheck", "false");
        input.setAttribute("aria-haspopup", "dialog");
        input.setAttribute("aria-expanded", "false");
        input.setAttribute("data-kit-dp-input", "");
        if (!input.getAttribute("placeholder")) input.setAttribute("placeholder", kind === "time" ? DT.t.phTime : kind === "datetime" ? DT.t.phDT : DT.t.phDate);
        input.defaultValue = s.fmt(s.value);
        input.value = s.fmt(s.value);
        return s;
    }
    function dtValidate(s) {
        var T = DT.t, msg = "", v = s.value;
        if (s.bad) msg = (s.kind === "time" ? T.invalidTime : s.kind === "datetime" ? T.invalidDT : T.invalid).replace("{f}", s.kind === "time" ? T.phTime : s.kind === "datetime" ? T.phDT : T.phDate);
        else if (v) {
            var mn = s.min(), mx = s.max();
            if (mn && v < mn) msg = T.min.replace("{d}", s.fmt(mn));
            else if (mx && v > mx) msg = T.max.replace("{d}", s.fmt(mx));
            else if (s.kind !== "time" && s.disabled(v.slice(0, 10))) msg = T.unavailable;
            else if (s.role === "to" && s.other && s.other.value && v < s.other.value) msg = T.order;
        }
        s.input.setCustomValidity(msg);
        return msg;
    }
    function dtMark(s) { if (dtValidate(s)) s.input.setAttribute("aria-invalid", "true"); else s.input.removeAttribute("aria-invalid"); }
    function dtWrite(s, val) {
        s.value = val || "";
        s.bad = false;
        if (s.hidden) s.hidden.value = s.value;
        s.input.value = s.fmt(s.value);
        dtMark(s);
        if (s.other) dtMark(s.other);
    }
    function dtFromText(s) {
        var p = s.parse(s.input.value);
        s.bad = p === null;
        s.value = p || "";
        if (s.hidden) s.hidden.value = s.value;
        dtValidate(s);
        if (s.other) dtValidate(s.other);
    }

    /* Connects one or two fields (slots) to a popup. host = element that holds the fields and the button. */
    function dtMount(host, slots, mode, o) {
        var s0 = slots[0], d = (mode === "range" ? host : s0.input).dataset, field = { el: host, silent: false };
        var presets = o.presets != null ? o.presets : d.kitPresets != null ? d.kitPresets : "7,30,month,last-month,year";
        if (typeof presets === "string") presets = /^(none|no|nessuno)$/i.test(presets.trim()) ? [] : presets.split(/[\s,;]+/).filter(Boolean);
        var stepRaw = o.step || parseInt(d.kitStep, 10) || (s0.input.step ? Math.round(parseFloat(s0.input.step) / 60) : 0) || 1;
        var disable = dtDisable(o.disable != null ? o.disable : d.kitDisable);
        slots.forEach(function (s) { s.disabled = disable; });
        var T = DT.t, label = mode === "range" ? T.pickRange : mode === "datetime" ? T.pickDateTime : mode === "time" ? T.pickTime : T.pickDate;
        var btn = mkEl("button", "kit-date-btn");
        btn.type = "button";
        btn.tabIndex = -1;
        btn.setAttribute("aria-label", mode === "time" ? T.openTime : T.open);
        btn.setAttribute("aria-haspopup", "dialog");
        btn.setAttribute("aria-expanded", "false");
        btn.appendChild(dtIcon(mode === "time" ? DTIC.clock : DTIC.cal));
        host.appendChild(btn);

        var idx = 0, dp;
        function emit(changed, detail) {
            field.silent = true;
            changed.forEach(function (s) {
                s.input.dispatchEvent(new Event("input", { bubbles: true }));
                s.input.dispatchEvent(new Event("change", { bubbles: true }));
            });
            field.silent = false;
            host.dispatchEvent(new CustomEvent("kit:change", { bubbles: true, detail: detail }));
        }
        function detail() {
            if (mode === "range") return { from: slots[0].value, to: slots[1].value };
            return { value: s0.value, display: s0.input.value };
        }
        var cfg = {
            button: btn, mode: mode, label: label, anchor: host, step: Math.max(1, Math.min(30, stepRaw)),
            presets: presets, disabled: disable,
            input: function () { return slots[idx].input; },
            required: function () { return slots.some(function (s) { return s.input.required; }); },
            readonly: function () { return slots.some(function (s) { return s.input.disabled || s.input.readOnly; }); },
            bounds: function () {
                if (mode === "time") return { min: "", max: "" };
                var mn = s0.min(), mx = s0.max();
                return { min: mn.slice(0, 10), max: mx.slice(0, 10) };
            },
            get: function () {
                if (mode === "range") return { from: slots[0].value, to: slots[1].value };
                if (mode === "date") return { date: s0.value };
                if (mode === "time") return { time: s0.value };
                return { date: s0.value.slice(0, 10), time: s0.value.slice(11, 16) };
            },
            set: function (patch, doEmit) {
                var changed = [];
                if (mode === "range") {
                    if ("from" in patch) { dtWrite(slots[0], patch.from); changed.push(slots[0]); }
                    if ("to" in patch) { dtWrite(slots[1], patch.to); changed.push(slots[1]); }
                } else if (mode === "datetime") {
                    var c = cfg.get(), date = "date" in patch ? patch.date : c.date, time = "time" in patch ? patch.time : c.time;
                    if (date || time) {
                        if (!date) { var b = cfg.bounds(), t = todayIso(); date = b.min && t < b.min ? b.min : b.max && t > b.max ? b.max : t; }
                        time = time || "00:00";
                    }
                    dtWrite(s0, date ? date + "T" + time : "");
                    changed.push(s0);
                } else {
                    dtWrite(s0, mode === "time" ? patch.time : patch.date);
                    changed.push(s0);
                }
                if (doEmit) emit(changed, detail());
            },
            onToggle: function (on) {
                btn.setAttribute("aria-expanded", String(on));
                slots.forEach(function (s) { s.input.setAttribute("aria-expanded", String(on)); s.input.setAttribute("aria-controls", dp.pop.id); });
            }
        };
        dp = dtPop(cfg);
        host.appendChild(dp.pop);

        function openFor(i) {
            idx = i;
            var v = cfg.get();
            dp.open({ step: mode === "range" && i === 1 && v.from ? "to" : "from" });
        }
        btn.addEventListener("click", function () {
            if (dp.isOpen()) { dp.close(false); return; }
            var v = cfg.get();
            openFor(mode === "range" && v.from && !v.to ? 1 : 0);
        });
        slots.forEach(function (s, i) {
            var inp = s.input;
            inp.addEventListener("input", function (e) {
                var v = inp.value;
                if (e.inputType && e.inputType.indexOf("insert") === 0 && inp.selectionStart === v.length) {
                    var nv = null;
                    if (s.kind === "time") { if (/^\d{2}$/.test(v)) nv = v + ":"; }
                    else if (/^\d{2}$/.test(v) || /^\d{2}\/\d{2}$/.test(v)) nv = v + "/";
                    else if (s.kind === "datetime" && /^\d{2}\/\d{2}\/\d{4}$/.test(v)) nv = v + " ";
                    else if (s.kind === "datetime" && /^\d{2}\/\d{2}\/\d{4} \d{2}$/.test(v)) nv = v + ":";
                    if (nv) inp.value = nv;
                }
                dtFromText(s);
            });
            inp.addEventListener("change", function () {
                if (field.silent) return;
                dtFromText(s);
                if (s.value) inp.value = s.fmt(s.value);
                dtMark(s);
                if (s.other) dtMark(s.other);
                host.dispatchEvent(new CustomEvent("kit:change", { bubbles: true, detail: detail() }));
            });
            inp.addEventListener("keydown", function (e) {
                if (e.key === "ArrowDown" || (e.altKey && e.key === "ArrowDown")) { e.preventDefault(); openFor(i); }
            });
            inp.addEventListener("click", function () {
                // on the phone the field does not open the keyboard: a tap opens the calendar
                if (inp.getAttribute("inputmode") === "none" && !dp.isOpen()) openFor(i);
            });
            var form = inp.form;
            if (form) {
                form.addEventListener("reset", function () { setTimeout(function () { if (inp.isConnected) { dtFromText(s); dtMark(s); } }, 0); });
                form.addEventListener("formdata", function (e) { if (s.hidden && s.hidden.name && (inp.disabled || s.hidden.disabled)) e.formData.delete(s.hidden.name); });
            }
        });
        // a click outside the popup closes it
        var api = {
            el: host, open: function () { openFor(0); }, close: function () { dp.close(false); },
            get: function () { return mode === "range" ? { from: slots[0].value, to: slots[1].value } : s0.value; },
            set: function (v, doEmit) {
                if (mode === "range") { v = v || {}; cfg.set({ from: parseDate(v.from) || "", to: parseDate(v.to) || "" }, !!doEmit); }
                else { var p = s0.parse(v); cfg.set(mode === "time" ? { time: p || "" } : mode === "datetime" ? { date: p ? p.slice(0, 10) : "", time: p ? p.slice(11, 16) : "" } : { date: p || "" }, !!doEmit); }
            },
            clear: function (doEmit) { api.set(mode === "range" ? {} : "", doEmit); },
            input: s0.input
        };
        return api;
    }

    /* Calendar, date and time, time: <input data-kit-datepicker> (the type is read from type="date|datetime-local|time"). */
    function datePicker(target, opts) {
        var input = typeof target === "string" ? document.querySelector(target) : target;
        if (!input || !input.matches || !input.matches("input") || input.type === "hidden") return null;
        var prev = dtMap.get(input);
        if (prev) return prev;
        opts = opts || {};
        var kind = opts.type || input.getAttribute("data-kit-datepicker");
        if (kind !== "date" && kind !== "datetime" && kind !== "time") {
            kind = input.type === "time" || input.hasAttribute("data-kit-timepicker") ? "time" : input.type === "datetime-local" ? "datetime" : "date";
        }
        var wrap = mkEl("div", "kit-date");
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(input);
        var slot = dtSlot(input, kind);
        var api = dtMount(wrap, [slot], kind, opts);
        dtMap.set(input, api);
        return api;
    }
    /* Range: <div class="kit-daterange" data-kit-daterange> with two <input type="date"> (from, to). */
    function dateRange(target, opts) {
        var wrap = typeof target === "string" ? document.querySelector(target) : target;
        if (!wrap) return null;
        var prev = dtMap.get(wrap);
        if (prev) return prev;
        var inputs = Array.prototype.filter.call(wrap.querySelectorAll("input"), function (i) { return i.type !== "hidden"; }).slice(0, 2);
        if (inputs.length < 2) return null;
        opts = opts || {};
        wrap.classList.add("kit-daterange");
        var a = dtSlot(inputs[0], "date", "from"), b = dtSlot(inputs[1], "date", "to");
        a.other = b;
        b.other = a;
        var api = dtMount(wrap, [a, b], "range", opts);
        dtMap.set(wrap, api);
        return api;
    }
    /* A click outside the open popup closes it (on the dark edge of the phone sheet the target is the popup itself). */
    document.addEventListener("click", function (e) {
        if (!dtActive) return;
        var pop = dtActive.pop, t = e.target;
        if (!(t instanceof Node)) return;
        if (t === pop) {
            var r = pop.getBoundingClientRect();
            if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) return;
            dtActive.close(false);
            return;
        }
        var host = pop.parentNode;
        // the popup is rebuilt on every click on one of its buttons: the target may no longer be there, so the event path is checked
        if (e.composedPath().indexOf(pop) >= 0) return;
        if (!(host && host.contains(t) && t instanceof Element && t.closest(".kit-date-btn, input"))) dtActive.close(false);
    });

    /* ---------- Forms: show/hide password, character counter, validation ----------
       <button type="button" class="kit-control-end" data-kit-password aria-label="Show password">…</button>
       <span class="kit-counter" data-kit-count="#note"></span>                       (uses the field's maxlength)
       <form data-kit-validate>   on submit checks the fields with the HTML rules (required, pattern, min, maxlength…), marks the fields
       with is-invalid, writes the message in .kit-feedback-invalid (creates it if missing) and moves focus to the first error.
       data-kit-validate="ok" also marks is-valid. Messages: data-kit-msg or data-kit-msg-required|type|pattern|min|max|minlength|maxlength|step on the field. */
    document.addEventListener("click", function (e) {
        var b = e.target instanceof Element ? e.target.closest("[data-kit-password]") : null;
        if (!b) return;
        var inp = b.getAttribute("data-kit-password") ? document.querySelector(b.getAttribute("data-kit-password")) : (b.closest(".kit-control, .kit-input-group, .kit-field") || b.parentNode).querySelector("input");
        if (!inp) return;
        var show = inp.type === "password";
        inp.type = show ? "text" : "password";
        b.setAttribute("aria-pressed", String(show));
        b.setAttribute("aria-label", show ? (b.getAttribute("data-kit-label-hide") || t("password.hide")) : (b.getAttribute("data-kit-label-show") || t("password.show")));
    });

    function counterUpdate(c) {
        var inp = document.querySelector(c.getAttribute("data-kit-count"));
        if (!inp) return;
        var n = inp.value.length, max = inp.maxLength > 0 ? inp.maxLength : 0;
        c.textContent = max ? n + " / " + max : String(n);
        c.classList.toggle("is-near", max > 0 && n >= max * 0.9 && n < max);
        c.classList.toggle("is-full", max > 0 && n >= max);
    }
    function counterFor(inp) {
        document.querySelectorAll("[data-kit-count]").forEach(function (c) {
            var sel = c.getAttribute("data-kit-count");
            try { if (inp.matches(sel)) counterUpdate(c); } catch (err) { /* invalid selector */ }
        });
    }

    var VAL_KEYS = [["valueMissing", "Required"], ["typeMismatch", "Type"], ["patternMismatch", "Pattern"], ["tooShort", "Minlength"], ["tooLong", "Maxlength"], ["rangeUnderflow", "Min"], ["rangeOverflow", "Max"], ["stepMismatch", "Step"]];
    var valUid = 0;

    function valMsg(c) {
        var d = c.dataset, v = c.validity;
        if (v.customError) return c.validationMessage;     // setCustomValidity (for example the calendar) wins over everything
        for (var i = 0; i < VAL_KEYS.length; i++) if (v[VAL_KEYS[i][0]] && d["kitMsg" + VAL_KEYS[i][1]]) return d["kitMsg" + VAL_KEYS[i][1]];
        return d.kitMsg || c.validationMessage;
    }
    function valBox(c) {
        if (c.type === "radio") return c.closest(".kit-field, fieldset, .kit-check-group") || c.parentNode;
        return c.closest(".kit-field") || c.closest(".kit-check, .kit-switch") || c.closest("[data-kit-native]") || c;
    }
    function valControls(box) {
        if (box.matches("input, select, textarea")) return box.willValidate ? [box] : [];
        return Array.prototype.filter.call(box.querySelectorAll("input, select, textarea"), function (c) { return c.willValidate && c.type !== "hidden"; });
    }
    function valFocusTarget(c) {
        var w = c.closest("[data-kit-native]");
        if (w) return w.querySelector(".kit-select-btn") || c;
        var f = c.closest(".kit-file.is-ready");
        if (f) return f.querySelector(".kit-file-btn") || c;
        return c;
    }
    function valDescribe(c, id, on) {
        var cur = (c.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean), i = cur.indexOf(id);
        if (on && i < 0) cur.push(id);
        if (!on && i >= 0) cur.splice(i, 1);
        if (cur.length) c.setAttribute("aria-describedby", cur.join(" ")); else c.removeAttribute("aria-describedby");
    }
    /* State of a field (or group): show = show the errors; ok = also mark is-valid. Returns the first invalid control. */
    function valBoxUpdate(box, show, ok) {
        var list = valControls(box), bad = null;
        list.forEach(function (c) { if (!bad && !c.validity.valid) bad = c; });
        if (!show) return bad;
        box.classList.toggle("is-invalid", !!bad);
        box.classList.toggle("is-valid", !bad && !!ok && list.length > 0);
        list.forEach(function (c) { if (c === bad) c.setAttribute("aria-invalid", "true"); else if (c.getAttribute("aria-invalid") === "true") c.removeAttribute("aria-invalid"); });
        var host = box.matches("input, select, textarea") ? box.parentNode : box;
        var fb = host.querySelector(".kit-feedback-invalid");
        if (bad) {
            if (!fb) {
                fb = mkEl("small", "kit-feedback kit-feedback-invalid");
                fb.setAttribute("data-kit-auto", "");
                if (box.matches("input, select, textarea")) box.parentNode.insertBefore(fb, box.nextSibling); else box.appendChild(fb);
            }
            if (!fb.id) fb.id = "kit-fb-" + (++valUid);
            if (fb.hasAttribute("data-kit-auto") || !fb.textContent.trim()) fb.textContent = valMsg(bad);
            fb.hidden = false;
            list.forEach(function (c) { valDescribe(c, fb.id, c === bad); });
        } else if (fb) {
            list.forEach(function (c) { if (fb.id) valDescribe(c, fb.id, false); });
            if (fb.hasAttribute("data-kit-auto")) fb.remove(); else fb.hidden = true;
        }
        var okfb = host.querySelector(".kit-feedback-valid");
        if (okfb) okfb.hidden = !!bad || !ok;
        return bad;
    }
    function valForm(form, opts) {
        if (typeof form === "string") form = document.querySelector(form);
        if (!form) return true;
        opts = opts || {};
        var ok = opts.ok !== undefined ? opts.ok : form.getAttribute("data-kit-validate") === "ok", seen = [], first = null, fields = [];
        Array.prototype.forEach.call(form.elements, function (c) {
            if (!c.willValidate || c.type === "hidden") return;
            var box = valBox(c);
            if (seen.indexOf(box) >= 0) return;
            seen.push(box);
            var bad = valBoxUpdate(box, true, ok);
            if (bad) { fields.push(bad); if (!first) first = bad; }
        });
        if (fields.length) {
            if (opts.focus !== false) valFocusTarget(first).focus();
            form.dispatchEvent(new CustomEvent("kit:invalid", { bubbles: true, detail: { fields: fields } }));
        }
        return fields.length === 0;
    }
    valForm.reset = function (form) {
        if (typeof form === "string") form = document.querySelector(form);
        if (!form) return;
        form.querySelectorAll(".is-invalid, .is-valid").forEach(function (b) { b.classList.remove("is-invalid", "is-valid"); });
        form.querySelectorAll('[aria-invalid="true"]').forEach(function (c) { c.removeAttribute("aria-invalid"); });
        form.querySelectorAll(".kit-feedback-invalid, .kit-feedback-valid").forEach(function (fb) { if (fb.hasAttribute("data-kit-auto")) fb.remove(); else fb.hidden = true; });
    };

    function valForm0(c) { return c instanceof Element && c.form && c.form.hasAttribute("data-kit-validate") ? c.form : null; }
    document.addEventListener("submit", function (e) {
        var f = e.target;
        if (!(f instanceof HTMLFormElement) || !f.hasAttribute("data-kit-validate")) return;
        f.noValidate = true;
        if (!valForm(f)) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    document.addEventListener("input", function (e) {
        var c = e.target;
        if (c instanceof Element && c.matches("input, textarea")) counterFor(c);
        var f = valForm0(c);
        if (!f) return;
        c.setAttribute("data-kit-dirty", "");
        var box = valBox(c);
        if (box.classList.contains("is-invalid")) valBoxUpdate(box, true, f.getAttribute("data-kit-validate") === "ok");   // the error disappears as soon as it is corrected
    });
    document.addEventListener("change", function (e) {
        var c = e.target, f = valForm0(c);
        if (!f) return;
        c.setAttribute("data-kit-dirty", "");
        var box = valBox(c);
        if (box.classList.contains("is-invalid") || c.type === "radio" || c.type === "checkbox" || c.tagName === "SELECT") valBoxUpdate(box, true, f.getAttribute("data-kit-validate") === "ok");
    });
    document.addEventListener("focusout", function (e) {
        var c = e.target, f = valForm0(c);
        if (!f || !c.hasAttribute("data-kit-dirty")) return;       // a field never touched does not turn red just because it is passed over
        var to = e.relatedTarget;
        if (to instanceof Element && c.closest(".kit-date, .kit-daterange, .kit-combo, .kit-select, .kit-file") && c.closest(".kit-date, .kit-daterange, .kit-combo, .kit-select, .kit-file").contains(to)) return;   // focus moves to the calendar or the menu of the same field
        valBoxUpdate(valBox(c), true, f.getAttribute("data-kit-validate") === "ok");
    });
    document.addEventListener("reset", function (e) {
        var f = e.target;
        if (!(f instanceof HTMLFormElement)) return;
        setTimeout(function () {
            if (f.hasAttribute("data-kit-validate")) { valForm.reset(f); f.querySelectorAll("[data-kit-dirty]").forEach(function (c) { c.removeAttribute("data-kit-dirty"); }); }
            f.querySelectorAll("[data-kit-count]").forEach(counterUpdate);
            document.querySelectorAll("[data-kit-count]").forEach(function (c) { var i = document.querySelector(c.getAttribute("data-kit-count")); if (i && i.form === f) counterUpdate(c); });
        }, 0);
    });
    function formsInit(scope) {
        scope.querySelectorAll("[data-kit-count]").forEach(counterUpdate);
        scope.querySelectorAll("[data-kit-password]").forEach(function (b) {
            if (b.tagName === "BUTTON" && !b.getAttribute("type")) b.type = "button";
            if (!b.hasAttribute("aria-pressed")) b.setAttribute("aria-pressed", "false");
            if (!b.hasAttribute("aria-label")) b.setAttribute("aria-label", b.getAttribute("data-kit-label-show") || t("password.show"));
        });
        var forms = Array.prototype.slice.call(scope.querySelectorAll("form[data-kit-validate]"));
        if (scope instanceof HTMLFormElement && scope.hasAttribute("data-kit-validate")) forms.push(scope);
        forms.forEach(function (f) {
            f.noValidate = true;
            f.querySelectorAll(".kit-feedback-invalid, .kit-feedback-valid").forEach(function (fb) {
                var box = fb.closest(".kit-field") || fb.parentNode;
                if (!box.classList.contains("is-invalid") && !box.classList.contains("is-valid") && !box.querySelector('[aria-invalid="true"]')) fb.hidden = true;
            });
        });
    }

    /* ---------- Fixed columns (kit-table-fix data-kit-fix="2|3|4") ----------
       The cumulative widths of the first columns become --kit-fix-1, -2, -3: they are the "left" of the following columns.
       They are measured again when the table changes size (window, larger text, new rows). */
    var fixed = new WeakSet();

    function fixMeasure(table) {
        var n = Math.min(4, parseInt(table.getAttribute("data-kit-fix"), 10) || 1);
        var row = table.tHead && table.tHead.rows[0] || table.rows[0];
        if (!row) return;
        var acc = 0;
        for (var i = 0; i < n - 1 && i < row.cells.length; i++) {
            acc += row.cells[i].getBoundingClientRect().width;
            table.style.setProperty("--kit-fix-" + (i + 1), acc + "px");
        }
    }

    function fixTable(table) {
        if (fixed.has(table) || !table.hasAttribute("data-kit-fix")) return;
        fixed.add(table);
        fixMeasure(table);
        if (window.ResizeObserver) new ResizeObserver(function () { fixMeasure(table); }).observe(table);
        else window.addEventListener("resize", function () { fixMeasure(table); });
    }

        function init(scope) {
        scope = scope || document;
        scope.querySelectorAll("table.kit-table-fix[data-kit-fix]").forEach(fixTable);
        scope.querySelectorAll("[data-kit-accordion]").forEach(function (a) { accordion(a); });
        scope.querySelectorAll("[data-kit-meter]").forEach(function (m) { meter(m); });
        scope.querySelectorAll("input[data-kit-datepicker], input[data-kit-timepicker]").forEach(function (i) { datePicker(i); });
        scope.querySelectorAll("[data-kit-daterange]").forEach(function (w) { dateRange(w); });
        formsInit(scope);
        scope.querySelectorAll("table[data-kit-sort], table[data-kit-page]").forEach(function (t) { tblTable(t); });
        scope.querySelectorAll("[data-kit-filter]").forEach(function (i) { tblFilterInput(i); });
        scope.querySelectorAll("select[data-kit-select]").forEach(function (s) { nativeSelect(s); });
        scope.querySelectorAll("[data-kit-select]:not(select):not([data-kit-native])").forEach(function (sel) {
            var btn = sel.querySelector(".kit-select-btn");
            var pop = sel.querySelector(".kit-pop");
            if (btn) { btn.setAttribute("aria-haspopup", "listbox"); btn.setAttribute("aria-expanded", "false"); }
            if (pop) pop.setAttribute("role", "listbox");
            var on = sel.querySelector(".kit-opt.is-on");
            if (on) {
                sel.dataset.value = on.dataset.value || "";
                var label = sel.querySelector(".kit-select-value");
                var text = on.querySelector(".kit-opt-text b");
                if (label && !label.textContent.trim()) label.textContent = (text || on).textContent.trim();
            }
            sel.querySelectorAll(".kit-opt").forEach(function (o) {
                o.setAttribute("role", "option");
                o.setAttribute("aria-selected", String(o.classList.contains("is-on")));
            });
        });
        scope.querySelectorAll("[data-kit-combo]").forEach(function (c) { combo(c); });
        scope.querySelectorAll("[data-kit-file]").forEach(function (c) { fileField(c); });
        scope.querySelectorAll("[data-kit-code]").forEach(function (c) { code(c); });
        scope.querySelectorAll("[data-kit-tabs]").forEach(function (tabs) {
            tabs.setAttribute("role", "tablist");
            var cur = tabs.querySelector(".kit-tab.is-on") || tabs.querySelector(".kit-tab");
            tabs.querySelectorAll(".kit-tab").forEach(function (t) { t.setAttribute("role", "tab"); });
            if (cur) selectTab(tabs, cur);
        });
        scope.querySelectorAll("[data-kit-nav]").forEach(function (b) {
            b.setAttribute("aria-expanded", "false");
            var id = b.getAttribute("data-kit-nav");
            if (id.charAt(0) === "#" && !b.hasAttribute("aria-controls")) b.setAttribute("aria-controls", id.slice(1));
        });
        syncLayoutButtons();
        syncFsButtons();
        scope.querySelectorAll("[data-kit-sidebar-toggle]").forEach(function (b) {
            var sel = b.getAttribute("data-kit-sidebar-toggle");
            var sb = sideBar(sel);
            if (sb && sb.id && !b.hasAttribute("aria-controls")) b.setAttribute("aria-controls", sb.id);
        });
        sideSync();
        scope.querySelectorAll("[data-kit-theme-set]").forEach(function (b) {
            b.setAttribute("aria-pressed", String(b.getAttribute("data-kit-theme-set") === theme.get()));
        });
    }

    // Dropping files anywhere on the page (zone with data-kit-file-page).
    document.addEventListener("dragenter", function (e) {
        if (!pageFileZone || !hasFiles(e)) return;
        e.preventDefault();
        pageDragN++;
        if (!dropVeil) {
            dropVeil = mkEl("div", "kit-drop-veil");
            dropVeil.setAttribute("aria-hidden", "true");
            document.body.appendChild(dropVeil);
        }
        dropVeil.textContent = pageFileZone.text;
        dropVeil.classList.add("is-on");
    });
    document.addEventListener("dragover", function (e) { if (pageFileZone && hasFiles(e)) e.preventDefault(); });
    document.addEventListener("dragleave", function () { if (pageFileZone && --pageDragN <= 0) endPageDrag(); });
    document.addEventListener("drop", function (e) {
        if (!pageFileZone || !hasFiles(e)) return;
        e.preventDefault();
        endPageDrag();
        if (pageFileZone.wrap.isConnected) fileDrop(pageFileZone.wrap, pageFileZone.st, e.dataTransfer);
    });

    // Applies the saved theme at once (avoids the flash if the script is in the <head>).
    var saved = readStored();
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

    // Same for the text size.
    var savedFs = readFs();
    if (savedFs) root.setAttribute("data-kit-fs", savedFs);

    // Same for the width: the user's choice wins over the one written in the HTML.
    var savedLayout = readLayout();
    if (savedLayout) root.setAttribute("data-layout", savedLayout);

    // Same for the compact or expanded sidebar.
    var savedSide = readSide();
    if (savedSide) root.setAttribute("data-kit-sidebar", savedSide);
    window.addEventListener("resize", sideSync);

    // htmx: every fragment inserted by htmx fires "htmx:load"; it is initialized (once per container, even if the
    // inserted nodes are many). init() can be repeated without duplicating anything, and starts from the container because the node itself
    // (for example a table replaced with outerHTML) is not found by the searches it does on what it contains.
    var htmxQueue = null;
    document.addEventListener("htmx:load", function (e) {
        var t = e.target;
        if (!(t instanceof Element) || t === document.body || t === root) return;
        var scope = t.parentNode instanceof Element ? t.parentNode : t;
        if (!htmxQueue) {
            htmxQueue = new Set();
            Promise.resolve().then(function () {
                var list = htmxQueue;
                htmxQueue = null;
                list.forEach(function (el) { if (el.isConnected) init(el); });
            });
        }
        htmxQueue.add(scope);
    });

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { init(); });
    else init();

    window.Kit = { i18n: i18n, theme: theme, layout: layout, sidebar: sidebar, fontSize: fontSize, reset: reset, toast: toast, undo: undo, confirm: confirmDialog, split: split, file: fileField, progress: progressDialog, combo: combo, select: nativeSelect, code: code, highlight: highlight, barChart: barChart, lineChart: lineChart, donut: donut, sparkline: sparkline, table: tblTable, paginate: tblPaginate, accordion: accordion, meter: meter, datepicker: datePicker, daterange: dateRange, validate: valForm, date: { parse: parseDate, parseTime: parseTime, format: fmtDate, today: todayIso, labels: DT }, init: init };
})();
