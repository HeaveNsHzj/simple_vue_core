export function createLogger(el, tagName = 'li') {
  var log = console.log;
  window.console.log = function () {
    var args = arguments;
    log.apply(window.console, args);
    try {
      var li = document.createElement(tagName);
      var text = []
      for (var i = 0, len = args.length; i < len; i++) {
        text.push(typeof args[i] == 'object' ? JSON.stringify(args[i]) : String(args[i]))
      }
      li.innerHTML = text.join(' ').replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;');
      el.appendChild(li);
    } catch (e) {
      console.error(e);
    }
  }
}
