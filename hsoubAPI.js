"use strict";
var request = require("request");
var Document = require("jsdom").jsdom;
var hsoub = (function () {
    function hsoub(username, password) {
        this.username = username;
        this.password = password;
    }
    hsoub.prototype.search = function (keywords, callback) {
        var search = keywords.join(" ");
        var req = request({
            url: "https://io.hsoub.com/search?utf8=" + encodeURIComponent("✓") + "&s=" + encodeURIComponent(search),
            method: "get",
        }, function (err, res) {
            if (err) {
                throw Error("Network Error");
            }
            var document = Document(res.body);
            var elements = document.body.querySelector("#search-result-popular").querySelectorAll(".listItem"), result = [];
            for (var i = 0; i < elements.length; i++) {
                var item = elements[i], username = item.querySelector(".usr26 img")["alt"], data, commentsCounter = item.querySelector(".commentsCounter")["innerHTML"].split(">")[3]
                    .replace("تعليق واحد", "1")
                    .replace("تعليقان", "2")
                    .replace("تعليقات", "")
                    .replace("ناقِش", "0")
                    .replace("تعليق", "")
                    .replace("</a", "");
                if (username.match(/\<br \>/g)) {
                    username = username.split("<br >")[1];
                }
                data = {
                    post_id: parseInt(item.id.replace("post-", "")),
                    post_vote: item.querySelector(".post_points").innerHTML.trim(),
                    post_title: item.querySelector(".postContent a").innerHTML.trim(),
                    post_url: item.querySelector(".postContent a")["href"].trim(),
                    user: item.querySelector(".usr26")["href"].replace("/u/", "").trim(),
                    user_name: username.trim(),
                    user_image: item.querySelector(".usr26 img")["src"].trim(),
                    user_url: item.querySelector(".usr26")["href"].trim(),
                    community: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].replace("/", "").trim(),
                    community_name: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["innerHTML"].split(">")[2].trim(),
                    community_url: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].trim(),
                    commants_count: parseInt((commentsCounter).trim()),
                };
                if (item.querySelector(".post_image img") != undefined && item.querySelector(".post_image img") != null) {
                    data["post_thumbnail"] = item.querySelector(".post_image img")["src"];
                }
                result.push(data);
                if (i + 1 == elements.length) {
                    callback(result);
                    req.abort();
                }
            }
        });
        return true;
    };
    hsoub.prototype.community = function (communityId, callback) {
        var req = request({
            url: "https://io.hsoub.com/" + communityId,
            method: "get",
        }, function (err, res) {
            if (err) {
                throw Error("Network Error");
            }
            var document = Document(res.body);
            var elements = document.body.querySelector(".itemsList").querySelectorAll(".listItem"), result = [];
            for (var i = 0; i < elements.length; i++) {
                var item = elements[i], username = item.querySelector(".usr26 img")["alt"], data, commentsCounter = item.querySelector(".commentsCounter")["innerHTML"].split(">")[3]
                    .replace("تعليق واحد", "1")
                    .replace("تعليقان", "2")
                    .replace("تعليقات", "")
                    .replace("ناقِش", "0")
                    .replace("تعليق", "")
                    .replace("</a", "");
                if (username.match(/\<br \>/g)) {
                    username = username.split("<br >")[1];
                }
                data = {
                    post_id: parseInt(item.id.replace("post-", "")),
                    post_vote: item.querySelector(".post_points").innerHTML.trim(),
                    post_title: item.querySelector(".postContent a").innerHTML.trim(),
                    post_url: item.querySelector(".postContent a")["href"].trim(),
                    user: item.querySelector(".usr26")["href"].replace("/u/", "").trim(),
                    user_name: username.trim(),
                    user_image: item.querySelector(".usr26 img")["src"].trim(),
                    user_url: item.querySelector(".usr26")["href"].trim(),
                    community: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].replace("/", "").trim(),
                    community_name: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["innerHTML"].split(">")[2].trim(),
                    community_url: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].trim(),
                    commants_count: parseInt((commentsCounter).trim()),
                };
                if (item.querySelector(".post_image img") != undefined && item.querySelector(".post_image img") != null) {
                    data["post_thumbnail"] = item.querySelector(".post_image img")["src"];
                }
                result.push(data);
                if (i + 1 == elements.length) {
                    callback(result);
                    req.abort();
                }
            }
        });
        return true;
    };
    hsoub.prototype.user = function (userId, searchIn, callback) {
        var req = request({
            url: "https://io.hsoub.com/u/" + userId + (searchIn != null ? "/" + searchIn : ""),
            method: "get",
        }, function (err, res) {
            if (err) {
                throw Error("Network Error");
            }
            var document = Document(res.body);
            var elements = document.body.querySelector(".itemsList").querySelectorAll(".listItem"), result = [];
            for (var i = 0; i < elements.length; i++) {
                var item = elements[i], data;
                if (searchIn == "comments") {
                    data = {
                        post_title: item.querySelector(".comment_post").innerHTML.split("\n")[2].trim(),
                        post_url: item.querySelector(".comment_post")["href"].trim(),
                        comment: item.querySelector(".post-title a").innerHTML.trim(),
                        comment_id: parseInt(item.id.replace("comment-", "")),
                        comment_url: item.querySelector(".post-title a")["href"].trim(),
                        user: userId,
                        community: item.querySelector(".post_community")["href"].replace("/", "").trim(),
                        community_name: item.querySelector(".post_community")["innerHTML"].split(">")[2].trim(),
                        community_url: item.querySelector(".post_community")["href"].trim()
                    };
                }
                else {
                    var username = item.querySelector(".usr26 img")["alt"];
                    var commentsCounter = item.querySelector(".commentsCounter")["innerHTML"].split(">")[3]
                        .replace("تعليق واحد", "1")
                        .replace("تعليقان", "2")
                        .replace("تعليقات", "")
                        .replace("ناقِش", "0")
                        .replace("تعليق", "")
                        .replace("</a", "");
                    if (username.match(/\<br \>/g)) {
                        username = username.split("<br >")[1];
                    }
                    data = {
                        post_id: parseInt(item.id.replace("post-", "")),
                        post_vote: item.querySelector(".post_points").innerHTML.trim(),
                        post_title: item.querySelector(".postContent a").innerHTML.trim(),
                        post_url: item.querySelector(".postContent a")["href"].trim(),
                        user: item.querySelector(".usr26")["href"].replace("/u/", "").trim(),
                        user_name: username.trim(),
                        user_image: item.querySelector(".usr26 img")["src"].trim(),
                        user_url: item.querySelector(".usr26")["href"].trim(),
                        community: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].replace("/", "").trim(),
                        community_name: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["innerHTML"].split(">")[2].trim(),
                        community_url: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].trim(),
                        commants_count: parseInt((commentsCounter).trim()),
                    };
                    if (item.querySelector(".post_image img") != undefined && item.querySelector(".post_image img") != null) {
                        data["post_thumbnail"] = item.querySelector(".post_image img")["src"];
                    }
                }
                result.push(data);
                if (i + 1 == elements.length) {
                    callback(result);
                    req.abort();
                }
            }
        });
        return true;
    };
    return hsoub;
}());
exports.hsoub = hsoub;
(new hsoub("!", "!")).user("xlmnxp", "posts", function (results) {
    console.log(results);
});
