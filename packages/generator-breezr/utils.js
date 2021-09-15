exports.toCamelCase = function(str) {
  return str.replace(/-(\w)/g, function(_, s) {
    return s.toUpperCase();
  });
};

exports.toLowerCase = function(str) {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
};

exports.firstUpperCase = function(str) {
  return str.replace(/\b(\w)(\w*)/g, function(_, s1, s2) {
    return s1.toUpperCase() + s2;
  });
};
