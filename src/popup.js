window.onload = function() {
    var tm = chrome.extension.getBackgroundPage().tm;
    var min_tabs_element = document.getElementById("min_tabs_cv");
    var mte = document.getElementById("min_tabs");
    var tab_life_element = document.getElementById("tab_life_cv");
    var tle = document.getElementById("tab_life");
    var cleanup_interval_element = document.getElementById("cleanup_interval_cv");
    var cie = document.getElementById("cleanup_interval");
    var ctbox = document.getElementById("ct-box");
    var node = '';
    min_tabs_element.textContent = tm.minTabs;
    mte.value = tm.minTabs;
    tab_life_element.textContent = tm.tabLife;
    tle.value = tm.tabLife;
    cleanup_interval_element.textContent = tm.cleanupInterval;
    cie.value = tm.cleanupInterval;
    mte.addEventListener("change", minTabsHandler);
    mte.addEventListener("input", minTabsUpdater);
    tle.addEventListener("change", tleHandler);
    tle.addEventListener("input", tleUpdater);
    cie.addEventListener("change", cieHandler);
    cie.addEventListener("input", cieUpdate);
    for (var i = 0; i < tm.closedTabs.length; i++) {
        if (tm.closedTabs[i]) {
            node = '<a href="' + tm.closedTabs[i] + '" target="_blank">' + tm.closedTabs[i] + '</a><br /><br />';
            ctbox.innerHTML += node;
        }
    }
}

function minTabsHandler(event) {
    var tm = chrome.extension.getBackgroundPage().tm;
    tm.updateMinTabs(event.target.value);
}

function minTabsUpdater(event) {
    var min_tabs_element = document.getElementById("min_tabs_cv");
    min_tabs_element.textContent = event.target.value
}

function tleHandler(event) {
    var tm = chrome.extension.getBackgroundPage().tm;
    tm.updateTabLife(event.target.value);
}

function tleUpdater(event) {
    var tab_life_element = document.getElementById("tab_life_cv");
    tab_life_element.textContent = event.target.value
}

function cieHandler(event) {
    var tm = chrome.extension.getBackgroundPage().tm;
    tm.updateCleanupInterval(event.target.value);
}

function cieUpdate(event) {
    var cleanup_interval_element = document.getElementById("cleanup_interval_cv");
    cleanup_interval_element.textContent = event.target.value
}