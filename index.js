require("dotenv").config();

const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const cors = require("@koa/cors");
const request = require("request-promise-native");
const querystring = require("querystring");

const credentials = {
  client: {
    id: process.env.DEEZER_CLIENT_ID,
    secret: process.env.DEEZER_CLIENT_SECRET
  },
  auth: {
    tokenHost: "https://connect.deezer.com/oauth/auth.php"
  }
};

const router = new Router();

router.get("/auth", ctx => {
  const appId = process.env.DEEZER_APP_ID;
  const redirect = encodeURIComponent(process.env.DEEZER_REDIRECT);
  const perms = "basic_access";

  ctx.redirect(
    `https://connect.deezer.com/oauth/auth.php?app_id=${appId}&redirect_uri=${redirect}&perms=${perms}`
  );
});

router.get("/callback", async ctx => {
  const appId = process.env.DEEZER_APP_ID;
  const appSecret = process.env.DEEZER_APP_SECRET;
  const { code } = ctx.query;

  if (!code) {
    return (ctx.status = 401);
  }

  const url = `https://connect.deezer.com/oauth/access_token.php?app_id=${appId}&secret=${appSecret}&code=${code}`;
  const result = querystring.parse(await request(url));

  ctx.body = result.access_token;
});

router.get("/search", async ctx => {
  const token = ctx.headers.authorization.replace("Bearer ", "");
  const artist = ctx.query.q;

  const artists = request({
    uri: `https://api.deezer.com/search/artist`,
    qs: {
      q: artist,
      access_token: token
    }
  });

  ctx.body = artists;
  ctx.status = 200;
});

const app = new Koa();

app.use(logger());
app.use(cors());
app.use(router.middleware());

app.listen(process.env.PORT || 8080);
