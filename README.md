# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

To install the required dependencies, run the following command:

```bash
yarn install
```

## Local Development

### Start Development Server
To start the development server, make sure the `fetch-javadoc.sh` script is executable and then run:

```bash
chmod +x scripts/fetch-javadoc.sh
npm run start
```

The development server will be available at `http://localhost:3000`.

### Stop Development Server
To stop the development server, use the following command:

```bash
kill -9 $(lsof -t -i :3000)
```

## Building the Website

To build the static version of the website, use:

```bash
npm run build
```

The output will be generated in the `build` directory.

## Deployment

To deploy the website, you can use the following command:

```bash
npm run deploy
```

Ensure you have the necessary permissions and configurations set up for deployment.