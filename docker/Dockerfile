from ubuntu:22.04


RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl
#    && rm -rf /var/lib/apt/lists/*

RUN pwd

RUN git clone https://github.com/DMDcoin/dmdv4-testnet.git 

WORKDIR /dmdv4-testnet

ARG DMD_NODE_GIT_TARGET=" --branch dev "

RUN ./setup-build-from-source-base.sh

ARG DMD_NODE_BUILD_FLAGS=" --release "

ARG RUST_BACKTRACE=0

RUN ./build-from-source-base.sh

ENV TOML_FILE=fullnode.toml
ENV DMD_NODE_ADDITONAL_STARTUP_ARGS=

# Start Command.
CMD /dmdv4-testnet/diamond-node-git/target/release/diamond-node --config $TOML_FILE $DMD_NODE_ADDITONAL_STARTUP_ARGS
# CMD /dmdv4-testnet/rpc.sh
# CMD sleep 100000
