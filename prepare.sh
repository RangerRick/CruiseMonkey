#!/bin/sh

echo "<html><head><title>CruiseMonkey</title></head><body>" > .index.html
commonmark README.markdown >> .index.html
echo "</body></html>" >> .index.html
mv .index.html index.html
