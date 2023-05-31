# Portami
[![Luminos Open](https://img.shields.io/badge/Luminos%20Open-Production-success)](https://luminossrl.com)
[![CodeQL](https://github.com/luminos-company/portami/actions/workflows/codeql.yml/badge.svg)](https://github.com/luminos-company/portami/actions/workflows/codeql.yml)

A portainer github action to let you update your stacks

---
## How to use
1. Create a new workflow file in your repo
2. Put the following step in the file
```yaml
      - name: portainer
        uses: luminos-company/portami@v1.1
        with:
          endpoint: 'https://myportainer.example.com'
          access_token: 'REALLY SECRET TOKEN'
          stack_name: 'my_stack_name' # The unique name of the stack like: "cdn_minio"
          file_path: 'my_awesome_stack_file.yaml' # The stack file path to use
          prune: true # Prune the stack
          pull: true # Pull the images
```

---
## Parameters
| Name | Description | Required | Default |
| ---- | ----------- | -------- | ------- |
| endpoint | The portainer endpoint | true | |
| access_token | The portainer access token | true | |
| stack_name | The stack id | true | |
| file_path | The stack file path | false | |
| prune | Prune the stack | false | false |
| pull | Pull the images | false | false |

---
## How to just pull the latest images
If you just want to pull new images without replacing the stack file, you just have to not specify the `file_path` parameter.

---
## Capabilities
- [x] Update a stack
- [x] Prune the stack
- [x] Pull the images
- [ ] Create a stack
- [ ] Delete a stack

---