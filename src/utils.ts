import btoa from "btoa";

export default {
  hash: (username: string, password: string) => btoa(`${username}:${password}`),
};
