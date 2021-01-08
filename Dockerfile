
FROM cnrancher/docs-pandaria-base as build1
ADD . /tmp
RUN cd /tmp; yarn install; yarn build;

FROM nginx:alpine
COPY --from=build1 /tmp/build /usr/share/nginx/html
COPY assets/nginx/default.conf /etc/nginx/conf.d/
WORKDIR /usr/share/nginx/html
