# E2E tests for Phantombuster Chrome extension

First of all create a `.env` file at the repository root folder
`.env` files should not be commited since it contains sensitive data
ex:
- Phantombuster session cookie
- Zapier session cookie
- Phantombuster API key

On your `.env` file, you need to provide the following variables:

- `PB_SESSION`: Your Phantombuster session cookie (Value from `session` cookie)
- `PB_ORGNAME`: The Phantombuster Org name to target when running e2e tests
- `ZAPIER_SESSION`: Your Zapier session cookie (Value from `zapsession` cookie)
- `TWITTER_COOKIE`: Your Twitter session cookie (used for Zapier tests)
- `UID_COOKIE`: Your UID medium session cookie (used for Zapier tests)
- `SID_COOKIE`: Your SID medium session cookie (used for Zapier tests)
- `PB_APIS_BACKLIST`: An exhaustive list of Phantoms name (or partial names) to omit during Phantombuster e2e tests
- `ZAP_APIS_LIST`: An exhaustive list of Phantoms to test during the Zapier e2e tests

<b>Warning</b>
Each element on `PB_APIS_BACKLIST` & `ZAP_APIS_LIST` needs to be separated by a `,` character

# Command to run all e2e tests
`npm install` (install dependencies)
`npm test` (run the tests)
