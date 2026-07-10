const { getJwtService } = require('../app/Support/JwtService');
const { UserService } = require('../app/Services/UserService');
const { errorJson } = require('../app/Support/Http');

async function jwtAuth(req, res, next) {
  const header = req.header('authorization') || req.header('Authorization') || '';
  if (!header.startsWith('Bearer ')) {
    errorJson(res, 'Unauthorized', 401);
    return;
  }

  const claims = getJwtService().decodeToken(header.slice(7));
  if (!claims) {
    errorJson(res, 'Unauthorized', 401);
    return;
  }

  const user = await UserService.getById(claims.sub);
  if (!user) {
    errorJson(res, 'Unauthorized', 401);
    return;
  }

  req.user = user;
  await next();
}

module.exports = { jwtAuth };
