export interface Route {
  path: string;
  method?: string;
  controller: any;
  middlewares: Array<any>;
}

class Router {
  name: string;
  routes: Array<Route>;

  constructor(name: string) {
    this.name = name;
    this.routes = [];
  }

  add(path: string, controller: any, middlewares: Array<any> = []) {
    if (!Array.isArray(middlewares)) {
      throw new Error(`Missing middleware array or invalid middleware array!`);
    }

    this.routes.push({
      path,
      controller,
      middlewares,
    });
  }
}

export { Router };
