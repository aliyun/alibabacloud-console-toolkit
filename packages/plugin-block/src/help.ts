import chalk from 'chalk';

export default `

Commands:

  ${chalk.cyan(`add `)}     add a block to your project
  ${chalk.cyan(`list`)}     list all blocks

Options for the ${chalk.cyan(`add`)} command:

  ${chalk.green(`--path              `)} the route path, default the name in package.json
  ${chalk.green(`--branch            `)} git branch
  ${chalk.green(`--npmClient        `)} the npm client, default npm or yarn (if has yarn.lock)
  ${chalk.green(`--skipDependencies `)} don't install dependencies
  ${chalk.green(`--dry-run           `)} for test, don't install dependencies and download

Examples:

  ${chalk.gray(`# Add block`)}
  breezr block add demo
  breezr block add ant-design-pro/Monitor

  ${chalk.gray(`# Add block with full url`)}
  breezr block add https://github.com/umijs/umi-blocks/tree/master/demo

  ${chalk.gray(`# Add block with specified route path`)}
  breezr block add demo --path /foo/bar

  ${chalk.gray(`# List all blocks`)}
  breezr block list
  `.trim();
