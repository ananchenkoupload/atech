function checkBrowser() { 
          
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';

    // Safari 3.0+ "[object HTMLElementConstructor]" 
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));

    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1 - 79
    var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

    // Edge (based on chromium) detection
    var isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);

    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;

  
    if (isIE || isOpera || isEdge || isEdgeChromium) {
        if (isIE) var browser_name = 'Internet Explorer';
        if (isOpera) var browser_name = 'Opera';
        if (isEdge) var browser_name = 'Microsoft Edge';
        if (isEdgeChromium) var browser_name = 'Microsoft Edge';

        var browser_notification = '<div id="browser_notification_wrapper"><div class="inner"><h2>We are sorry, but our website doesn\'t support ' + browser_name + '.</h2><p>Please install one of the following browsers:</p><ul><li><a href="https://www.google.com/chrome/">Google Chrome</a></li><li><a href="https://www.apple.com/safari/">Apple Safari</a></li><li><a href="https://www.mozilla.org/en-US/firefox/browsers/">Mozilla Firefox</a></li></ul><div></div>';

        document.body.innerHTML = browser_notification;
    }
} 

checkBrowser();
 