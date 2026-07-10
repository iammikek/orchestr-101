const { view } = require('@orchestr-sh/orchestr');
const { Session } = require('./Session');

async function renderShopView(res, template, data = {}) {
  const user = Session.user();
  const errors = Session.getErrors();
  const shared = {
    pageTitle: data.pageTitle || data.title || 'Catalog Shop',
    isLoggedIn: Session.isLoggedIn(),
    userEmail: user?.email || '',
    flashSuccess: Session.getFlash('success'),
    flashError: Session.getFlash('error'),
    flashInfo: Session.getFlash('info'),
    errors,
    firstError: Object.values(errors)[0] || '',
    oldInput: Session.getOldInput(),
  };

  const viewInstance = view(template, { ...shared, ...data });
  const html = await viewInstance.render();
  res.header('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
}

module.exports = { renderShopView };
