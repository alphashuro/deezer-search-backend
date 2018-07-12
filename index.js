require("dotenv").config();

const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const cors = require("@koa/cors");
const request = require("request-promise-native");
const querystring = require("querystring");

const router = new Router();

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
  const artist = ctx.query.q;

  const artists = request({
    uri: `https://api.deezer.com/search/artist`,
    qs: {
      q: artist,
      limit: 5
    }
  });

  ctx.body = artists;
  ctx.status = 200;
});

router.get("/:id/albums", async ctx => {
  const { id } = ctx.params;

  const albums = request(`https://api.deezer.com/artist/${id}/albums`);

  ctx.body = albums;
  ctx.status = 200;
});

router.get("/album/:id/tracks", async ctx => {
  const { id } = ctx.params;

  const albums = request({});
});

const app = new Koa();

app.use(logger());
app.use(cors());
app.use(router.middleware());

app.listen(process.env.PORT || 8080);
