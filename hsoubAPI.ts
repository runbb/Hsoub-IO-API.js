declare var require;
import request = require("request");
var Document = require("jsdom").jsdom;
export class hsoub{
  constructor(private username: string,private password: string){

  }
  public search(keywords: Array<string>,callback : (results:Array<JSON>) => any): Boolean{
    var search:string = keywords.join(" ");
    var req = request({
      url : `https://io.hsoub.com/search?utf8=${encodeURIComponent("✓")}&s=${encodeURIComponent(search)}`,
      method: "get",
    },(err,res)=>{
      if (err){
        throw Error("Network Error");
      }
      var document = Document(res.body);
      var elements: NodeList = document.body.querySelector("#search-result-popular").querySelectorAll(".listItem"),
      result : Array<JSON> = [];
      for (let i = 0; i < elements.length; i++) {
          var item :HTMLAnchorElement = <HTMLAnchorElement>elements[i],
          username :String = <string>item.querySelector(".usr26 img")["alt"],
          data, commentsCounter = <string>item.querySelector(".commentsCounter")["innerHTML"].split(">")[3]
            .replace("تعليق واحد","1")
            .replace("تعليقان","2")
            .replace("تعليقات","")
            .replace("ناقِش","0")
            .replace("تعليق","")
            .replace("</a","");
          if(username.match(/\<br \>/g)){
            username = username.split("<br >")[1];
          }
          data = {
            post_id: parseInt(item.id.replace("post-","")),
            post_vote: (<string>item.querySelector(".post_points").innerHTML).trim(),
            post_title: (<string>item.querySelector(".postContent a").innerHTML).trim(),
            post_url: (<string>item.querySelector(".postContent a")["href"]).trim(),
            user: (<string>item.querySelector(".usr26")["href"].replace("/u/","")).trim(),
            user_name: username.trim(),
            user_image: (<string>item.querySelector(".usr26 img")["src"]).trim(),
            user_url: (<string>item.querySelector(".usr26")["href"]).trim(),
            community: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].replace("/","")).trim(),
            community_name: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["innerHTML"].split(">")[2]).trim(),
            community_url: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"]).trim(),
            commants_count: parseInt((commentsCounter).trim()),
          };
          if(item.querySelector(".post_image img") != undefined && item.querySelector(".post_image img") != null){
            data["post_thumbnail"] = item.querySelector(".post_image img")["src"];
          }
          result.push(data)
          if(i+1 == elements.length){
            callback(result);
            req.abort();
          }
      }
    });
    return true;
  }

  public community(communityId : string, callback : (results:Array<JSON>) => any): boolean{
    var req = request({
      url : `https://io.hsoub.com/${communityId}`,
      method: "get",
    },(err,res)=>{
      if (err){
        throw Error("Network Error");
      }
      var document = Document(res.body);
      var elements: NodeList = document.body.querySelector(".itemsList").querySelectorAll(".listItem"),
      result : Array<JSON> = [];
      for (let i = 0; i < elements.length; i++) {
          var item :HTMLAnchorElement = <HTMLAnchorElement>elements[i],
          username :String = <string>item.querySelector(".usr26 img")["alt"],
          data, commentsCounter = <string>item.querySelector(".commentsCounter")["innerHTML"].split(">")[3]
            .replace("تعليق واحد","1")
            .replace("تعليقان","2")
            .replace("تعليقات","")
            .replace("ناقِش","0")
            .replace("تعليق","")
            .replace("</a","");
          if(username.match(/\<br \>/g)){
            username = username.split("<br >")[1];
          }
          data = {
            post_id: parseInt(item.id.replace("post-","")),
            post_vote: (<string>item.querySelector(".post_points").innerHTML).trim(),
            post_title: (<string>item.querySelector(".postContent a").innerHTML).trim(),
            post_url: (<string>item.querySelector(".postContent a")["href"]).trim(),
            user: (<string>item.querySelector(".usr26")["href"].replace("/u/","")).trim(),
            user_name: username.trim(),
            user_image: (<string>item.querySelector(".usr26 img")["src"]).trim(),
            user_url: (<string>item.querySelector(".usr26")["href"]).trim(),
            community: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].replace("/","")).trim(),
            community_name: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["innerHTML"].split(">")[2]).trim(),
            community_url: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"]).trim(),
            commants_count: parseInt((commentsCounter).trim()),
          };
          if(item.querySelector(".post_image img") != undefined && item.querySelector(".post_image img") != null){
            data["post_thumbnail"] = item.querySelector(".post_image img")["src"];
          }
          result.push(data)
          if(i+1 == elements.length){
            callback(result);
            req.abort();
          }
      }
    });
    return true;
  }

  public user(userId : string, searchIn : string | null, callback : (results:Array<JSON>) => any): boolean{
    var req = request({
      url : `https://io.hsoub.com/u/${userId}${searchIn != null ? "/"+searchIn : ""}`,
      method: "get",
    },(err,res)=>{
      if (err){
        throw Error("Network Error");
      }
      var document = Document(res.body);
      var elements: NodeList = document.body.querySelector(".itemsList").querySelectorAll(".listItem"),
      result : Array<JSON> = [];
      for (let i = 0; i < elements.length; i++) {
          var item :HTMLAnchorElement = <HTMLAnchorElement>elements[i],
          data;
          if(searchIn == "comments"){
            data = {
              post_title: (<string>item.querySelector(".comment_post").innerHTML.split("\n")[2]).trim(),
              post_url: (<string>item.querySelector(".comment_post")["href"]).trim(),
              comment: (<string>item.querySelector(".post-title a").innerHTML).trim(),
              comment_id: parseInt(item.id.replace("comment-","")),
              comment_url: (<string>item.querySelector(".post-title a")["href"]).trim(),
              user: userId,
              community: (<string>item.querySelector(".post_community")["href"].replace("/","")).trim(),
              community_name: (<string>item.querySelector(".post_community")["innerHTML"].split(">")[2]).trim(),
              community_url: (<string>item.querySelector(".post_community")["href"]).trim()
            };
          }else{
            var username :String = <string>item.querySelector(".usr26 img")["alt"];
            var commentsCounter = <string>item.querySelector(".commentsCounter")["innerHTML"].split(">")[3]
              .replace("تعليق واحد","1")
              .replace("تعليقان","2")
              .replace("تعليقات","")
              .replace("ناقِش","0")
              .replace("تعليق","")
              .replace("</a","");
            if(username.match(/\<br \>/g)){
              username = username.split("<br >")[1];
            }
            data = {
              post_id: parseInt(item.id.replace("post-","")),
              post_vote: (<string>item.querySelector(".post_points").innerHTML).trim(),
              post_title: (<string>item.querySelector(".postContent a").innerHTML).trim(),
              post_url: (<string>item.querySelector(".postContent a")["href"]).trim(),
              user: (<string>item.querySelector(".usr26")["href"].replace("/u/","")).trim(),
              user_name: username.trim(),
              user_image: (<string>item.querySelector(".usr26 img")["src"]).trim(),
              user_url: (<string>item.querySelector(".usr26")["href"]).trim(),
              community: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"].replace("/","")).trim(),
              community_name: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["innerHTML"].split(">")[2]).trim(),
              community_url: (<string>item.querySelectorAll(".pull-right .lightBoxUserLnk")[1]["href"]).trim(),
              commants_count: parseInt((commentsCounter).trim()),
            };
            if(item.querySelector(".post_image img") != undefined && item.querySelector(".post_image img") != null){
              data["post_thumbnail"] = item.querySelector(".post_image img")["src"];
            }
          }
          result.push(data)
          if(i+1 == elements.length){
            callback(result);
            req.abort();
          }
      }
    });
    return true;
  }
}

(new hsoub("!","!")).user("xlmnxp","posts",(results)=>{
  console.log(results);
});
