import startServer from "../index";

const _server = startServer();

async function testDefault(): Promise<Boolean> {
  const server = await _server;
  const response = await fetch(server.endpoint('test')); // 'localhost:8080/test'
  return response.ok;
}