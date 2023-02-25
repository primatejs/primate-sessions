import {is} from "runtime-compat/dyndef";

const extractId = header => header
  ?.split(";").filter(text => text.includes("session_id="))[0]?.split("=")[1];

export default (Domain, {secure = false, sameSite = "Strict"} = {}) => {
  is(Domain).defined();

  return {
    serve: async (request, next) => {
      const _id = extractId(request.original.headers.get("cookie"));
      const session = await Domain.one(_id) ?? new Domain();
      await session.save();
      const Secure = secure ? "Secure" : "";
      const cookie = `session_id=${session._id}; Path=/; HttpOnly; ${Secure}`;

      const response = await next({...request, session});
      response.headers.set("Set-Cookie", `${cookie}; SameSite=${sameSite}`);
      return response;
    },
  };
};
