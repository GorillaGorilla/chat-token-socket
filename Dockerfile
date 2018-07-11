FROM mhart/alpine-node:latest
# create non-root user


# useful stuff from https://github.com/jfloff/alpine-python/blob/master/latest/Dockerfile

RUN apk update && apk upgrade && \
    apk add --no-cache bash git
#openssh python3 \
#
#    && if [[ ! -e /usr/bin/python ]];        then ln -sf /usr/bin/python3 /usr/bin/python; fi \
#    && if [[ ! -e /usr/bin/python-config ]]; then ln -sf /usr/bin/python3-config /usr/bin/python-config; fi \
#    && if [[ ! -e /usr/bin/idle ]];          then ln -sf /usr/bin/idle3 /usr/bin/idle; fi \
#    && if [[ ! -e /usr/bin/pydoc ]];         then ln -sf /usr/bin/pydoc3 /usr/bin/pydoc; fi \
#    && if [[ ! -e /usr/bin/easy_install ]];  then ln -sf /usr/bin/easy_install-3* /usr/bin/easy_install; fi \
#    && easy_install pip \
#    && pip install --upgrade pip \
#    && if [[ ! -e /usr/bin/pip ]]; then ln -sf /usr/bin/pip3 /usr/bin/pip; fi


#RUN addgroup -r nodejs \
#   && useradd -m -r -g nodejs nodejs
#USER nodejs
RUN adduser -D -u 1000 nodejs


ADD package.json /tmp/package.json
RUN cd /tmp && npm install

RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

WORKDIR /opt/app
ADD . /opt/app

#EXPOSE 6000

ENV NODE_ENV production

ENV DB_CONN mongodb://mongo/game-token-dev

ADD https://github.com/Yelp/dumb-init/releases/download/v1.1.1/dumb-init_1.1.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init
USER nodejs
CMD ["dumb-init", "npm", "start"]