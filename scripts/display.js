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
 *   Margaret Leibovic <mleibovic@mozilla.com>
 *   Lilian Weng <lweng@mozilla.com>
 *   Edward Lee <edilee@mozilla.com>
 *
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



function UserDisplay(searchResults, collectedHosts, doc, utils, NewTabUtils) {
  let me = this;
  me.doc = doc;
  me.utils = utils;
  me.NewTabUtils = NewTabUtils;
  let $ = me.doc.getElementById;
  let noResults = true;
  
  for (let i in searchResults) {
    //if (searchResults[i].hub && !(searchResults[i].revHost in collectedHosts)) {
      noResults = false;
      let elem = me.createSiteItem(searchResults[i]);
      $('content-all').appendChild(elem);
    //}
  }

  if (noResults) {
    $('no-results').style.display = 'block';
  }
  
}


UserDisplay.prototype.createSiteItem = function(result) {
  let me = this;
  let imageItem = me.doc.createElement("img");
  imageItem.className = "image-item";
  imageItem.setAttribute("src", me.utils.getFaviconData(result.url) );

  let imageContainer = me.doc.createElement("div");
  imageContainer.className = "image-container";
  imageContainer.appendChild(imageItem);
  imageContainer.addEventListener("click", function(event) {
    me.doc.location = result.url;
  }, false);

  let color = NewTabUtils.getCachedFaviconColor(imageItem);
  if (color) {
    me.colorBackground(imageContainer, color);
  } else {
    imageItem.addEventListener("load", function() {
        color = me.NewTabUtils.getFaviconColor(this, me.doc);
        me.colorBackground(imageContainer, color);
    }, false);
  }

  let urlItem = me.doc.createElement("a");
  urlItem.className = "url-item";    
  urlItem.href = result.url;
  urlItem.textContent = result.title;

  let siteItem = me.doc.createElement("div");
  siteItem.setAttribute("url", result.url);
  siteItem.className = "site-item";
  siteItem.appendChild(imageContainer);
  siteItem.appendChild(urlItem);

  // Set up drag and drop for site items
  siteItem.setAttribute("draggable", true);

  siteItem.addEventListener("dragstart", function(event) {
    event.dataTransfer.mozSetDataAt("application/x-moz-node", siteItem, 0);
    event.dataTransfer.setDragImage(imageContainer, 16, 16);
  }, false);

  siteItem.addEventListener("dragover", function(event) {
    if (event.dataTransfer.types.contains("application/x-moz-node")) {
      event.preventDefault();
    }
  }, false);

/*
  siteItem.addEventListener("drop", function(event) {
    if (event.dataTransfer.types.contains("application/x-moz-node")) {
      let itemToDrop = event.dataTransfer.mozGetDataAt("application/x-moz-node", 0);
      let targetItem = event.target;
      // Determine if we should drop to the left or the right of the target
      if (event.clientX > targetItem.offsetLeft + targetItem.clientWidth/2) {
        targetItem = targetItem.nextSibling;
      }
      // Check to make sure the item should actually move
      if (targetItem != itemToDrop) {
        let parent = itemToDrop.parentNode;
        parent.removeChild(itemToDrop);
        parent.insertBefore(itemToDrop, targetItem);
        NewTabUtils.moveDroppedSite(itemToDrop.getAttribute("url"), targetItem.getAttribute("url"));
      }
      event.preventDefault();
    }
  }, false);
*/
  return siteItem;
}



// Set up image container gradient color background
UserDisplay.prototype.colorBackground = function(aElmt, aColor) {
  aElmt.style.backgroundImage = "-moz-linear-gradient(top, rgba(" + aColor + ",0.1), rgba(" + aColor + ",0.3))";
  aElmt.style.borderColor = "rgba(" + aColor + ",0.9)";
}



/*
UserDisplay.prototype.getElementForResult = function(result) {
  let me = this;
  let e = me.doc.createElement('span');
  function escapeHTML(str) str.replace(/[&"<>]/g, function (m) "&" + ({ "&": "amp", '"': "quot", "<": "lt", ">": "gt" })[m] + ";");
  let f = me.doc.createElement('img');
  f.style.height = '16px';
  f.style.width = '16px';
  f.src = me.utils.getFaviconData(result.url);
  f.setAttribute("class", "favicon");
  let a = me.doc.createElement('a');
  a.setAttribute('href', result.url);
  a.innerHTML = result.title.length < 30 ? escapeHTML(result.title) : escapeHTML(result.title.slice(0, 25) + " ...");
  e.appendChild(f);
  e.appendChild(a);
  return e;
}
*/