#!/bin/bash

DATABASE_URL=postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE} npm run migrate up --no-verbose

npm server.js