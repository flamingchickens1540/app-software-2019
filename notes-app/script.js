"use strict";
window.$ = window.jQuery = require("jquery");
const fs = require("fs");

create();

// current match
let match = fs.readFileSync("match.txt").toString();

// match schedule
let schedule = JSON.parse(fs.readFileSync("schedule.json"));

// robots playing in this match
let this_match = schedule[parseInt(match)];

// unique id for this data point
let data_id = Math.floor(Math.random() * 10000000);

// checks manifest and creates one if it doesn't exist
if (!fs.existsSync("./data/manifest.json")) {
  fs.writeFileSync("./data/manifest.json", "[]");
}
// manifest
let manifest = JSON.parse(fs.readFileSync("./data/manifest.json"));

// loc (int 0-5) represents which div we are putting the textarea into
// alliance is red or blue and dictates border color
function createTextArea(loc, alliance) {
  if (this_match === undefined || this_match === null) { return; } // in the case that there is no more matches
  // adds the text area
  $("#text-spot-" + loc).append(`
    <label for="text-area-` + loc + `">` + this_match[loc] + `</label>
    <input class="` + alliance + ` ` + `form-control textarea" id="text-area-` + loc + `"type="textarea" />
  `);
}

// for creating the app
function create() {
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }
  if (!fs.existsSync("./data/manifest.json")) {
    fs.writeFileSync("./data/manifest.json", "[]");
  }
  if (!fs.existsSync("./match.txt")) {
    fs.writeFileSync("./match.txt", "1");
  }
  if (!fs.existsSync("./schedule.json")) {
    alert("Please create a schedule.json file!")
  }
}

$(document).ready(function() {
  // shows the match number
  $(".match-display").text("Match: " + match);
  // creates six textareas, one for each robot
  createTextArea(0, "red");
  createTextArea(1, "red");
  createTextArea(2, "red");
  createTextArea(3, "blue");
  createTextArea(4, "blue");
  createTextArea(5, "blue");
  // on submit, save match to JSON, like 5-1353493652110.json
  $(".submit").click(function() {
    // JSON file to be saved
    let JSONsave = {}
    JSONsave["id"] = data_id;
    JSONsave["match"] = match;
    JSONsave["0"] = $("#text-area-0").val();
    JSONsave["1"] = $("#text-area-1").val();
    JSONsave["2"] = $("#text-area-2").val();
    JSONsave["3"] = $("#text-area-3").val();
    JSONsave["4"] = $("#text-area-4").val();
    JSONsave["5"] = $("#text-area-5").val();
    // writes the JSON file
    fs.writeFileSync("./data/" + parseInt(match) + "-" + data_id + ".json", JSON.stringify(JSONsave));
    // updates the match number
    fs.writeFileSync("./match.txt", parseInt(match) + 1);
    // earlier in the code we created this file if it did not already exist
    manifest.push(match + "-" + data_id + ".json");
    // writes the manifest
    fs.writeFileSync("./data/manifest.json", JSON.stringify(manifest));
    // relaod
    window.location.reload();
  });
  // export to a flashdrive "/Volumes/1540", "D:/1540", "C:/1540", "G:/1540", or "K:/1540"
  $(".export").click(function() {
    // list of possible paths for the flashdrive
    const path_list = ["/Volumes/1540/scouting/notes/", "K:/1540/scouting/notes/", "D:/1540/scouting/notes/", "G:/1540/scouting/notes/", "C:/1540/scouting/notes/"];
    // tries each path
    for (let path_index in path_list) {
      let path = path_list[path_index];
      // if the path exists
      if (fs.existsSync(path)) {
        // gets the manifest in the path
        let flash_manifest = [];
        if (fs.existsSync(path + "manifest.json")) {
          flash_manifest = JSON.parse(fs.readFileSync(path + "manifest.json"));
        }
        // loops through each file in local manifest
        for (let local_file_index in manifest) {
          // if local file exists on flash, go to next local file
          if (!fs.existsSync(manifest[local_file_index])) {
            continue;
          }
          // writes local file to flashdrive
          let local_file_name = manifest[local_file_index];
          let local_file = fs.readFileSync(local_file_name);
          fs.writeFileSync(path + local_file_name);
          if (flash_manifest.indexOf(local_file_name) < 0) {
            flash_manifest.push(local_file_name);
          }
        }
        // save manifest on flashdrive
        fs.writeFileSync(path + "manifest.json", JSON.stringify(flash_manifest));
        // break (won't run this code for any other possible paths)
        break;
      }
    }
  });
});
