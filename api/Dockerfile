FROM gcc:latest

RUN apt-get update && apt-get -y --no-install-recommends install \
    build-essential \
    clang \
    cmake \
    gdb \
    wget

RUN mkdir /usr/src/test

RUN cd /usr/src/test && \
    wget --no-check-certificate --quiet \
        https://boostorg.jfrog.io/artifactory/main/release/1.77.0/source/boost_1_77_0.tar.gz && \
        tar xzf ./boost_1_77_0.tar.gz && \
        cd ./boost_1_77_0 && \
        ./bootstrap.sh && \
        ./b2 install && \
        cd .. && \
        rm -rf ./boost_1_77_0 

RUN cd /usr/src/test && \
    apt-get install -y libmysqlcppconn-dev 

COPY . /usr/src/test

WORKDIR /usr/src/test

RUN g++ -I/usr/include/cppconn main.cpp -o Test -L /usr/src/test/lib/ -pthread -L/usr/lib -lmysqlcppconn

EXPOSE 3000

CMD ["./Test"]

