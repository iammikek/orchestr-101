const fs = require('fs');
const path = require('path');

class ShopStyleController {
  static index(req, res) {
    const cssPath = path.join(process.cwd(), 'public', 'shop', 'style.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    res.header('Content-Type', 'text/css');
    res.send(css);
  }
}

module.exports = { ShopStyleController };
