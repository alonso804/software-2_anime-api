import http from 'k6/http';
import { sleep } from 'k6';

const host = 'http://localhost:8080';

export const options = {
  vus: 10000,
  duration: '30s',
};

export default function() {
  http.get(`${host}/anime/get/${Math.floor(Math.random() * 100)}`);

  sleep(1);
}
