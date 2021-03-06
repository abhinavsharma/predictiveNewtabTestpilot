/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Predictive Newtab.
 *
 * The Initial Developer of the Original Code is The Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Abhinav Sharma <asharma@mozilla.com>
 *   Edward Lee <edilee@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */



/**
 * Creates an AwesomeTab instance for one tab.
 *
 * @constructor
 * @this {AwesomeTab}
 * @param {Element} doc the document to populate with results.
 * @param {Obect} utils an instance of the utilities class
 * @param {Object} central a GrandCentral instance
 * @param {Object} tagger an instance of the POSTagger
 */
function AwesomeTab(utils, NewTabUtils, central, tagger, annoID, resultMap) {
  let me = this;
  //me.tester = new Tester();
  try {
  
    me.utils = utils;
    me.NewTabUtils = NewTabUtils;
    me.pos = new POSTagger();
    me.resultMap = {};
    reportError("getting visible places");
    let visiblePlaces = me.getVisiblePlaces();
    let currentPlaces = me.getLastKVisiblePlaces(visiblePlaces, 3);
  
  } catch (ex) { reportError(ex) }
}

AwesomeTab.prototype.updateResults = function() {
  let me = this;
  let visiblePlaces = me.getVisiblePlaces();
  let currentPlaces = me.getLastKVisiblePlaces(visiblePlaces, 3);
  
  let collector = new TagCollector(currentPlaces,visiblePlaces, me.utils, tagger);
  let collectedTags = collector.getResults();
  me.collectedHosts = collector.getHosts();
  let searchResults = new FullSearch(utils).search(collectedTags);
  reportError("** searchResults: "+ searchResults);
  let key = currentPlaces[0];
  me.resultMap[key] = searchResults;
  reportError("adding  : "  + key);
}

AwesomeTab.prototype.getResults = function() {
  let me = this;
  let visiblePlaces = me.getVisiblePlaces();
  let currentPlaces = me.getLastKVisiblePlaces(visiblePlaces, 3);
  let key = currentPlaces[0];
  reportError("** resultMap: " + J(me.resultMap))
  reportError("getting : " + key);
  let results =  me.resultMap[key];
  return results;
}

AwesomeTab.prototype.display = function(results, doc) {
  let me = this;
  let disp = new UserDisplay(results, me.collectedHosts, doc, me.utils, me.NewTabUtils);
}


/**
 * @usage
 */
AwesomeTab.prototype.getLastKVisiblePlaces = function(visiblePlaces, k) {
  let me = this;
  reportError("visible places are: " + J(visiblePlaces));
  let condition = Object.keys(visiblePlaces).map(function(placeId) {
    return "place_id=" + placeId;
  }).join(" OR ");
  let sqlQuery = "SELECT place_id FROM moz_historyvisits WHERE " + condition +" GROUP BY "
    +"place_id ORDER BY id DESC";
  let params = {}
  let data =  me.utils.getDataQuery(sqlQuery, params, ["place_id"])
  reportError(J(data));
  let lastKPlaces = [];
  reportError("ACTIVE" + global.lastURL);
  for (let i = 0; i < data.length; i++) {
    let placeId = data[i]["place_id"];
    if (!me.utils.isValidURL(visiblePlaces[placeId]["url"])) {
      continue;
    }
    if (visiblePlaces[placeId]["url"] == global.lastURL) {
      reportError("LAST URL WAS" + global.lastURL + placeId)
      lastKPlaces.unshift(placeId);
    }
    lastKPlaces.push(placeId);
  }
  reportError(lastKPlaces);
  return lastKPlaces;
};


AwesomeTab.prototype.getVisiblePlaces = function() {
  let me = this;
  let gBrowser = Services.wm.getMostRecentWindow("navigator:browser").gBrowser;
  let visibleTabs = gBrowser.visibleTabs;
  let places = {};
  me.collectedTitles = {};
  for (let i = 0; i < visibleTabs.length; i++) {
    let tab = visibleTabs[i];
    /*
    if (tab.pinned) {
      continue;
    }
    */
    let uri = gBrowser.getBrowserForTab(tab).currentURI.spec;
    // reportError(uri);
    let placesData = me.utils.getData(["id", "title", "url", "rev_host", "frecency"], {
        "url": uri
      }, "moz_places")
    for (let j = 0; j < placesData.length; j++) {
      let place = placesData[j];
      places[place["id"]] = place;
      me.collectedTitles[place["title"]] = placesData[j]["title"];
    }
  }
  return places;
}
