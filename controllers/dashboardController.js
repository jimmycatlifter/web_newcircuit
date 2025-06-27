// Import database functions for future use
const {
  getUserByEmailDB,
  getSearchedfriends,
  getSearchedchannels,
  postUserfriends,
  createUserDB,
  getUserSubsByEmail,
  postUsersubs,
  postMicro,
  postArticle,
  getDrafts,
} = require("../db");

const root =
  "https://3001-carlamission-newcircuit-d8ou6v00znw.ws-eu120.gitpod.io/";

// Show dashboard page
const showDashboard = (req, res) => {
  // Dashboard data for the authenticated user
  const dashboardData = {
    stats: {
      projects: 12,
      tasks: 48,
      completed: 32,
      pending: 16,
    },
    recentActivity: [
      {
        action: "Completed task",
        item: "Design homepaaaage",
        time: "2 hours ago",
      },
      {
        action: "Added new task",
        item: "Implement login page",
        time: "4 hours ago",
      },
      {
        action: "Updated project",
        item: "Client website redesign",
        time: "1 day ago",
      },
      {
        action: "Joined project",
        item: "Mobile app development",
        time: "3 days ago",
      },
    ],
  };

  res.render("dashboard", {
    title: "Dashboard",
    user: req.user,
    data: dashboardData,
  });
};

const rendrHome = async (req, res) => {
  // get 5 notification history from 7 days ago
  let subs = null;
  let artcls = [];
  let email = req.user;
  // console.log(email);
  let user = await getUserSubsByEmail(email).then((value) => {
    // TODO : details may be invalid JSON

    console.log("=value>>>>>>");
    console.log(value.length);

    if (value.length > 0) {
      for (let i = 0; i < value.length; i++) {
        let { title, published, url } = JSON.parse(value[i].nc_details_article);
        const desc = value[i].nc_description;
        const ar = { published, title, desc, url };
        console.log("article desc here++++++++++++++++++");

        console.log(ar);     
        artcls.push(ar);

        console.log("ti===", title);
      }

      console.log(">>>>>> How >>");
      console.log(typeof artcles);
      // console.log(value[0]);
      // console.log(JSON.stringify(value[0]));
      console.log("value");
       
      
    }
 
  });

  console.log("user subs==");
  res.render("home", {
    title: "Express Auth App",
    useremail: req.user,
    userinfo: req.userinfo,
    subitems: artcls,
  });
};

const post_microblog = async (req, res) => {
  console.log("POSTING POSTING ");

  const { message } = req.body;

  if (!message) {
    res.redirect("/app?error=Complete your posts. All fields are required.");
  }
  let user = null;
  const userob = await getUserByEmailDB(req.user).then((vl) => {
    console.log("email == @getUserByEmailDB ");
    user = vl.id;
  });

  try {
    const postingblog = await postMicro({ message, user }).then((vl) => {
      console.log("postingblog");
      console.log("<== blogging");
      res.redirect("/app?message=You have successfully posted a blog");
    });

    res.redirect("home");
  } catch (error) {
    console.log("Error!!", error);
    res.redirect("/app?error=Server error");
  }
};

// post submit publisher editor page post_publishercontent
const post_publishercontent = async (req, res) => {
  // TODO : CHECK IF THE REQUEST IS FROM CREATOR
  let is_publisher;

  const { content, title, descript, image_article, category_article } = req.body;
  console.log("channel ", req.user_ischannel);

  console.log("fn!!!!!================!!!!!!!!!!");
  console.log(req.userfullname);

  console.log("req.userinfo");
  console.log(req.userinfo);

  let userid = null;
  let categories = '{"tags": ["Lifestyle", "Street Children"]}';
  const nohtml_content = content.replace(/<[^>]*>/g, '');
  console.log("****************nohtml_content");  console.log(nohtml_content); // Output: Hello world!
 // Output: Hello world!


  console.log(typeof category_article );
  console.log("--------JSON.parse(categories)----------");
  console.log(JSON.parse(categories));
  console.log("--------JSON.parse(artcile categories)----------");
  console.log( {categories : category_article } );
  
  let draft_status = "DRAFT_START";

  console.log(req.userfullname);
  const timestamp = Date.now();
  const isoString = new Date(timestamp).toISOString();
  const hyurl = (title + " #").trim().split(/\s+/).join("-");
  console.log(hyurl);
  let details = `{
    "published": "${isoString}",
    "title": "${title}",
    "url" : "${hyurl}"
  }`;

  console.log("JSON.stringify(details) ============================== ");
  // console.log(JSON.stringify(details));

  const userob = await getUserByEmailDB(req.user).then((vl) => {
    console.log("email == @getUserByEmailDB ");
    userid = vl.id;
  });
console.log("====================================== CONTENT -------");
  console.log(content);
  try {
    const posting = await postArticle({
      content,
      userid,
      nohtml_content,
      draft_status,
      details,
      descript,
    }).then((vl) => {
      console.log("postingblog");
      console.log("<== blogging");
      console.log(vl);
      res.redirect("/editor?message=You have successfully posted a blog");
    });
  } catch (error) {
    console.log("Error!!", error);
    res.redirect("/editor?error=Server error");
  }
};

// get publisher editor page
const render_editor = async (req, res) => {
  let subs = null;
  let artcls = [];
  let email = req.user;
  let is_publisher;

  res.render("publisher_editor", {
    title: "Search Search",
    user: req.user,
  });
};

//publisher home
const render_publisher = async (req, res) => {
  let subs = null;
  let artcls = [];
  let email = req.user;
  let is_publisher;

  res.render("publisher_home", {
    title: "Creator's Home",
    user: req.user,
  });
};

// get page /search_page for
const get_search_page = async (req, res) => {};

const get_search = async (req, res) => {
  // get micro blog and render profile
  console.log("req.cookies................................");
  console.log(req.cookies);
  let data = "";

  if (typeof req.cookies.xdata1 === "undefined") {
    console.log("no cookie!");
    data = [];
  } else {
    console.log("req.cookies");
    data = req.cookies.xdata1 || "default";
    data = JSON.parse(data);
    console.log(data);
  }
  res.cookie("xdata1", null, { httpOnly: true });
  res.clearCookie("xdata1");

  console.log("x-data");
  console.log(data);
  res.render("search", {
    title: "Search Search",
    results: data,
    user: req.user,
  });
};

const post_search = async (req, res) => {
  const { searched } = req.body;
  let subs = [];
  let result = [];

  let friends = await getSearchedfriends({ searched }).then(async (value) => {
    subs = [];
    console.log("v!alue connection search");

    for (let i = 0; i < value.length; i++) {
      //todo : make the result contain name and email plus 40 chars desc
      console.log(value[i]);
      result.push(JSON.parse(value[i].nc_details_user));
      //if(){} filter channel name "Channel: - " to get people results to add to results.people
    }
  });

  console.log("result");
  console.log(result);
  res.setHeader("xdata", JSON.stringify(result));
  res.header("xdata2", JSON.stringify(result));
  res.cookie("xdata1", JSON.stringify(result));

  res.cookie("xdata1", JSON.stringify(result), { httpOnly: true });
  console.log("res.get(X-Data-Results)");
  console.log(res.get("xdata"));
  console.log(res.xdata);
  res.redirect("/search?messsage=Successfully subscribe!");

  //   results: result,
  // });
};

const get_frsearch = async (req, res) => {
  // get micro blog and render profile

  res.render("friends_search", { title: "Get Search", user: req.user });
};
const post_subs = async (req, res) => {
  let email = req.user;
  const { channel_email } = req.body;
  let val = null;
  const channel = await getUserByEmailDB(channel_email).then((vl) => {
    console.log("email == @post_subs ");
    console.log(vl.id);
    val = vl.id;
    // check here when the vl.id is undefined it means no email on db
  });

  if (!channel_email) {
    res.redirect("/app?error= Server error.Subscribing failed.");
  }

  try {
    const usersub = await postUsersubs({ email, val }).then((vl) => {
      console.log("email == @postUsersubs ");
      console.log(vl);
      // b4 redirect user searched in cookie chehcked (xdata)
      let data = req.headers.xdata || "default";
      console.log("data: \n ", data);
      if (typeof req.cookies.xdata1 === "undefined") {
        console.log("no cookie!");
        data = [];
      } else {
        console.log("req.cookies");
        data = req.cookies.xdata1 || "default";
        data = JSON.parse(data);
        console.log(data);
      }
      res.redirect("/search?messsage=Successfully subscribe!");
    });
  } catch (error) {
    console.log("Error!! usersub", error);
    res.redirect("/app?error=Server error");
  }

  res.render("search", { title: "Get Search", user: req.user });
}; // end post subs

const post_friends = async (req, res) => {
  let email = req.user;
  const { fremail } = req.body;
  let val = null;

  console.log("fremail");
  console.log(fremail);

  const channel = await getUserByEmailDB(fremail).then(async (vl) => {
    val = vl.id;
    // check here when the vl.id is undefined it means no email on db

    try {
      const userfr = await postUserfriends({ fremail, val }).then((vl) => {
        console.log(
          "email == @postUsersubs value should be undefined to redirect with success"
        );
        console.log(vl);

        res.redirect("/friends?messsage=Successfully subscribed!");
      });
    } catch (error) {
      console.log("Error!! usersub", error);
      res.redirect("/app?error=Server error");
    }
  });

  if (!fremail) {
    res.redirect("/app?error= Server error. Subscribing failed.");
  }
}; // end post

const draft_process = async (req, res) => {
  let user = null;
  let chk_db_artcl = null;
  //  ---- ------ proc a = get table row in proclogs  ------
  //  IF HAS 1 [thats oldest + get content table accdg to id

  try {
    const postingblog = await getDrafts().then((vl) => {
      // get variables
      console.log("vl===================================");
      console.log(vl);
    });

    res.redirect("home");
  } catch (error) {
    console.log("Error!!", error);
    res.redirect("/app?error=Server error");
  }
};

module.exports = {
  showDashboard,
  rendrHome,
  post_microblog,
  get_search,
  post_subs,
  get_frsearch,
  post_friends,
  post_search,
  render_publisher,
  post_publishercontent,
  render_editor,
  draft_process,
};
