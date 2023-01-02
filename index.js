const core = require('@actions/core');
const github = require('@actions/github');


async function run() {
    try {
        const access_token = core.getInput('access_token');
        const stack_id = core.getInput('stack_id');
        console.log(`Hello ${access_token}!`);
        console.log(`Hello ${stack_id}!`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();