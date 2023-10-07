import { CookieOptions } from "./cookie-types";
import {
  encodeCookie,
  parseCookieData,
  parseCookies,
  stringifyCookieData,
} from "./cookie-utils";

export function createServerCookieFactory<
  T = string,
  FactoryRequest extends Request = Request,
  FactoryRes extends Response = Response
>({
  cookieKey,
  options: optionsCfg,
  request,
  response,
}: {
  cookieKey: string;
  request?: FactoryRequest;
  response?: FactoryRes;
  options?: CookieOptions;
}) {
  const setCookie = (
    value: T,
    {
      key = cookieKey,
      options = optionsCfg || {},
      res = response,
    }: {
      options?: CookieOptions;
      res?: Response | undefined;
      key?: string;
    } = {}
  ) => {
    let cookieValue =
      typeof value === "string" ? value : stringifyCookieData(value);

    const cookieString = encodeCookie(key, cookieValue, options);

    if (!res) {
      throw new Error("No response object provided");
    }

    res?.headers.append("Set-Cookie", cookieString);
  };

  const getAllCookies = <T extends object>(
    req: Request | undefined = request
  ): T => {
    const cookies = parseCookies(req?.headers.get("Cookie") || "");
    const parsedCookies: any = {};
    for (const [name, value] of Object.entries(cookies)) {
      parsedCookies[name] = parseCookieData(value) as any;
    }

    return parsedCookies as T;
  };

  const getCookie = ({
    key = cookieKey,
    req = request,
  }: {
    req?: Request;
    key?: string;
  } = {}): T | null => {
    if (!req) {
      throw new Error("No request object provided");
    }
    const cookies = parseCookies(req.headers.get("Cookie") || "");
    return parseCookieData<T>(cookies[key]);
  };

  const deleteCookie = ({
    key = cookieKey,
    res = response,
  }: {
    res?: Response;
    key?: string;
    options?: CookieOptions;
  } = {}) => {
    setCookie("" as unknown as T, { options: { maxAge: -1 }, key, res });
  };

  const checkCookie = ({
    key = cookieKey,
    req = request,
  }: {
    req?: Request;
    key?: string;
  } = {}) => {
    console.log({
      fn: "checkCookie",
      cookie: getCookie({ req, key }),
    });
    return getCookie({ req, key }) !== null;
  };

  const getRawCookie = ({
    key = cookieKey,
    req = request,
  }: {
    req?: Request;
    key?: string;
  } = {}): string | null => {
    if (!req) {
      throw new Error("No request object provided");
    }

    const cookies = parseCookies(req.headers.get("Cookie") || "");
    return cookies[key] || null;
  };

  return {
    setCookie,
    getCookie,
    deleteCookie,
    checkCookie,
    getRawCookie,
    getAllCookies,
  };
}
