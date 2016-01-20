var ehom = ehom || {};
ehom.TabManager = function TabManager() {
    this.tabMap = {};
    this.minTabs = 5;
    this.tabLife = 30;
    this.cleanupInterval = 1;
    this.activeTab = null;
    this.tabCount = 0;
    this.currentWindow = null;

    chrome.windows.getCurrent({}, ehom.init);
    chrome.tabs.onCreated.addListener(ehom.tabCreate);
    chrome.tabs.onRemoved.addListener(ehom.tabClose);
    chrome.tabs.onActivated.addListener(ehom.tabActivated);
    chrome.windows.onFocusChanged.addListener(ehom.onFocusChanged);
};

ehom.TabManager.prototype.updateMinTabs = function updateMinTabs(minTabs) {
    this.minTabs = minTabs;
};

ehom.TabManager.prototype.updateTabLife = function updateTabLife(tabLife) {
    this.tabLife = tabLife;
};

ehom.TabManager.prototype.updateCleanupInterval = function updateCleanupInterval(cleanupInterval) {
    this.cleanupInterval = cleanupInterval;
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

                chrome.tabs.remove(parseFloat(tabId), null);
            }
        }
    }
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

var tm = new ehom.TabManager();
var cleanupIntervalId = window.setInterval(tm.cleanupTabs.bind(tm), tm.cleanupIntervalMilis());