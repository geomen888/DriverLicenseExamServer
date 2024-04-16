FROM node:16.20-alpine
RUN apk add --no-cache --virtual .gyp python3 make cmake g++ gcc
# Install ffmpeg and related dependencies
RUN apk add --no-cache ffmpeg-libs ffmpeg

RUN mkdir -p /usr/src/app/images

WORKDIR /usr/src/app
COPY package.json .
COPY tsconfig.json .

RUN rm -rf node_modules \
  && rm -rf dist \
  && rm -f package-lock.json \
  && rm -f pnpm-lock.yaml

RUN npm i -g pnpm@7.5.2

RUN pnpm i
RUN npm i typescript@5.2.2 -g
COPY src ./

ARG IMAGE_TAG
ENV image_tag $IMAGE_TAG
RUN echo "{ \"version\": \"$image_tag\" }" > ./common/assets/app-version.json
COPY src/mail/views /usr/src/app/dist/mail/views

RUN env NODE_OPTIONS=--max_old_space_size=3072 tsc

RUN pnpm prune --prod \
  && apk del .gyp make cmake gcc g++ python3 \
  && find . -maxdepth 1 -not \( -name package.json -or -name "." -or -name "node_modules" -or -name "dist" \) -print0 | xargs -0 -I {} /bin/rm -rf "{}"

CMD pnpm start

