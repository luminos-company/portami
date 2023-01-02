import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import fetch from 'node-fetch';

const endpoint = core.getInput('endpoint')+"/api";
const stack_id = core.getInput('stack_id');
const file_path = core.getInput('file_path');
const prune = core.getBooleanInput('prune');
const pullImage = core.getBooleanInput('pull');
const headers = {
    "x-api-key":  core.getInput('access_token'),
    "Content-Type": "application/json"
};

function withQuery(url, query) {
    var exurl = new URL(url);
    if (query) {
        Object.keys(query).forEach(key => exurl.searchParams.append(key, query[key]));
    }
    return exurl;
}

async function fetchStack() {
    await fetch(withQuery(endpoint+'/stacks'),
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
    await fetch(withQuery(endpoint+'/stacks/' + id),
        {
            headers: headers,
        })
        .then(response => response.json())
        .then(async (data) => {
            await redoploy(data.Id, data.EndpointId);
        });
}

async function redoploy(id, endpointId) {
    let basicContent = "";
    let basicVars = [];
    try {
        try {
            let res = (await fetch(endpoint+'/stacks/' + id + '/file', {
                method: 'GET',
                headers: headers,
            }).then(response => response.json()));
            if (file_path) {
                basicContent = fs.readFileSync(file_path,'utf8');
            } else {
                basicContent = res.StackFileContent;
            }
        } catch (error) {
            core.setFailed("This stack is not a file stack");
        }
        if (res.Env) {
            basicVars = res.Env;
        }
    } catch (_) {
    }
    basicVars.push({
        "name": "PORTAMI_ACTIVE",
        "value": "true"
    }, {
        "name": "PORTAMI_VERSION",
        "value": "v1.1"
    }, {
        "name": "PORTAMI_UPDATED_AT",
        "value": new Date().toISOString()
    });

    await fetch(withQuery(endpoint+'/stacks/' + id, {
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
        }).then(response => response.json());
}


async function run() {
    try {
        await fetchStack();
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();