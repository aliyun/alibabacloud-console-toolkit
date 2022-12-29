export default function getPadLength(list: Array<[string, any]>) {
  let longest = 10;

  list.forEach((str) => {
    if (str.length + 1 > longest) {
      longest = str.length + 1;
    }
  });

  return longest;
}
