docker kill $(docker ps -q)
docker rm $(docker ps -a -q)
docker rmi $(docker images -q)
#docker system prune -a
docker volume prune
#docker run --rm docker/compose
#docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "${PWD}:${PWD}" -w="${PWD}/ft_trans" docker/compose up
docker-compose up --build