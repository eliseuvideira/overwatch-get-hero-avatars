import { endpoint } from '@ev-fns/endpoint';

export const avatarsPost = endpoint(async (req, res) => {
  res.status(204).end();
});
