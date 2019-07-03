import userscriptStr from 'raw-loader!./userscript.js'

let s = document.createElement('script')
s.textContent = userscriptStr
s.onload = function () {
  this.parentNode.removeChild(this)
}
document.head.appendChild(s)
