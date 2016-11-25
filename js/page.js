/**
 * Created by huangzhongjian on 16/11/14.
 */

import {diff_match_patch, DIFF_DELETE, DIFF_EQUAL, DIFF_INSERT } from 'diff-match-patch'
import { createLogger } from './console'


function Editor(el) {
  this.el = el;
  this.editor = ace.edit(el);
  this.session = this.editor.getSession();
  this.document = this.session.getDocument();

  //this.session.setUseWrapMode(true); //横向滚动条
  this.editor.setTheme('ace/theme/tomorrow');
  this.editor.setShowPrintMargin(false);
  this.editor.commands.removeCommands(['gotoline', 'find']);
  el.style.fontFamily = 'Melo, Monaco, Consolas, "Courier New", monospace';
  el.style.lineHeight = 'inherit'

  this.session.setMode('ace/mode/javascript');
  this.session.setUseSoftTabs(true);
  this.session.setTabSize(2);
  this.session.setUseWorker(false);

  this.renderer = this.editor.renderer;

  this.editor.setOptions({
    maxLines: Infinity
  });
  //this.editor.setShowInvisibles(true);
  //this.editor.setOption('scrollPastEnd', 0.1);
}

Editor.prototype.getCharacterHeight = function() {
  return this.renderer.$fontMetrics.$characterSize.height
}

Editor.prototype.onChangeCharacterSize = function(callback) {
  var _this = this;
  this.renderer.on('changeCharacterSize', function(){
    callback(_this.getCharacterHeight())
  })
}

Editor.prototype.setTheme = function(theme) {
  this.editor.setTheme('ace/theme/' + theme)
}

Editor.prototype.showDiffWithFile = function(filename) {
  if (filename == this._lastFile) {
    this.highlightDiff(this._lastDiff);
    return
  }
  this._lastFile = filename;
  fetchFile(filename).then((content) => {
    var dmp = new diff_match_patch();
    var diffs = dmp.diff_lineMode_(content, this.editor.getValue());
    dmp.diff_cleanupSemantic(diffs);
    this.highlightDiff(diffs);
  })
}

Editor.prototype.highlightDiff = function(diffs) {

  var doc = this.document;
  var session = this.session;
  var offset = 0;
  var ranges = []
  diffs.forEach(function(diff) {
    var op = diff[0], text = diff[1]
    switch(op) {
      case DIFF_EQUAL:
        offset += text.length;
        break;
      case DIFF_DELETE:
        break;
      case DIFF_INSERT:
        var start = doc.indexToPosition(offset);
        offset += text.length;
        var end = doc.indexToPosition(offset - 1)
        var range = session.highlightLines(start.row, end.row)
        ranges.push(range);
    }
  });
  this.ranges = ranges;
  this._lastDiff = diffs;
  return ranges;
}

Editor.prototype.hideDiff = function() {
  if (this.ranges && this.ranges.length) {
    this.ranges.forEach((range) => {
      this.session.removeMarker(range.id);
    });
    this.ranges.length = 0;
  }
};

function increaseFontSize(el, v) {
  var cur = window.getComputedStyle(el, null)['font-size'];
  el.style.fontSize = parseInt(cur) + (v >> 0) + 'px';
}


function initCodeFor(container, files) {

  return Array.from(files).map(function (obj) {
    var filename = obj.file;
    var prevFile = obj.prev;
    var li = document.createElement('li');
    li.innerHTML = '<div class="file-title">\
        <em class="code-folder"></em>\
        <span class="file-name">' + filename.split('/').pop() + '</span>\
        <div class="fr">' +
      (prevFile ? '<label><input type="checkbox" class="show-diff"/>高亮新增行</label>' : '') +
          '<i class="font-zoom-in">+</i>\
          <i class="font-zoom-out">-</i>\
        </div>\
      </div>\
      <div class="editor"></div>';
    container.appendChild(li);

    var el = li.querySelector('.editor');
    var instance = new Editor(el);
    var editor = instance.editor;
    editor.setReadOnly(true);
    editor.setHighlightActiveLine(false);
    editor.setHighlightGutterLine(false);

    fetchFile(filename).then((code) => {
      editor.setValue(code, -1);
    });

    var foldClass = 'code-folded';
    li.editor = editor;
    li.querySelector('.file-title').addEventListener('click', function (e) {
      li.classList.contains(foldClass) ? li.classList.remove(foldClass) : li.classList.add(foldClass);
    });
    li.querySelector('.font-zoom-in').addEventListener('click', function (e) {
      increaseFontSize(el, 1);
    })
    li.querySelector('.font-zoom-out').addEventListener('click', function (e) {
      increaseFontSize(el, -1)
    })

    prevFile && li.querySelector('.show-diff').addEventListener('change', function(e) {
        if (e.target.checked) {
          instance.showDiffWithFile(prevFile)
        } else {
          instance.hideDiff();
        }
    });
    li.querySelector('.fr').addEventListener('click', function(e){
      e.stopPropagation();
    })
    return instance;
  });

}

function fetchFile(url) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onload = function () {
      resolve(xhr.responseText)
    }
    xhr.onerror = reject;
    xhr.send(null)
  })

}


var config = {
  showMain: true,
  step1: ['observer.js'],
  step2: ['observer.js', 'dep.js'],
  step3: ['observer.js', 'dep.js', 'watcher.js'],
  step4: ['observer.js', 'dep.js', 'watcher.js'],
  step5: ['v-dom.js', 'vm.js', 'observer.js', 'dep.js', 'watcher.js']
};

function parseQuery() {
  var query = window.location.search.replace(/^\?/, '');

  if (!query) {
    return null;
  }

  return query.split('&').map(function(param) {
    var splitPoint = param.indexOf('=');

    return {
      key : param.substring(0, splitPoint),
      value : param.substring(splitPoint + 1)
    };
  }).reduce(function(params, param){
    if (param.key && param.value) {
      params[param.key] = decodeURIComponent(param.value);
    }
    return params;
  }, {});
}

var step = parseQuery().step;
var key = 'step' + step;
var editors = [];
if (config[key]) {
  var prevKey = 'step' + (step - 1)
  var prevConfig = config[prevKey];
  var list = config[key].map(function(file) {
    var prev = prevConfig && prevConfig.find(function (f) {
      return file === f
    });
    return {
      file: key + '/' + file,
      prev: prev && (prevKey + '/' + file)
    }
  });
  if (config.showMain){
    list.push({ file: key + '/' + 'main.js'});
  }
  editors = initCodeFor(document.querySelector('#code-container'), list);

  var script = document.createElement('script');
  script.type ='text/javascript';
  script.src = 'dist/' + key + '.js';
  document.body.append(script);
}

function toggleMonokai(e) {
  editors.forEach(function(editor) {
    editor.setTheme(e.target.checked ? 'monokai' : 'tomorrow')
  })
}
document.getElementById('toggleDarkTheme').addEventListener('change', toggleMonokai);
document.getElementById('showAllDiff').addEventListener('change', function(e){
  var $check = document.querySelectorAll('.show-diff');
  for (var i = 0, len = $check.length; i < len; i++) {
    //$check[i].checked = e.target.checked;
    $check[i].click();
  }
});
document.getElementById('foldAll').addEventListener('change', function(e) {
  editors.forEach((editor) => {
    editor.session[e.target.checked ? 'foldAll' : 'unfold']()
  })
})
createLogger(document.querySelector('#console-container'));
