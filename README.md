# find-usages
Find usages of packages and which imports are used.
Does not include default imports

Requires Node.js v16.17.0+ or Node.js v18.6.0+

## Usage
Modify [findUsage.ts](/src/findUsage.ts) to point to the base path of the desired project(s) and search for the desired package(s). Modify globs as needed to find files.
Run the following command to output a CSV file with two colums: name (file path) and components (imports)
`npx ts-node-esm src/findUsage.ts > out.csv`
