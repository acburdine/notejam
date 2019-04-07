FROM node:10

WORKDIR /opt/app

COPY . .

RUN npm install --production

USER node

ENTRYPOINT ["/opt/app/entrypoint.sh"]
CMD ["/opt/app/bin/www"]
