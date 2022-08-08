#!/bin/bash

if ! command -v parallel &>/dev/null; then
  echo Please install parallel
  echo sudo apt install parallel
  exit
fi

FILE="roboto-font.css"
FONT_FOLDER="web-font"
AGENT_WOFF2="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36"

# download css
wget 'https://fonts.googleapis.com/css2?family=Roboto' -O - --header="User-Agent: ${AGENT_WOFF2}" | \
  sed "s/local('.*'), //" > $FILE

# get links dirname
URL=$(cat $FILE | tr '()' \\n | grep https\*:// | head -n 1)
DIRNAME=$(dirname $URL)

rm -rf $FONT_FOLDER
mkdir -p $FONT_FOLDER

# download all http links
cat $FILE | tr '()' \\n | grep https\*:// | parallel --gnu "wget {} -nc -P $FONT_FOLDER"

# replace links to local
sed -e "s*"$DIRNAME"*\./web-font*" $FILE > $FILE".tmp" && mv -u $FILE".tmp" $FILE
