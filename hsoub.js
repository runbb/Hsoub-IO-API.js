"use strict";
var request = require("request");
var Document = require("jsdom").jsdom;
var io = (function () {
    function io(email, password) {
        this.email = email;
        this.password = password;
        if (email != null || password != null)
            this.login();
    }
    Object.defineProperty(io.prototype, "registerURL", {
        get: function () {
            return "https://accounts.hsoub.com/register";
        },
        enumerable: true,
        configurable: true
    });
    io.prototype.login = function () {
    };
    io.prototype.search = function (keywords, searchIn, callback) {
        var search = keywords.join(" "), options;
        if (searchIn == null)
            searchIn = "";
        if (searchIn.split("/")[0] == "comments") {
            options = "&in=comments";
            if (searchIn.split("/")[1]) {
                if (searchIn.split("/")[1] == "new") {
                    options += "&filter=new";
                }
                else if (searchIn.split("/")[1] == "top") {
                    options += "$filter=top";
                }
            }
        }
        else if (searchIn.split("/")[0] == "communities") {
            options = "&in=communities";
            if (searchIn.split("/")[1]) {
                if (searchIn.split("/")[1] == "new") {
                    options += "&filter=new";
                }
                else if (searchIn.split("/")[1] == "active") {
                    options += "$filter=active";
                }
            }
        }
        else if (searchIn.split("/")[0] == "posts") {
            options = "&in=posts";
            if (searchIn.split("/")[1]) {
                if (searchIn.split("/")[1] == "new") {
                    options += "&filter=new";
                }
                else if (searchIn.split("/")[1] == "best") {
                    options += "$filter=best";
                }
            }
        }
        else {
            options = "";
        }
        var req = request({
            url: "https://io.hsoub.com/search?utf8=" + encodeURIComponent("✓") + "&s=" + encodeURIComponent(search) + (options != null ? options : ""),
            method: "get",
        }, function (err, res) {
            if (err) {
                callback(err, null);
            }
            var document = Document(res.body);
            var elements = document.body.querySelector(".itemsList").querySelectorAll(".listItem"), result = [];
            for (var i = 0; i < elements.length; i++) {
                var item = elements[i], data;
                if (searchIn.split("/")[0] == "comments") {
                    data = {
                        post: {
                            id: '',
                            title: item.querySelector(".comment_post").innerHTML.split("\n")[2].trim(),
                            url: item.querySelector(".comment_post")["href"].trim(),
                        },
                        comment: {
                            id: parseInt(item.id.replace("comment-", "")),
                            comment: item.querySelector(".post-title a").innerHTML.trim(),
                            url: item.querySelector(".post-title a")["href"].trim(),
                        },
                        community: {
                            id: item.querySelector(".post_community")["href"].replace("/", "").trim(),
                            name: item.querySelector(".post_community")["innerHTML"].split(">")[2].trim(),
                            url: item.querySelector(".post_community")["href"].trim()
                        }
                    };
                }
                else if (searchIn.split("/")[0] == "communities") {
                }
                else {
                    var username = item.querySelector(".usr26 img")["alt"], commentsCounter = item.querySelector(".commentsCounter")["innerHTML"].split(">")[3]
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
                        post: {
                            id: parseInt(item.id.replace("post-", "")),
                            vote: item.querySelector(".post_points").innerHTML.trim(),
                            title: item.querySelector(".postContent a").innerHTML.trim(),
                            url: item.querySelector(".postContent a")["href"].trim(),
                        },
                        user: {
                            id: item.querySelector(".usr26")["href"].replace("/u/", "").trim(),
                            user: decodeURIComponent(item.querySelector(".usr26")["href"].replace("/u/", "")).trim(),
                            name: username.trim(),
                            avatar: item.querySelector(".usr26 img")["src"].trim(),
                            url: item.querySelector(".usr26")["href"].trim(),
                        },
                        community: {
                            id: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].replace("/", "").trim(),
                            name: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["innerHTML"].split(">")[2].trim(),
                            url: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].trim(),
                        },
                        commants_count: parseInt((commentsCounter).trim()),
                    };
                    if (item.querySelector(".post_image img") != undefined && item.querySelector(".post_image img") != null) {
                        data.post["thumbnail"] = item.querySelector(".post_image img")["src"];
                    }
                }
                result.push(data);
                if (i + 1 == elements.length) {
                    callback(null, result);
                    req.abort();
                }
            }
        });
        return this;
    };
    io.prototype.community = function (communityId, searchIn, callback) {
        var req = request({
            url: "https://io.hsoub.com/" + communityId + (searchIn != null ? "/" + searchIn : ""),
            method: "get",
        }, function (err, res) {
            if (err) {
                callback(err, null);
            }
            var document = Document(res.body);
            var elements = document.body.querySelector(".itemsList").querySelectorAll(".listItem"), result = {
                id: communityId,
                name: document.body.querySelector(".communities .block h2").innerHTML.trim(),
                url: "/" + communityId,
                about_url: "/" + communityId + "/about",
                followers: document.body.querySelector(".communities .communityFollower span").innerHTML.trim(),
                image: document.body.querySelector(".communities .block img")["src"].trim(),
                description: document.body.querySelector(".communities .block p").innerHTML.split("<")[0].trim(),
                lastcomments: [],
                best_contributors: [],
                owners: [],
                subjects: [],
            };
            var lastcomments = document.body.querySelectorAll(".latestComments")[0].querySelectorAll("li");
            var best_contributors = document.body.querySelectorAll(".latestComments")[1].querySelectorAll("li");
            var owners = document.body.querySelectorAll(".latestComments")[2].querySelectorAll("li");
            for (var i = 0; i < lastcomments.length; i++) {
                result.lastcomments.push({
                    comment: {
                        id: parseInt(lastcomments[i].id.replace("latest_comment-", "").trim()),
                        comment: lastcomments[i].querySelector(".comTxt .commentTxt").innerHTML.trim(),
                        url: lastcomments[i].querySelector(".comTxt .commentTxt")["href"].trim(),
                    },
                    user: {
                        id: lastcomments[i].querySelector(".comTxt a")["href"].replace("/u/", "").trim(),
                        user: decodeURIComponent(lastcomments[i].querySelector(".comTxt a")["href"].replace("/u/", "")).trim(),
                        name: lastcomments[i].querySelector(".comTxt a").innerHTML.trim(),
                        avatar: lastcomments[i].querySelector("img")["src"],
                        url: lastcomments[i].querySelector(".comTxt a")["href"],
                    },
                });
            }
            for (var i = 0; i < best_contributors.length; i++) {
                result.best_contributors.push({
                    id: best_contributors[i].querySelector(".comTxt div a.username")["href"].replace("/u/", "").trim(),
                    user: decodeURIComponent(best_contributors[i].querySelector(".comTxt div a.username")["href"].replace("/u/", "").trim()),
                    name: best_contributors[i].querySelector(".comTxt div a.username").innerHTML.trim(),
                    avatar: best_contributors[i].querySelector("img")["src"],
                    url: best_contributors[i].querySelector(".comTxt div a.username")["href"].trim(),
                });
            }
            for (var i = 0; i < owners.length; i++) {
                result.owners.push({
                    id: owners[i].querySelector(".userCardHeaderText a")["href"].replace("/u/", "").trim(),
                    user: decodeURIComponent(owners[i].querySelector(".userCardHeaderText a")["href"].replace("/u/", "")).trim(),
                    avatar: owners[i].querySelector("img")["src"],
                    name: owners[i].querySelector("span.full_name").innerHTML.trim(),
                    url: "/u/" + owners[i].querySelector(".userCardHeaderText a")["href"].replace("/u/", "")
                });
            }
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
                    post: {
                        id: parseInt(item.id.replace("post-", "")),
                        vote: parseInt(item.querySelector(".post_points").innerHTML.trim()),
                        title: item.querySelector(".postContent a").innerHTML.trim(),
                        url: item.querySelector(".postContent a")["href"].trim(),
                    },
                    user: {
                        id: item.querySelector(".usr26")["href"].replace("/u/", "").trim(),
                        user: decodeURIComponent(item.querySelector(".usr26")["href"].replace("/u/", "")).trim(),
                        name: username.trim(),
                        avatar: item.querySelector(".usr26 img")["src"].trim(),
                        url: item.querySelector(".usr26")["href"].trim(),
                    },
                    community: {
                        id: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].replace("/", "").trim(),
                        name: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["innerHTML"].split(">")[2].trim(),
                        url: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].trim(),
                    },
                    commants_count: parseInt((commentsCounter).trim()),
                };
                if (item.querySelector(".post_image img") != undefined && item.querySelector(".post_image img") != null) {
                    data["post_thumbnail"] = item.querySelector(".post_image img")["src"];
                }
                result.subjects.push(data);
                if (i + 1 == elements.length) {
                    callback(null, result);
                    req.abort();
                }
            }
        });
        return this;
    };
    io.prototype.profile = function (userId, searchIn, callback) {
        var req = request({
            url: "https://io.hsoub.com/u/" + userId + (searchIn != null ? "/" + searchIn : ""),
            method: "get",
        }, function (err, res) {
            if (err) {
                callback(err, null);
            }
            var document = Document(res.body);
            var elements = document.body.querySelector(".itemsList").querySelectorAll(".listItem"), result = {
                id: userId,
                user: document.querySelector(".username").innerHTML.trim(),
                name: document.querySelector(".full_name").innerHTML.trim(),
                avatar: document.querySelector(".pull-right img")["src"].trim(),
                points: parseInt(document.querySelectorAll(".pull-right b")[0].innerHTML.trim()),
                register_date: new Date((document.querySelectorAll(".pull-right b")[1].innerHTML.trim()).split("/").reverse().join("-")),
                last_enter: document.querySelectorAll(".pull-right b")[2].innerHTML.trim(),
                results: []
            };
            for (var i = 0; i < elements.length; i++) {
                var item = elements[i], data;
                if (searchIn == "comments") {
                    data = {
                        post: {
                            id: parseInt(decodeURIComponent(item.querySelector(".comment_post")["href"]).trim().match(/(\d+[0-9]\-)/g)[0].replace("-", "")),
                            title: item.querySelector(".comment_post").innerHTML.split("\n")[2].trim(),
                            url: item.querySelector(".comment_post")["href"].trim()
                        },
                        comment: {
                            id: parseInt(item.id.replace("comment-", "")),
                            comment: item.querySelector(".post-title a").innerHTML.trim(),
                            url: item.querySelector(".post-title a")["href"].trim()
                        },
                        user: {
                            id: userId,
                            user: document.querySelector(".username").innerHTML.trim(),
                            name: document.querySelector(".full_name").innerHTML.trim(),
                            avatar: document.querySelector(".pull-right img")["src"].trim(),
                            url: "/u/" + userId,
                        },
                        community: {
                            id: item.querySelector(".post_community")["href"].replace("/", "").trim(),
                            name: item.querySelector(".post_community")["innerHTML"].split(">")[2].trim(),
                            url: item.querySelector(".post_community")["href"].trim()
                        },
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
                        username = username.split("<br >");
                    }
                    data = {
                        post: {
                            id: parseInt(item.id.replace("post-", "")),
                            likes: item.querySelector(".post_points").innerHTML.trim(),
                            title: item.querySelector(".postContent a").innerHTML.trim(),
                            url: item.querySelector(".postContent a")["href"].trim()
                        },
                        user: {
                            id: decodeURIComponent(item.querySelector(".usr26")["href"].replace("/u/", "")).trim(),
                            user: username[0].trim(),
                            name: username[1].trim(),
                            avatar: item.querySelector(".usr26 img")["src"].trim(),
                            url: item.querySelector(".usr26")["href"].trim(),
                        },
                        community: {
                            id: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].replace("/", "").trim(),
                            name: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["innerHTML"].split(">")[2].trim(),
                            url: item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].trim(),
                        },
                        commants_count: parseInt((commentsCounter).trim()),
                    };
                    if (item.querySelector(".post_image img") != undefined && item.querySelector(".post_image img") != null) {
                        data["post_thumbnail"] = item.querySelector(".post_image img")["src"];
                    }
                }
                result.results.push(data);
                if (i + 1 == elements.length) {
                    callback(null, result);
                    req.abort();
                }
            }
        });
        return this;
    };
    return io;
}());
exports.io = io;
//# sourceMappingURL=hsoub.js.map