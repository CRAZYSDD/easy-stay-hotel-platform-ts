import type { Response } from 'express';

const clients = new Set<Response>();

export const addClient = (res: Response) => {
  clients.add(res);
};

export const removeClient = (res: Response) => {
  clients.delete(res);
};

export const publishEvent = (type: string, payload: unknown) => {
  const data = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
  clients.forEach((client) => client.write(data));
};
