export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname.startsWith("www.")) {
      return Response.redirect("https://mnmwebsitesforyou.com" + url.pathname + url.search, 301);
    }
    return env.ASSETS.fetch(request);
  },
};
