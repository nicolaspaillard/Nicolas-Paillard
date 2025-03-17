export const handleError = (error, override?) => {
  console.error(error);
  if (error.code) console.error(error.code);
  if (error.message) console.error(error.message);
  return override ? override : false;
};
