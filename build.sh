#!/bin/bash
# Build script: concatenates JS files into pacman.js

OUTPUT="pacman.js"

# write header
echo "
// Copyright 2012 Shaun Williams
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License Version 3 as 
//  published by the Free Software Foundation.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
// ==========================================================================
// PAC-MAN
// an accurate remake of the original arcade game
// Based on original works by Namco, GCC, and Midway.
// Research by Jamey Pittman and Bart Grantham
// Developed by Shaun Williams, Mason Borda
// ==========================================================================
(function(){
" > $OUTPUT

# concatenate the source files
while read line; do
    # skip blank lines and comment lines beginning with '#'
    if [[ ! -z "${line// }" && "${line:0:1}" != "#" ]]; then
        cat src/$line >> $OUTPUT
        echo "" >> $OUTPUT
    fi
done < js_order

# write footer
echo "})();" >> $OUTPUT

echo "Build complete: $OUTPUT created"
