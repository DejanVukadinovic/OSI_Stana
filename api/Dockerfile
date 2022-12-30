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



RUN cd /usr/src/test && apt-get install openssl libssl-dev

RUN cd /usr/src/test && \
    apt-get install nlohmann-json3-dev \
    libgtest-dev -y

RUN cd /usr/src/test && \ 
    git clone https://github.com/arun11299/cpp-jwt && \
    cd cpp-jwt && \
    mkdir build && \
    cd build && \
    cmake .. && \
    cmake --build . -j

COPY . /usr/src/test

WORKDIR /usr/src/test

RUN g++ -I/usr/include/cppconn -I/usr/src/test/cpp-jwt/include main.cpp -o Test -L /usr/src/test/lib/ -pthread -L/usr/lib -lmysqlcppconn -lcrypto

EXPOSE 3000

CMD ["./Test"]

