export const success = (data = null, message = 'ok') => ({
  code: 0,
  message,
  data,
});

export const fail = (code, message, details = null) => ({
  code,
  message,
  details,
});
