PORT=$((30300+$1))
echo $PORT
docker run --name node$1 -p 172.17.0.1:$PORT:$PORT/tcp -p 172.17.0.1:$PORT:$PORT/udp -v $(pwd)/nodes/node$1:/node open-ethereum --config node.toml