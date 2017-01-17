declare var require;
import request = require("request");
var Document = require("jsdom").jsdom;
export class io {
    constructor(private username: string, private password: string) {

    }
    public search(keywords: Array<string>, searchIn: string, callback: (results: Array<JSON>) => any): Boolean {
        var search: string = keywords.join(" "),
            options;
        if (searchIn == null) searchIn = "";
        if (searchIn.split("/")[0] == "comments") {
            options = "&in=comments";
            if (searchIn.split("/")[1]) {
                if (searchIn.split("/")[1] == "new") {
                    options += "&filter=new";
                } else if (searchIn.split("/")[1] == "top") {
                    options += "$filter=top";
                }
            }
        } else if (searchIn.split("/")[0] == "communities") {
            options = "&in=communities";
            if (searchIn.split("/")[1]) {
                if (searchIn.split("/")[1] == "new") {
                    options += "&filter=new";
                } else if (searchIn.split("/")[1] == "active") {
                    options += "$filter=active";
                }
            }
        } else if (searchIn.split("/")[0] == "posts") {
            options = "&in=posts";
            if (searchIn.split("/")[1]) {
                if (searchIn.split("/")[1] == "new") {
                    options += "&filter=new";
                } else if (searchIn.split("/")[1] == "best") {
                    options += "$filter=best";
                }
            }
        } else {
            options = "";
        }
        var req = request({
            url: `https://io.hsoub.com/search?utf8=${encodeURIComponent("✓")}&s=${encodeURIComponent(search)}${options != null ? options : ""}`,
            method: "get",
        }, (err, res) => {
            if (err) {
                throw Error("Network Error");
            }
            var document = Document(res.body);
            var elements: NodeList = document.body.querySelector(".itemsList").querySelectorAll(".listItem"),
                result: Array<JSON> = [];
            for (let i = 0; i < elements.length; i++) {
                var item: HTMLAnchorElement = <HTMLAnchorElement>elements[i],
                    data;
                if (searchIn.split("/")[0] == "comments") {
                    data = {
                        post_title: (<string>item.querySelector(".comment_post").innerHTML.split("\n")[2]).trim(),
                        post_url: (<string>item.querySelector(".comment_post")["href"]).trim(),
                        comment: (<string>item.querySelector(".post-title a").innerHTML).trim(),
                        comment_id: parseInt(item.id.replace("comment-", "")),
                        comment_url: (<string>item.querySelector(".post-title a")["href"]).trim(),
                        community: (<string>item.querySelector(".post_community")["href"].replace("/", "")).trim(),
                        community_name: (<string>item.querySelector(".post_community")["innerHTML"].split(">")[2]).trim(),
                        community_url: (<string>item.querySelector(".post_community")["href"]).trim()
                    };
                } else if (searchIn.split("/")[0] == "communities") {

                } else {
                    var username: String = <string>item.querySelector(".usr26 img")["alt"],

                        commentsCounter = <string>item.querySelector(".commentsCounter")["innerHTML"].split(">")[3]
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
                        post_vote: (<string>item.querySelector(".post_points").innerHTML).trim(),
                        post_title: (<string>item.querySelector(".postContent a").innerHTML).trim(),
                        post_url: (<string>item.querySelector(".postContent a")["href"]).trim(),
                        user: (<string>item.querySelector(".usr26")["href"].replace("/u/", "")).trim(),
                        user_name: username.trim(),
                        user_image: (<string>item.querySelector(".usr26 img")["src"]).trim(),
                        user_url: (<string>item.querySelector(".usr26")["href"]).trim(),
                        community: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].replace("/", "")).trim(),
                        community_name: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["innerHTML"].split(">")[2]).trim(),
                        community_url: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"]).trim(),
                        commants_count: parseInt((commentsCounter).trim()),
                    };
                    if (item.querySelector(".post_image img") != undefined && item.querySelector(".post_image img") != null) {
                        data["post_thumbnail"] = item.querySelector(".post_image img")["src"];
                    }
                }
                result.push(data)
                if (i + 1 == elements.length) {
                    callback(result);
                    req.abort();
                }
            }
        });
        return true;
    }

    public community(communityId: string, searchIn: string, callback: (results: any) => any): boolean {
        var req = request({
            url: `https://io.hsoub.com/${communityId}${searchIn != null ? "/" + searchIn : ""}`,
            method: "get",
        }, (err, res) => {
            if (err) {
                throw Error("Network Error");
            }
            var document = Document(res.body);
            var elements: NodeList = document.body.querySelector(".itemsList").querySelectorAll(".listItem"),
                result = {
                    communityId: communityId,
                    community_name: (<string>document.body.querySelector(".communities .block h2").innerHTML).trim(),
                    community_url: "/" + communityId,
                    community_about_url: "/" + communityId + "/about",
                    community_followers: (<string>document.body.querySelector(".communities .communityFollower span").innerHTML).trim(),
                    community_image: (<string>document.body.querySelector(".communities .block img")["src"]).trim(),
                    community_description: (<string>document.body.querySelector(".communities .block p").innerHTML.split("<")[0]).trim(),
                    community_lastcomments: [],
                    community_best_contributors: [],
                    community_owners: [],
                    communitySubjects: [],
                };
            var lastcomments: HTMLLIElement[] = document.body.querySelectorAll(".latestComments")[0].querySelectorAll("li");
            var best_contributors: HTMLLIElement[] = document.body.querySelectorAll(".latestComments")[1].querySelectorAll("li");
            var owners: HTMLLIElement[] = document.body.querySelectorAll(".latestComments")[2].querySelectorAll("li");
            for (let i = 0; i < lastcomments.length; i++) {
                result.community_lastcomments.push({
                    commentId: parseInt((<string>lastcomments[i].id.replace("latest_comment-", "")).trim()),
                    user: decodeURIComponent((<string>lastcomments[i].querySelector(".comTxt a")["href"].replace("/u/", ""))).trim(),
                    user_avatar: <string>lastcomments[i].querySelector("img")["src"],
                    user_name: (<string>lastcomments[i].querySelector(".comTxt a").innerHTML).trim(),
                    user_url: <string>lastcomments[i].querySelector(".comTxt a")["href"],
                    comment: (<string>lastcomments[i].querySelector(".comTxt .commentTxt").innerHTML).trim(),
                    comment_url: (<string>lastcomments[i].querySelector(".comTxt .commentTxt")["href"]).trim(),
                });
            }
            for (let i = 0; i < best_contributors.length; i++) {
                result.community_best_contributors.push({
                    user: decodeURIComponent((<string>best_contributors[i].querySelector(".comTxt div a.username")["href"].replace("/u/", "")).trim()),
                    user_avatar: <string>best_contributors[i].querySelector("img")["src"],
                    user_url: (<string>best_contributors[i].querySelector(".comTxt div a.username")["href"]).trim(),
                    user_name: (<string>best_contributors[i].querySelector(".comTxt div a.username").innerHTML).trim(),
                });
            }
            for (let i = 0; i < owners.length; i++) {
                result.community_owners.push({
                    user: decodeURIComponent((<string>owners[i].querySelector(".userCardHeaderText a")["href"].replace("/u/", ""))).trim(),

                    user_avatar: <string>owners[i].querySelector("img")["src"],
                    user_name: (<string>owners[i].querySelector("span.full_name").innerHTML).trim(),
                });
            }

            for (let i = 0; i < elements.length; i++) {
                var item: HTMLAnchorElement = <HTMLAnchorElement>elements[i],
                    username: String = <string>item.querySelector(".usr26 img")["alt"],
                    data, commentsCounter = <string>item.querySelector(".commentsCounter")["innerHTML"].split(">")[3]
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
                    post_id: parseInt(<string>item.id.replace("post-", "")),
                    post_vote: parseInt((<string>item.querySelector(".post_points").innerHTML).trim()),
                    post_title: (<string>item.querySelector(".postContent a").innerHTML).trim(),
                    post_url: (<string>item.querySelector(".postContent a")["href"]).trim(),
                    user: decodeURIComponent((<string>item.querySelector(".usr26")["href"].replace("/u/", ""))).trim(),
                    user_avatar: (<string>item.querySelector(".usr26 img")["src"]).trim(),
                    user_name: username.trim(),
                    user_url: (<string>item.querySelector(".usr26")["href"]).trim(),
                    community: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].replace("/", "")).trim(),
                    community_name: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["innerHTML"].split(">")[2]).trim(),
                    community_url: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"]).trim(),
                    commants_count: parseInt((commentsCounter).trim()),
                };
                if (item.querySelector(".post_image img") != undefined && item.querySelector(".post_image img") != null) {
                    data["post_thumbnail"] = item.querySelector(".post_image img")["src"];
                }
                result.communitySubjects.push(data)
                if (i + 1 == elements.length) {
                    callback(result);
                    req.abort();
                }
            }
        });
        return true;
    }

    public user(userId: string, searchIn: string | null, callback: (results: Array<JSON>) => any): boolean {
        var req = request({
            url: `https://io.hsoub.com/u/${userId}${searchIn != null ? "/" + searchIn : ""}`,
            method: "get",
        }, (err, res) => {
            if (err) {
                throw Error("Network Error");
            }
            var document = Document(res.body);
            var elements: NodeList = document.body.querySelector(".itemsList").querySelectorAll(".listItem"),
                result: Array<JSON> = [];
            for (let i = 0; i < elements.length; i++) {
                var item: HTMLAnchorElement = <HTMLAnchorElement>elements[i],
                    data;
                if (searchIn == "comments") {
                    data = {
                        post_title: (<string>item.querySelector(".comment_post").innerHTML.split("\n")[2]).trim(),
                        post_url: (<string>item.querySelector(".comment_post")["href"]).trim(),
                        comment: (<string>item.querySelector(".post-title a").innerHTML).trim(),
                        comment_id: parseInt(item.id.replace("comment-", "")),
                        comment_url: (<string>item.querySelector(".post-title a")["href"]).trim(),
                        user: userId,
                        community: (<string>item.querySelector(".post_community")["href"].replace("/", "")).trim(),
                        community_name: (<string>item.querySelector(".post_community")["innerHTML"].split(">")[2]).trim(),
                        community_url: (<string>item.querySelector(".post_community")["href"]).trim()
                    };
                } else {
                    var username: String = <string>item.querySelector(".usr26 img")["alt"];
                    var commentsCounter = <string>item.querySelector(".commentsCounter")["innerHTML"].split(">")[3]
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
                        post_vote: (<string>item.querySelector(".post_points").innerHTML).trim(),
                        post_title: (<string>item.querySelector(".postContent a").innerHTML).trim(),
                        post_url: (<string>item.querySelector(".postContent a")["href"]).trim(),
                        user: decodeURIComponent((<string>item.querySelector(".usr26")["href"].replace("/u/", ""))).trim(),
                        user_name: username.trim(),
                        user_avatar: (<string>item.querySelector(".usr26 img")["src"]).trim(),
                        user_url: (<string>item.querySelector(".usr26")["href"]).trim(),
                        community: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].replace("/", "")).trim(),
                        community_name: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["innerHTML"].split(">")[2]).trim(),
                        community_url: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"]).trim(),
                        commants_count: parseInt((commentsCounter).trim()),
                    };
                    if (item.querySelector(".post_image img") != undefined && item.querySelector(".post_image img") != null) {
                        data["post_thumbnail"] = item.querySelector(".post_image img")["src"];
                    }
                }
                result.push(data)
                if (i + 1 == elements.length) {
                    callback(result);
                    req.abort();
                }
            }
        });
        return true;
    }
}
