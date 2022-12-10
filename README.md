# Pengekrukka - Hackathon 

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## Testing 
- Strive towards adding tests when writing new features 
- Share code between tests when possible, but not at the cost of clarity 
- Run tests with `yarn <package> test`

## Working With Packages 
Every package is located under `./packages`. The monorepo is configured with [Yarn Workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/). The setup intends you to interact with the packages from root level. To run a command in a package, simply run `yarn <package> <command>`, e.g. `yarn contracts test`. 

## Adding a New Package 
1. add a folder under `./packages`
2. add `./packages/<YOUR-PACKAGE>/package.json`-file with `{"name": "@pengekrukka/<YOUR-PACKAGE>", "version": "0.0.1", "private": true}`
3. add `"<YOUR-PACKAGE>": "yarn workspace @pengekrukka/<YOUR-PACKAGE>"` under `"scripts"` in (root) `./package.json`. 
