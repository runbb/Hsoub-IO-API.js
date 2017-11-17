export interface Post {
    id: number;
    title: string;
    content: string;
    points: string;
    likes: string;
    dislikes: string;
    url: string;
}

export interface User {
    id: string;
    user: string;
    avatar: string;
    url: string;
}

export interface Community {
    id: string;
    name: string;
    description: string;
    url: string;
}

export interface commentContent {
    content: string;
    vote: number;
    date: string;
}

export interface Comment {
    user: User;
    comment: commentContent;
    comments: any[];
}

export interface postData {
    post: Post;
    user: User;
    community: Community;
    comments: Comment[];
}

export class io {
    private Document = require("jsdom").jsdom;
    private request = require("request");
    constructor(private email ? : string, private password ? : string) {
        if (email != null || password != null)
            this.login();
    }
    public get registerURL(): string {
        return "https://accounts.hsoub.com/register";
    }

    private login() {

    }

    public search(keywords: Array<string>, searchIn: string, callback: (err: Error, results: Array < JSON > ) => any): io {
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
        var req = this.request({
            url: `https://io.hsoub.com/search?utf8=${encodeURIComponent("✓")}&s=${encodeURIComponent(search)}${options != null ? options : ""}`,
            method: "get",
        }, (err, res) => {
            if (err) {
                callback(err, null);
            }
            var document = this.Document(res.body);
            var elements: NodeList = document.body.querySelector(".itemsList").querySelectorAll(".listItem"),
                result: Array < JSON > = [];
            if (elements.length == 0) {
                callback(null, result);
                req.abort();
            }
            for (let i = 0; i < elements.length; i++) {
                var item: HTMLAnchorElement = <HTMLAnchorElement>elements[i],
                    data;
                if (searchIn.split("/")[0] == "comments") {
                    data = {
                        post: {
                            id: (<string>item.querySelector(".comment_post")["href"]).match(/(\d+[0-9]\-)/g)[0].replace("-", ""),
                            title: (<string>item.querySelector(".comment_post").innerHTML.split("\n")[2]).trim(),
                            url: (<string>item.querySelector(".comment_post")["href"]).trim(),
                        },
                        comment: {
                            id: parseInt(item.id.replace("comment-", "")),
                            comment: (<string>item.querySelector(".post-title a").innerHTML).trim(),
                            url: (<string>item.querySelector(".post-title a")["href"]).trim(),
                        },
                        community: {
                            id: (<string>item.querySelector(".post_community")["href"].replace("/", "")).trim(),
                            name: (<string>item.querySelector(".post_community")["innerHTML"].split(">")[2]).trim(),
                            url: (<string>item.querySelector(".post_community")["href"]).trim()
                        }
                    };
                } else if (searchIn.split("/")[0] == "communities") {

                } else {
                    var username: String =<string>item.querySelector(".usr26 img")["alt"],

                        commentsCounter =<string>item.querySelector(".commentsCounter")["innerHTML"].split(">")[3]
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
                            vote: (<string>item.querySelector(".post_points").innerHTML).trim(),
                            title: (<string>item.querySelector(".postContent a").innerHTML).trim(),
                            url: (<string>item.querySelector(".postContent a")["href"]).trim(),
                        },
                        user: {
                            id: (<string>item.querySelector(".usr26")["href"].replace("/u/", "")).trim(),
                            user: decodeURIComponent((<string>item.querySelector(".usr26")["href"].replace("/u/", ""))).trim(),
                            name: username.trim(),
                            avatar: (<string>item.querySelector(".usr26 img")["src"]).trim(),
                            url: (<string>item.querySelector(".usr26")["href"]).trim(),
                        },
                        community: {
                            id: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].replace("/", "")).trim(),
                            name: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["innerHTML"].split(">")[2]).trim(),
                            url: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"]).trim(),
                        },
                        commants_count: parseInt((commentsCounter).trim()),
                    };
                    if (item.querySelector(".post_image img") != undefined && item.querySelector(".post_image img") != null) {
                        data.post["thumbnail"] = item.querySelector(".post_image img")["src"];
                    }
                }
                result.push(data)
                if (i + 1 == elements.length) {
                    callback(null, result);
                    req.abort();
                }
            }
        });
        return this;
    }

    public community(communityId: string, searchIn: string, callback: (err: Error, results: any) => any): io {
        var req = this.request({
            url: `https://io.hsoub.com/${communityId}${searchIn != null ? "/" + searchIn : ""}`,
            method: "get",
        }, (err, res) => {
            if (err) {
                callback(err, null);
            }
            var document = this.Document(res.body);
            if (document.querySelector(".errorBox")){
              callback(new Error("404"),null);
              return;
            }
            var elements: NodeList = document.querySelector(".itemsList").querySelectorAll(".listItem"),
                result = {
                    id: communityId,
                    name: (<string>document.querySelector(".block h2.underline").innerHTML).trim(),
                    url: "/" + communityId,
                    about_url: "/" + communityId + "/about",
                    followers: (<string>document.body.querySelector(".communityFollower span").innerHTML).trim(),
                        description: (<string>document.body.querySelector(".block p").innerHTML.split("<")[0]).trim(),
                    lastcomments: [],
                    best_contributors: [],
                    owners: [],
                    subjects: [],
                };
            var query = document.querySelectorAll(".latestComments");
            var lastcomments: HTMLLIElement[];
            var best_contributors: HTMLLIElement[];
            var owners: HTMLLIElement[];

            if (query.length >= 1) {
                lastcomments = query[0].querySelectorAll("li");

                for (let i = 0; i < lastcomments.length; i++) {
                    result.lastcomments.push({
                        comment: {
                            id: parseInt((<string>lastcomments[i].id.replace("latest_comment-", "")).trim()),
                            comment: (<string>lastcomments[i].querySelector(".comTxt .commentTxt").innerHTML).trim(),
                            url: (<string>lastcomments[i].querySelector(".comTxt .commentTxt")["href"]).trim(),
                        },
                        user: {
                            id: (<string>lastcomments[i].querySelector(".comTxt a")["href"].replace("/u/", "")).trim(),
                            user: decodeURIComponent((<string>lastcomments[i].querySelector(".comTxt a")["href"].replace("/u/", ""))).trim(),
                            name: (<string>lastcomments[i].querySelector(".comTxt a").innerHTML).trim(),
                            avatar:<string>lastcomments[i].querySelector("img")["src"],
                            url:<string>lastcomments[i].querySelector(".comTxt a")["href"],
                        },
                    });
                }
            }
            if (query.length >= 2) {
                best_contributors = query[1].querySelectorAll("li");

                for (let i = 0; i < best_contributors.length; i++) {
                    result.best_contributors.push({
                        id: (<string>best_contributors[i].querySelector(".comTxt div a.username")["href"].replace("/u/", "")).trim(),
                        user: decodeURIComponent((<string>best_contributors[i].querySelector(".comTxt div a.username")["href"].replace("/u/", "")).trim()),
                        name: (<string>best_contributors[i].querySelector(".comTxt div a.username").innerHTML).trim(),
                        avatar:<string>best_contributors[i].querySelector("img")["src"],
                        url: (<string>best_contributors[i].querySelector(".comTxt div a.username")["href"]).trim(),
                    });
                }
            }
            if (query.length >= 3) {
                owners = query[2].querySelectorAll("li");

                for (let i = 0; i < owners.length; i++) {
                    result.owners.push({
                        id: (<string>owners[i].querySelector(".userCardHeaderText a")["href"].replace("/u/", "")).trim(),
                        user: decodeURIComponent((<string>owners[i].querySelector(".userCardHeaderText a")["href"].replace("/u/", ""))).trim(),
                        avatar:<string>owners[i].querySelector("img")["src"],
                        name: (<string>owners[i].querySelector("span.full_name").innerHTML).trim(),
                        url: "/u/" + (<string>owners[i].querySelector(".userCardHeaderText a")["href"].replace("/u/", ""))
                    });
                }
            }
            if (elements.length == 0) {
                callback(null, result);
                req.abort();
            }
            for (let i = 0; i < elements.length; i++) {
                var item: HTMLAnchorElement = <HTMLAnchorElement>elements[i],
                    username: String =<string>item.querySelector(".usr26 img")["alt"],
                    data, commentsCounter =<string>item.querySelector(".commentsCounter")["innerHTML"].split(">")[3]
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
                        id: parseInt(<string>item.id.replace("post-", "")),
                        vote: parseInt((<string>item.querySelector(".post_points").innerHTML).trim()),
                        title: (<string>item.querySelector(".postContent a").innerHTML).trim(),
                        url: (<string>item.querySelector(".postContent a")["href"]).trim(),
                    },
                    user: {
                        id: (<string>item.querySelector(".usr26")["href"].replace("/u/", "")).trim(),
                        user: decodeURIComponent((<string>item.querySelector(".usr26")["href"].replace("/u/", ""))).trim(),
                        name: username.trim(),
                        avatar: (<string>item.querySelector(".usr26 img")["src"]).trim(),
                        url: (<string>item.querySelector(".usr26")["href"]).trim(),
                    },
                    community: {
                        id: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].replace("/", "")).trim(),
                        name: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["innerHTML"].split(">")[2]).trim(),
                        url: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"]).trim(),
                    },
                    commants_count: parseInt((commentsCounter).trim()),
                };
                if (item.querySelector(".post_image img") != undefined && item.querySelector(".post_image img") != null) {
                    data.post["thumbnail"] = item.querySelector(".post_image img")["src"];
                }
                result.subjects.push(data)
                if (i + 1 == elements.length) {
                    callback(null, result);
                    req.abort();
                }
            }
        });
        return this;
    }

    public profile(userId: string, searchIn: string | null, callback: (err: Error, results: Array < JSON > ) => any): io {
        var req = this.request({
            url: `https://io.hsoub.com/u/${userId}${searchIn != null ? "/" + searchIn : ""}`,
            method: "get",
        }, (err, res) => {
            if (err) {
                callback(err, null);
            }
            var document = this.Document(res.body);
            if (document.querySelector(".errorBox")){
              callback(new Error("404"),null);
              return;
            }
            var elements: NodeList = document.body.querySelector(".itemsList").querySelectorAll(".listItem"),
                result: JSON | any = {
                    id: userId,
                    user: (<string>document.querySelector(".username").innerHTML).trim(),
                    name: (<string>document.querySelector(".full_name").innerHTML).trim(),
                    avatar: (<string>document.querySelector(".profileImg img")["src"]).trim(),
                    description: (<string>document.querySelector(".profileDesc p").innerHTML).trim(),
                    points: (<string>document.querySelectorAll(".infoBlocks .contBlock")[0].querySelector("b").innerHTML).trim(),
                    register_date: new Date(((<string>document.querySelectorAll(".infoBlocks .contBlock")[1].querySelector("b").innerHTML).trim()).split("/").reverse().join("-")),
                    last_enter: document.querySelectorAll(".infoBlocks .contBlock")[2] ? (<string>document.querySelectorAll(".infoBlocks .contBlock")[2].querySelector("b").innerHTML).trim() : undefined,
                    results: []
                };
            if (elements.length == 0) {
                callback(null, result);
                req.abort();
            }
            for (let i = 0; i < elements.length; i++) {
                var item: HTMLAnchorElement = <HTMLAnchorElement>elements[i],
                    data;
                if (searchIn == "comments") {
                    data = {
                        post: {
                            id: parseInt((<string>decodeURIComponent(item.querySelector(".comment_post")["href"])).trim().match(/(\d+[0-9]\-)/g)[0].replace("-", "")),
                            title: (<string>item.querySelector(".comment_post").innerHTML.split("\n")[2]).trim(),
                            url: (<string>item.querySelector(".comment_post")["href"]).trim()
                        },
                        comment: {
                            id: parseInt(item.id.replace("comment-", "")),
                            comment: (<string>item.querySelector(".post-title a").innerHTML).trim(),
                            url: (<string>item.querySelector(".post-title a")["href"]).trim()
                        },
                        user: {
                            id: userId,
                            user: (<string>document.querySelector(".username").innerHTML).trim(),
                            name: (<string>document.querySelector(".full_name").innerHTML).trim(),
                            avatar: (<string>document.querySelector(".pull-right img")["src"]).trim(),
                            url: "/u/" + userId,
                        },
                        community: {
                            id: (<string>item.querySelector(".post_community")["href"].replace("/", "")).trim(),
                            name: (<string>item.querySelector(".post_community")["innerHTML"].split(">")[2]).trim(),
                            url: (<string>item.querySelector(".post_community")["href"]).trim()
                        },
                    };
                } else {
                    var username: any =<string>item.querySelector(".usr26 img")["alt"];
                    var commentsCounter =<string>item.querySelector(".commentsCounter")["innerHTML"].split(">")[3]
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
                            likes: (<string>item.querySelector(".post_points").innerHTML).trim(),
                            title: (<string>item.querySelector(".postContent a").innerHTML).trim(),
                            url: (<string>item.querySelector(".postContent a")["href"]).trim()
                        },
                        user: {
                            id: decodeURIComponent((<string>item.querySelector(".usr26")["href"].replace("/u/", ""))).trim(),
                            user: (<string>document.querySelector(".username").innerHTML).trim(),
                            name: (<string>document.querySelector(".full_name").innerHTML).trim(),
                            avatar: (<string>item.querySelector(".usr26 img")["src"]).trim(),
                            url: (<string>item.querySelector(".usr26")["href"]).trim(),
                        },
                        community: {
                            id: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].replace("/", "")).trim(),
                            name: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["innerHTML"].split(">")[2]).trim(),
                            url: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"]).trim(),
                        },
                        commants_count: parseInt((commentsCounter).trim()),
                    };
                    if (item.querySelector(".post_image img") != undefined && item.querySelector(".post_image img") != null) {
                        data.post["thumbnail"] = item.querySelector(".post_image img")["src"];
                    }
                }
                result.results.push(data)
                if (i + 1 == elements.length) {
                    callback(null, result);
                    req.abort();
                }
            }
        });
        return this;
    }

    public post(postId: number, callback: (err: Error, results: postData) => any):io{
      var req = this.request({
          url: `https://io.hsoub.com/go/${postId}`,
          method: "get",
      }, (err, res) => {
          if (err) {
              callback(err,null);
          }
          var document = this.Document(res.body);
          var elements: NodeList = document.body.querySelector("#post-comments").querySelectorAll(".comment"),
              result: JSON| any = {
                post: {
                  id: postId,
                  title: (<string>document.querySelector("#post_details .articleTitle a").innerHTML).trim(),
                  content: (<string>document.querySelector("#post_details .post_content").innerHTML),
                  points: (<string>document.querySelector("#post_details .post_points").innerHTML).trim(),
                  likes: (<string>document.querySelectorAll("#post_details .pointsDetails a")[0].innerHTML).trim(),
                  dislikes: (<string>document.querySelectorAll("#post_details .pointsDetails a")[1].innerHTML).trim(),
                  url: `https://io.hsoub.com/go/${postId}`
                },
                user: {
                  id: decodeURIComponent((<string>document.querySelector("#post_details .usr26")["href"].replace("/u/", ""))).trim(),
                  user: (<string>document.querySelector("#post_details .usr26 .postUsername").innerHTML).trim(),
                  avatar: (<string>document.querySelector("#post_details .usr26 img")["src"]).trim(),
                  url: (<string>document.querySelector("#post_details .usr26")["href"]).trim(),
                },
                community: {
                  id: (<string>document.querySelector(".shared_side_bar .blockW div")["id"]).trim(),
                  name: (<string>document.querySelector(".shared_side_bar h2").innerHTML).trim(),
                  description: (<string>document.querySelector(".shared_side_bar .community-desc").innerHTML),
                  url: (<string>"/" + document.querySelector(".shared_side_bar .blockW div")["id"] ).trim(),
                },
                comments:[]
              };
          if (elements.length == 0) {
              callback(null, result);
              req.abort();
          }
          console.log(elements.length);
          for (let i = 0; i < elements.length; i++) {
              var item: HTMLAnchorElement = <HTMLAnchorElement>elements[i],
                  data;
                  if(true){
                    data = {
                      user:{
                        id: (<string>item.querySelector("a.usr26")["href"]).replace("/u/","").trim(),
                        user: (<string>item.querySelector(".postUsername").innerHTML).trim(),
                        avatar: (<string>item.querySelector("img")["src"]).trim(),
                        url: (<string>item.querySelector("a.usr26")["href"]).trim(),
                      },
                      comment:{
                        content: <string>item.querySelector(".commentContent").innerHTML,
                        vote: (< number > parseInt((<string>item.querySelector(".post_points").innerHTML).trim())),
                        date: (<string>item.querySelectorAll(".pull-right span")[1].innerHTML.split("</i>")[1]).trim()
                      },
                      comments:[]
                    };
                    result.comments.push(data)
                  }
              if (i + 1 == elements.length) {
                  callback(null,result);
                  req.abort();
              }
          }
      });
      return this;
    }

    // public comment(commentId, callback: (err: Error, results: JSON) => any):io{
    //
    //   return this;
    // }
}
