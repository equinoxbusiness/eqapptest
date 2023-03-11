export const shortAddress = (str) => {
  if (str.length < 10) return str;
  return `${str.slice(0, 4)}...${str.slice(-4)}`;
};
export const shortAddressWithParams = (str, number) => {
  if (str) {
    if (str.length < 14) return str;
    return `${str.slice(0, number)}...${str.slice(-number)}`;
  } else {
    return "";
  }
};
