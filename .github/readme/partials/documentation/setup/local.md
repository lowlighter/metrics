# 🔧 Local setup for development (~20 min)

*Documentation not available yet*

## 0️ Prepare your machine

A machine with a recent version of [NodeJS](https://nodejs.org) is required (see used version in [Dockerfile](/Dockerfile#L1-L2)).

## 1️ Clone repository and install dependencies

Run the following command to clone this repository and install dependencies.

```shell
git clone https://github.com/lowlighter/metrics.git
cd metrics/
npm install
cp settings.example.json settings.json
```

## 2️ Setup and configure *metrics*

Follow [🏗️ Deploying a web instance (~20 min)](/.github/readme/partials/documentation/setup/web.md) guide except docker-related sections.

Once read, start local instance using the following command:
```shell
npm start
```

## 3️ Start hacking!

Connect to your web server using `http://localhost:{port}` and start hacking!

For quick testing, it is advised to directly craft URLs, rather than using the web interface.

*Example: test a new plugin*
```shell
https://localhost:{port}/username?base=0&newplugin=1&newplugin.option1=hello&newplugin.option2=world)
```

## *️⃣ Testing changes

Testing is done through [jest](https://github.com/facebook/jest) framework.

To avoid consuming APIs requests and causing additional charges on external services, data are [mocked](/tests/mocks/index.mjs) using [JavaScript Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) and [Faker.js](https://github.com/marak/Faker.js/) with randomly generated data.

