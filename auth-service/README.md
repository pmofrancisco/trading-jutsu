# Trading Jutsu - Auth Service

RUN DOCKER
docker build .
docker run [dockerid]

RUN DOCKER WITH TAGGING
docker build -t pmofrancisco/auth .
docker run pmofrancisco/auth
docker run -p 8000:8000 pmofrancisco/auth

LIVE UPDATE (VOLUMES) - Section 6