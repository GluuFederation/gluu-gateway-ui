#!/usr/bin/env sh

#bash start.sh -c prepare -a postgres -u postgres://kong:kong@localhost:5432/gg_ui

# if no args are set
if [ $# -eq 0 ]
    then
        # start the app the usual way
        node --harmony app.js
    else
        while getopts "c:a:u" option
        do
            case "${option}"
                in
                c) COMMAND=${OPTARG};;
                a) ADAPTER=${OPTARG};;
                u) URI=${OPTARG}
            esac
        done

        if [ "$COMMAND" == "prepare" ]
            then
                node ./bin/konga.js $COMMAND --adapter $ADAPTER --uri $URI
            else
                echo "Invalid command: $COMMAND Please use prepare"
                exit 1
        fi
fi
