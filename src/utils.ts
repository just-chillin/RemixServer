import btoa = require('btoa');

export default {
  /**
   * Hashes a username and password into an authentication token.
   */
  hash: (username: string, password: string) => btoa(`${username}:${password}`),
};
