export const validateEmail = function(type, value) {
  switch (type) {
    case 'email':
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(value);
    default:
      return false;
  }
};

export const validateLogin = login => {
  const minLoginLength = 2;
  if (!login || login.length < minLoginLength)
    throw new Error(`Login length should be more or equal ${minLoginLength} symbols`);
  return true;
};

export const validatePassword = password => {
  const minPasswordLength = 5;
  if (!password || password.length < minPasswordLength)
    throw new Error(`Password length should be more ${minPasswordLength} symbols`);
  return true;
};
