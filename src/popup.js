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
    console.log('about to query');
    chrome.tabs.query({active: true, windowId: tm.currentWindow}, currentTabHandler);
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

function currentTabHandler(tab) {
    console.log('here');
    var tm = chrome.extension.getBackgroundPage().tm;
    var dregex = /\/\/([A-Za-z0-9\.-]*)\//
    var match = dregex.exec(tab[0].url);
    var exbtn = document.getElementById("ex-button");
    console.log(JSON.stringify(tab));
    console.log(match);
    exbtn.addEventListener("click", exbtnHandler);
    if (match) {
        if (tm.exceptions.indexOf(match[1]) > -1) {
            exbtn.innerHTML = 'Remove page from exclusion List';
            exbtn['data-url'] = match[1];
        } else {
            exbtn.innerHTML = 'Exclude Current Page';
            exbtn['data-url'] = match[1];
        }
    }
}

function exbtnHandler(event) {
    event.preventDefault();
    var tm = chrome.extension.getBackgroundPage().tm;
    var exbtn = document.getElementById("ex-button");
    if (exbtn.innerHTML == 'Exclude Current Page') {
        console.log(exbtn['data-url']);
        tm.addException(exbtn['data-url']);
        exbtn.innerHTML = 'Remove page from exclusion List';
    } else {
        tm.removeException(exbtn['data-url']);
        exbtn.innerHTML = 'Exclude Current Page';
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