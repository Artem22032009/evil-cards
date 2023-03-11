#!/bin/bash

SOURCE_PLAUSIBLE_ENV_PATH=$APP_PATH/$SOURCE_DIR/deploy/envs/plausible.env
SOURCE_POSTGRES_ENV_PATH=$APP_PATH/$SOURCE_DIR/deploy/envs/postgres.env
SOURCE_LOAD_BALANCER_ENV_PATH=$APP_PATH/$SOURCE_DIR/deploy/envs/load-balancer.env

FILLED_PLAUSIBLE_ENV_PATH=$APP_PATH/envs/plausible.env
FILLED_POSTGRES_ENV_PATH=$APP_PATH/envs/postgres.env
FILLED_LOAD_BALANCER_ENV_PATH=$APP_PATH/envs/load-balancer.env

rm $SOURCE_PLAUSIBLE_ENV_PATH
rm $SOURCE_POSTGRES_ENV_PATH
rm $SOURCE_LOAD_BALANCER_ENV_PATH

ln -s $FILLED_PLAUSIBLE_ENV_PATH $SOURCE_PLAUSIBLE_ENV_PATH
ln -s $FILLED_POSTGRES_ENV_PATH $SOURCE_POSTGRES_ENV_PATH
ln -s $FILLED_PLAUSIBLE_ENV_PATH $SOURCE_PLAUSIBLE_ENV_PATH
ln -s $FILLED_LOAD_BALANCER_ENV_PATH $SOURCE_LOAD_BALANCER_ENV_PATH
