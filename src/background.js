var ehom = ehom || {};
ehom.TabManager = function TabManager() {
    this.tabMap = {};
    this.minTabs = 5;
    this.tabLife = 30;
    this.cleanupInterval = 1;
    this.numRememberedTabs = 25;
    this.activeTab = null;
    this.tabCount = 0;
    this.currentWindow = null;
    this.closedTabs = Array(this.numRememberedTabs);
    this.exceptions = ['www.pandora.com', 'pandora.com'];

    chrome.windows.getCurrent({}, ehom.init);
    chrome.tabs.onCreated.addListener(ehom.tabCreate);
    chrome.tabs.onRemoved.addListener(ehom.tabClose);
    chrome.tabs.onActivated.addListener(ehom.tabActivated);
    chrome.windows.onFocusChanged.addListener(ehom.onFocusChanged);
};

ehom.TabManager.prototype.rememberTab = function rememberTab(url) {

    for (var i = this.numRememberedTabs - 1; i > 0; i--) {
        this.closedTabs[i] = this.closedTabs[i - 1];
    }

    this.closedTabs[0] = url;
};

ehom.TabManager.prototype.updateMinTabs = function updateMinTabs(minTabs) {
    this.minTabs = minTabs;
    chrome.storage.sync.set({'tm-mintabs': this.minTabs}, null);
};

ehom.TabManager.prototype.updateTabLife = function updateTabLife(tabLife) {
    this.tabLife = tabLife;
    chrome.storage.sync.set({'tm-tablife': this.tabLife}, null);
};

ehom.TabManager.prototype.updateCleanupInterval = function updateCleanupInterval(cleanupInterval) {
    this.cleanupInterval = cleanupInterval;
    chrome.storage.sync.set({'tm-cleanupinterval': this.cleanupInterval}, null);
    window.clearInterval(cleanupIntervalId);
    cleanupIntervalId = window.setInterval(this.cleanupTabs.bind(this), this.cleanupIntervalMilis());
};

ehom.TabManager.prototype.tabLifeMilis = function tabLifeMilis() {
    return this.tabLife * 60 * 1000;
};

ehom.TabManager.prototype.cleanupIntervalMilis = function cleanupIntervalMilis() {
    return this.cleanupInterval * 60 * 1000;
};

ehom.TabManager.prototype.cleanupTabs = function cleanupTabs() {
    var tabId = null;
    var now = new Date().getTime();
    for (tabId in this.tabMap) {
        if (this.tabMap[tabId] != 0) {
            if (this.tabCount > this.minTabs && ((now - this.tabMap[tabId]) > this.tabLifeMilis())) {

                chrome.tabs.get(parseFloat(tabId), ehom.tabCleanup);
            }
        }
    }
};

ehom.TabManager.prototype.tabCleanup = function tabCleanup(tab) {
    var dregex = /[http:\/\/|https:\/\/]+(.*\.[com|net|org|co]+)/

    var match = dregex.exec(tab.url);
    if (match){
        if (this.exceptions.indexOf(match[1]) < 0) {
            this.rememberTab(tab.url);
            chrome.tabs.remove(tab.id, null);
        }
        return;
    }

    chrome.tabs.remove(tab.id, null);
};

ehom.TabManager.prototype.tabCreateEvent = function tabCreateEvent(tab) {
    if (tab.id) {
        this.tabMap[tab.id] = new Date().getTime();
        this.tabCount++;
        console.log('new tab ' + tab.id);
    }
};

ehom.TabManager.prototype.tabCloseEvent = function tabCloseEvent(tabId, options) {
    if (tabId) {
        delete this.tabMap[tabId];
        this.tabCount--;
        console.log('tab closed ' + tabId);
    }
};

ehom.TabManager.prototype.tabActivatedEvent = function tabActivatedEvent(activeInfo) {
    if (this.activeTab) {
        this.tabMap[this.activeTab] = new Date().getTime();
    }

    this.activeTab = activeInfo.tabId;
    this.tabMap[activeInfo.tabId] = 0;
    console.log('active tab ' + this.activeTab);
};

ehom.TabManager.prototype.windowOnFocusChangedEvent = function windowOnFocusChangedEvent(winId) {
    if (winId != chrome.windows.WINDOW_ID_NONE) {
        chrome.tabs.query({active: true, windowId: winId}, ehom.updateActive);
    }
};

ehom.TabManager.prototype.updateActiveTab = function updateActiveTab(tabs) {
    if (tabs.length == 1 && tabs[0].id) {
        this.tabMap[this.activeTab] = new Date().getTime();
        this.activeTab = tabs[0].id;
        this.tabMap[this.activeTab] = 0;
        console.log('active tab ' + this.activeTab);
    }
};

ehom.TabManager.prototype.initTabs = function initTabs(tabs) {
    for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].id) {
            if (tabs[i].active && tabs[i].windowId == this.currentWindow) {
                this.tabMap[tabs[i].id] = 0
                this.activeTab = tabs[i].id;
            } else {
                this.tabMap[tabs[i].id] = new Date().getTime();
            }
            this.tabCount++;
        }
    }
};

ehom.TabManager.prototype.init = function init(window) {
    this.currentWindow = window.id;
    chrome.tabs.query({}, ehom.initTabs);
    chrome.storage.sync.get(['tm-tablife', 'tm-mintabs', 'tm-cleanupinterval'], ehom.loadSettings);
};

ehom.TabManager.prototype.loadSettings = function loadSettings(settings) {
    if (settings['tm-mintabs']) {
        this.updateMinTabs(parseFloat(settings['tm-mintabs']));
    }
    if (settings['tm-tablife']) {
        this.updateTabLife(parseFloat(settings['tm-tablife']));
    }
    if (settings['tm-cleanupinterval']) {
        this.updateCleanupInterval(parseFloat(settings['tm-cleanupinterval']));
    }
};

ehom.init = function(window) {
    tm.init(window);
};
ehom.initTabs = function(tabs) {
    tm.initTabs(tabs);
}
ehom.tabCreate = function(tab) {
    tm.tabCreateEvent(tab);
};
ehom.tabClose = function(tabId, options) {
    tm.tabCloseEvent(tabId, options);
};
ehom.tabActivated = function(activeInfo) {
    tm.tabActivatedEvent(activeInfo);
};
ehom.onFocusChanged = function(windowId) {
    tm.windowOnFocusChangedEvent(windowId);
};
ehom.updateActive = function(tabs) {
    tm.updateActiveTab(tabs);
};
ehom.tabCleanup = function(tab) {
    tm.tabCleanup(tab);
};
ehom.loadSettings = function(settings) {
    tm.loadSettings(settings);
};

var tm = new ehom.TabManager();
var cleanupIntervalId = window.setInterval(tm.cleanupTabs.bind(tm), tm.cleanupIntervalMilis());