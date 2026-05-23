---
# Fill in the fields below to create a basic custom agent for your repository.
# The Copilot CLI can be used for local testing: https://gh.io/customagents/cli
# To make this agent available, merge this file into the default repository branch.
# For format details, see: https://gh.io/customagents/config

name: PR Review
description: Make sure the code builds in Vercel
---

# My Agent

Whenever there's a new PR made to the repo, review that the vercel builds are ok. If not, fix the build.
