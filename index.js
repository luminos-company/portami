const fetch = require('node-fetch');
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const stack_id = core.getInput('stack_id');
const file_path = core.getInput('file_path');
const prune = core.getInput('prune') == "true";
const pullImage = core.getInput('pullImage') == "true";
const headers = {
    "x-api-key": core.getInput('access_token'),
    "Content-Type": "application/json"
};

function withQuery(url, query) {
    var exurl = new URL(url);
    if (query) {
        Object.keys(query).forEach(key => exurl.searchParams.append(key, query[key]));
    }
    console.log(exurl);
    return exurl;
}

async function fetchStack() {
    await fetch(withQuery('https://portainer.ingmmo.com/api/stacks'),
        {
            headers: headers,
        })
        .then(response => response.json())
        .then(async (data) => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].Name == stack_id) {
                    await fetchStackID(data[i].Id);
                    break;
                }
            }
        });
}

async function fetchStackID(id) {
    await fetch(withQuery('https://portainer.ingmmo.com/api/stacks/' + id),
        {
            headers: headers,
        })
        .then(response => response.json())
        .then(async (data) => {
            await redoploy(data.Id, data.EndpointId);
        });
}

async function redoploy(id, endpointId) {
    console.log(id);
    let basicContent = "";
    let basicVars = [];
    try {
        try {
            let res = (await fetch('https://portainer.ingmmo.com/api/stacks/' + id + '/file', {
                method: 'GET',
                headers: headers,
            }).then(response => response.json()));
        } catch (error) {
            core.setFailed("This stack is not a file stack");
        }
        if (file_path) {
            basicContent = fs.readFileSync(file_path, 'utf8');
        } else {
            basicContent = res.StackFileContent;
        }
        if (res.Env) {
            basicVars = res.Env;
        }
    } catch (error) {
        basicContent = "";
        basicVars = [];
    }
    basicVars.push({
        "name": "PORTAMI_ACTIVE",
        "value": "true"
    }, {
        "name": "PORTAMI_VERSION",
        "value": "v0.1"
    }, {
        "name": "PORTAMI_UPDATED_AT",
        "value": new Date().toISOString()
    });

    await fetch(withQuery('https://portainer.ingmmo.com/api/stacks/' + id, {
        "endpointId": endpointId,
    }),
        {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({
                "prune": prune,
                "pullImage": pullImage,
                "stackFileContent": basicContent,
                "env": basicVars
            })
        }).then(response => response.text()).then((data) => {
            console.log(data);
        });
}


async function run() {
    try {
        await fetchStack();
    } catch (error) {
        console.log(error);
        core.setFailed(error.message);
    }
}

run();