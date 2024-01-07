FROM node:latest

WORKDIR /data

ARG NPM_TOKEN

COPY package.json package.json
COPY package-lock.json package-lock.json

# Installing code

RUN apt-get update && apt-get install -y gettext \
		&& npm install -g npm@latest

RUN npm install -g @angular/cli --legacy-peer-deps \
		&&	npm uninstall ng-particles tsparticles-engine --legacy-peer-deps \
		&&	npm uninstall angular-particle --legacy-peer-deps \
		&&	npm install source-map-support --save --legacy-peer-deps

RUN	npm install --legacy-peer-deps \
&&	npm install webpack --legacy-peer-deps \
&&	npm install @popperjs/core --legacy-peer-deps

COPY . /data

RUN ng config -g cli.warnings.versionMismatch false \
&& ng add @ng-bootstrap/ng-bootstrap

CMD ["/bin/bash", "./launch.sh"]
