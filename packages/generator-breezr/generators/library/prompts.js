module.exports = function() {
  return [
    {
      type: "input",
      name: "name",
      message: "what's your library name? eg. wind-component",
      default: "wind-component"
    },
    {
      type: "input",
      name: "authorName",
      message: "Author name: "
    },
    {
      type: "input",
      name: "authorEmail",
      message: "Author email: "
    },
    {
      type: "input",
      name: "gitRepo",
      message: "Where is the git repo of this library?"
    },
    { type: "confirm", name: "needTS", message: "Need typescript support?" },
    {
      type: "list",
      name: "type",
      message: "what type your library is?",
      choices: ["Stateful", "Stateless", "Pure"],
      default: 0
    }
  ];
};
