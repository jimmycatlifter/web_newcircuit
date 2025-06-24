const { Pool } = require("pg");

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,

//   port: process.env.DB_PORT,
// });

const pool = new Pool({
  user: "carlamissiona",
  host: "ep-round-moon-a1obo7oq-pooler.ap-southeast-1.aws.neon.tech",
  database: "hvneon",
  password: "yhxjpBia4MA6",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

//postgresql://carlamissiona:yhxjpBia4MA6@ep-round-moon-a1obo7oq-pooler.ap-southeast-1.aws.neon.tech/hvneon?sslmode=require

// User CRUD Operations
const createUserDB = async (userData) => {
  const { name, email, hpassword, role = "user" } = userData;
  const query = `
    INSERT INTO nc_users (nc_details_user, nc_email,  nc_password, created_at) 
    VALUES ($1, $2, $3, NOW())
    RETURNING id,  created_at
  `;

  const details = `{ "Name": "${name}", "Role": "${role}" }`;
  const values = [details, email, hpassword];

  try {
    const result = await pool.query(query, values);
    console.log("DB results ");
    console.log(result);

    return result.rows[0];
  } catch (error) {
    console.log("error");
    console.log(error);
    throw new Error(`Error creating user: ${error.message}`);
  }
};

const postArticle = async (postData) => {
  /* any posted article will be first draft for misinformation its button will be labeled saved */
  /* once saved then add rows to nclogs and nc_content */
  const { content, userid, draft_status, details, descrip } = postData;
  console.log("post micro user @@ postArticle");
  console.log(content);
  console.log(userid);

  const query = `
    INSERT INTO nc_articles(nc_subswriter, nc_content, nc_isdraft, nc_details_article, desciption, nc_date_created) 
    VALUES ($1, $2, $3, $4, $5 NOW())
    RETURNING *
  `;

  const values = [userid, content, draft_status, details, descrip];

  try {
    const result = await pool.query(query, values);
    console.log(" DB results Post Article ID THE ART ID= ");
    console.log(result.rows[0].id);
    const artid = result.rows[0].id;
    // getting random procesor assigned
    const randnm = Math.floor(Math.random() * 2) + 1;
    const processor = ["process-a", "process-b"][randnm - 1];
    console.log("======processor=======");
    console.log(processor);

    if (result.rows.length > 0) {
      const query = `
          INSERT INTO nc_process_logs(status, articleid, processor,  nc_date_created)
          VALUES ($1, $2, $3, NOW())
          RETURNING *
       `;

      const values = ["DRAFT_START", artid, processor];

      try {
        console.log("========insert nc logs========== ID here = ");
        console.log("========insert nc logs========== ID here = ");
        const result = await pool.query(query, values);
        console.log(result.rows[0].id);
        const plid = result.rows[0].id;
        if (result.rows.length > 0) {
          const query = `
              INSERT INTO nc_processed_content(content, plid, nc_date_created)
              VALUES ($1, $2,  NOW())
              RETURNING *
          `;
          try {
            const result = await pool.query(query, [content, plid]);
          } catch (error) {
            console.log("Error in add process content after publishing");
            console.log(error);
          }
        }
      } catch (error) {
        console.log("Error in adding nc logs and nc content ");
        console.log(error);
      }

      return result.rows[0];
    }
  } catch (error) {
    console.log("error postArticle");
    console.log(error);
    throw new Error(`Error creating microblog: ${error.message}`);
  }
};

const postMicro = async (postData) => {
  const { message, user } = postData;
  console.log("post micro user");
  console.log(message);
  console.log(user);
  const query = `
    INSERT INTO nc_textbased(nc_user, nc_blog, nc_date_created) 
    VALUES ($1, $2, NOW())
    RETURNING *
  `;

  const values = [user, message];

  try {
    const result = await pool.query(query, values);
    // console.log(" DB results ");
    // console.log(result);
    return result.rows[0];
  } catch (error) {
    console.log("error");
    console.log(error);
    throw new Error(`Error creating microblog: ${error.message}`);
  }
};

const postUsersubs = async (post_data) => {
  const { email, val } = post_data;
  const query =
    "UPDATE nc_users SET nc_subs = COALESCE(nc_subs, '') || ',' || $1 WHERE nc_email = $2 RETURNING *;";
  const values = [val, email];

  try {
    const result2 = await pool.query(query, values);
  } catch (error) {
    console.log("Error @subs db", error);
    throw new Error(`Error creating subs: ${error.message}`);
  }

  console.log("id");

  // try {  const result2 = await pool.query(query, values);
  // const update = `
  //   UPDATE nc_user
  //   SET nc_subs = COALESCE(nc_subs, '') || ', ' || $2
  //   WHERE nc_email = $1
  //   RETURNING *;

  // `;
};

const postUserfriends = async (post_data) => {
  const { fremail, val } = post_data;
  const query =
    "UPDATE nc_users SET nc_friends = COALESCE(nc_friends, '') || ',' || $1 WHERE nc_email = $2 RETURNING *;";
  const values = [val, fremail];

  try {
    const result = await pool.query(query, values);
    console.log("result");
    console.log(result);
  } catch (error) {
    console.log("Error @subs db", error);
    throw new Error(`Error creating subs: ${error.message}`);
  }

  console.log("id");

  // try {  const result2 = await pool.query(query, values);
  // const update = `
  //   UPDATE nc_user
  //   SET nc_subs = COALESCE(nc_subs, '') || ', ' || $2
  //   WHERE nc_email = $1
  //   RETURNING *;

  // `;
};

const getUserByEmailDB = async (email) => {
  // console.log("@ getUserByEmailDB");
  const query = "SELECT * FROM nc_users WHERE nc_email = $1";

  try {
    const result = await pool.query(query, [email]);
    console.log("getUserByEmailDB");
    // console.log(result);
    return result.rows[0];
  } catch (error) {
    // console.log("error");
    console.log(error);
    throw new Error(`Error getting user by email: ${error.message}`);
  }
};

const getUserSubsByEmail = async (email) => {
  console.log("@ get articles articles");
  const query =
    "SELECT      a.*,      u.nc_email  FROM      nc_articles a JOIN (     SELECT          (unnest(string_to_array(nc_subs, ',')))::bigint AS subwriter_id     FROM          nc_users     WHERE          nc_email = $1 ) AS sub_ids      ON a.nc_subswriter = sub_ids.subwriter_id JOIN nc_users u      ON a.nc_subswriter = u.id; ";

  try {
    const result = await pool.query(query, [email]);

    console.log("result.rows[0]");
    console.log(result.rows.length);
    return result.rows;
  } catch (error) {
    console.log("error");
    console.log(error);
    throw new Error(`Error getting user  subs by email: ${error.message}`);
  }
};

const gefriendsById = async (id) => {
  const query =
    "SELECT nc_email as user_email, nc_friends as user_friends FROM nc_users WHERE id = $1";

  try {
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error(`Error getting friends by id: ${error.message}`);
  }
};

const getUserByIdDB = async (id) => {
  const query = "SELECT * FROM nc_users WHERE id = $1";

  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error getting user by id: ${error.message}`);
  }
};

const updateUserDB = async (id, userData) => {
  const { name, email, password, role } = userData;
  const updates = [];
  const values = [];
  let valueCount = 1;

  if (name) {
    updates.push(`name = $${valueCount}`);
    values.push(name);
    valueCount++;
  }
  if (email) {
    updates.push(`email = $${valueCount}`);
    values.push(email);
    valueCount++;
  }
  if (password) {
    updates.push(`password = $${valueCount}`);
    values.push(password);
    valueCount++;
  }
  if (role) {
    updates.push(`role = $${valueCount}`);
    values.push(role);
    valueCount++;
  }

  values.push(id);
  const query = `
    UPDATE nc_users 
    SET ${updates.join(", ")}, updated_at = NOW()
    WHERE id = $${valueCount}
    RETURNING id, name, email, role, created_at, updated_at
  `;

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
};

const deleteUserDB = async (id) => {
  const query = "DELETE FROM nc_users WHERE id = $1 RETURNING *";

  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};

const getSearchedchannels = async (data) => {
  const { searched } = data;
  let search = `'%Channel%:%${searched}%'`;

  const query = "SELECT * FROM nc_users WHERE nc_details_user ilike " + search;

  try {
    const result = await pool.query(query, []);

    return result.rows;
  } catch (error) {
    console.log("error");
    console.log(error);
    throw new Error(`Error getting search results: ${error.message}`);
  }
};



const update_prev_content_vdraft = async (data) => {


  const { content, plid, model, prev, length_llm } = data;

  let model_occur = "2025v New Circuit Model: " + model;

  console.log("if(prev.split(model_occur).length > 0  ){");

  // console.log(prev);
  // console.log("prev.split(model_occur).length  =");
  // console.log(prev.split(model_occur).length);

  // console.log("model_occur length_llm =");
  // console.log(model_occur, length_llm);
  // console.log("prev.length");
  // console.log(prev.length);
  // console.log("prev.split(model_occur).length=");
  // console.log(prev.split(model_occur).length);

  // console.log("prev.indeOf(++++++++model_occur)++++++++++");
  // console.log("prev.indeOf(model_occur)");
  // console.log(prev.indexOf(model_occur));
  // console.log("prev.split(model_occur).length > 0 =");
  // console.log(prev.split(model_occur).length > 0);

  if (prev.indexOf(model_occur) > 0 && prev.length > 0) {
    return null;
    // return null for cancel of update since the model is saved previously
  }

  /**  db insert but */
  let newcontent = `\n\n`;
  newcontent = newcontent + `\n2025v New Circuit Model: ` + model + `\n------------------\n`;
  newcontent = newcontent + content;
  newcontent = prev + newcontent;
  console.log("------------------new line content--------------------------------");
  console.log("------------------new line content--------------------------------");
  // console.log(newcontent);
  console.log("+++++++++-newcontent++++++++++++++");
  console.log(newcontent);
  const query = `UPDATE nc_processed_content
        SET results_2 = $1 WHERE plid = $2
        RETURNING *
       `;

  try {
    const result = await pool.query(query, [newcontent, plid]);
    // console.log("DB results push drafts");
    // console.log("DB results push drafts");
    console.log("++++++++++++DB results push drafts+++++++++++++++++++");
    console.log("++++++++++++DB results push drafts+++++++++++++++++++");
    console.log("++++++++++++DB results push drafts+++++++++++++++++++");
    console.log("result.rows[0]");
    console.log(result.rows[0].results);

    if (result.rows.length > 0) {
      if (!(length_llm < 3) || length_llm >= 3) {
          const query_nclogs = `UPDATE nc_process_logs
                      SET status = $1 WHERE id = $2
                      RETURNING *
                    `;

          try {
              const result = await pool.query(query_nclogs, ["DRAFT_VERIFY", plid]);

              console.log("Update status DRAFT_VERIFY result.rows[0]");

              if (result.rows.length > 0) {
                console.log("Update status DRAFT_VERIFY ok!!! ");
                return true;
              } /* << if theres result return true */

          } catch (err) {
              console.log("Error in update status to draft_verify ");

              throw new Error(`Error in update status to draft_verify Server Error "${error.message}"`);    

          }

          console.log("close here after success update if rows has 1 ");
          console.log("close here after success update if rows has 1 ");
          console.log("close here after success update if rows has 1 ");
          console.log("close here after success update if rows has 1 ");
      }

      return result.rows[0];
    }
  } catch (error) {
    console.log("error");
    console.log(error);
    console.log(`Error updating content processed: ${error.message}`);
    return "Error";
  }
};


const update_prev_content = async (data) => {
  

  const { content, plid, model, prev, length_llm } = data;

  let model_occur = "2025v New Circuit Model: " + model;

  console.log("if(prev.split(model_occur).length > 0  ){");

  // console.log(prev);
  // console.log("prev.split(model_occur).length  =");
  // console.log(prev.split(model_occur).length);

  // console.log("model_occur length_llm =");
  // console.log(model_occur, length_llm);
  // console.log("prev.length");
  // console.log(prev.length);
  // console.log("prev.split(model_occur).length=");
  // console.log(prev.split(model_occur).length);

  // console.log("prev.indeOf(++++++++model_occur)++++++++++");
  // console.log("prev.indeOf(model_occur)");
  // console.log(prev.indexOf(model_occur));
  // console.log("prev.split(model_occur).length > 0 =");
  // console.log(prev.split(model_occur).length > 0);

  if (prev.indexOf(model_occur) > 0 && prev.length > 0) {
    return null;
    // return null for cancel of update since the model is saved previously
  }

  /**  db insert but */
  let newcontent = `\n\n`;
  newcontent = newcontent + `\n2025v New Circuit Model: ` + model + `\n------------------\n`;
  newcontent = newcontent + content;
  newcontent = prev + newcontent;
  console.log("------------------new line content--------------------------------");
  console.log("------------------new line content--------------------------------");
  // console.log(newcontent);
  console.log("+++++++++-newcontent++++++++++++++");
  console.log(newcontent);
  const query = `UPDATE nc_processed_content
        SET results = $1 WHERE plid = $2
        RETURNING *
       `;

  try {
    const result = await pool.query(query, [newcontent, plid]);
    // console.log("DB results push drafts");
    // console.log("DB results push drafts");
    console.log("++++++++++++DB results push drafts+++++++++++++++++++");
    console.log("++++++++++++DB results push drafts+++++++++++++++++++");
    console.log("++++++++++++DB results push drafts+++++++++++++++++++");
    console.log("result.rows[0]");
    console.log(result.rows[0].results);

    if (result.rows.length > 0) {
      if (!(length_llm < 3) || length_llm >= 3) {
          const query_nclogs = `UPDATE nc_process_logs
                      SET status = $1 WHERE id = $2
                      RETURNING *
                    `;

          try {
              const result = await pool.query(query_nclogs, ["DRAFT_VERIFY", plid]);

              console.log("Update status DRAFT_VERIFY result.rows[0]");

              if (result.rows.length > 0) {
                console.log("Update status DRAFT_VERIFY ok!!! ");
                return true;
              } /* << if theres result return true */

          } catch (err) {
              console.log("Error in update status to draft_verify ");

              throw new Error(`Error in update status to draft_verify Server Error "${error.message}"`);    
            
          }

          console.log("close here after success update if rows has 1 ");
          console.log("close here after success update if rows has 1 ");
          console.log("close here after success update if rows has 1 ");
          console.log("close here after success update if rows has 1 ");
      }

      return result.rows[0];
    }
  } catch (error) {
    console.log("error");
    console.log(error);
    console.log(`Error updating content processed: ${error.message}`);
    return "Error";
  }
};

const getVerificDr = async () => {
  const query = "Select nc.*, pl.* from nc_processed_content nc, nc_process_logs pl  where pl.id in (select id from nc_process_logs where processor ='process-a') and pl.status = 'DRAFT_VERIFY' and nc.plid in (select id from nc_process_logs where processor ='process-a') limit 1";

  try {
    const result = await pool.query(query);
    console.log(" @get DRAFTS result.rows[0].results ");
    
    if (result.rows.length > 0) {
      console.log(result.rows[0].results);

      return result.rows;
    } else {
      // return null;
      console.log("NONE 4 PROCESS_A ");
      throw new Error(`Nothing to process for this processor`);
    }
  } catch (error) {
    console.log("error get drafts");
    console.log(error);
    throw new Error(`Nothing to process for this processor`);
  }
};



const getDrafts = async () => {
  const query =
    " select nc.*, pl.*  from  nc_processed_content nc , nc_process_logs pl  where pl.id in (select id from nc_process_logs where processor ='process-a') and pl.status = 'DRAFT_START' and nc.plid in (select id from nc_process_logs where processor ='process-a') limit 1";

  //select nc.*, pl.*  from  nc_processed_content nc , nc_process_logs pl  where pl.id in (select id from nc_process_logs where processor ='process-a') and pl.status = 'DRAFT_START' and nc.plid in (select id from nc_process_logs where processor ='process-a') limit 1";

  try {
    const result = await pool.query(query);

    console.log(" @get DRAFTS result.rows[0].results ");
    if (result.rows.length > 0) {
      console.log(result.rows[0].results);

      return result.rows;
    } else {
      // return null;
      console.log("NONE 4 PROCESS_A ");
      throw new Error(`Nothing to process for this processor`);
    }
  } catch (error) {
    console.log("error get drafts");
    console.log(error);
    throw new Error(`Nothing to process for this processor`);
  }
};

const pushDraftsinfo = async (data) => {
  const { content, plid, model } = data;

  /**Get the row to be updated s prev value first */
  const query_prev = "Select *  from  nc_processed_content where plid = $1  ";
  //select nc.*, pl.*  from  nc_processed_content nc , nc_process_logs pl  where pl.id in (select id from nc_process_logs where processor ='process-a') and pl.status = 'DRAFT_START' and nc.plid in (select id from nc_process_logs where processor ='process-a') limit 1";

  /** length_llm is about the checking of existing llm on the prev content so we dont need to update  */
  let prev = null;
  let length_llm = 0;

  try {
    const prev_content = await pool.query(query_prev, [plid]);

    console.log(" @@drafts SELECT process_content   ");
    console.log(  "==================prev_content.rows[0] after selecting previous content ========================" );
    console.log(prev_content.rows[0].results);

    prev = prev_content.rows[0].results;
  } catch (error) {
    console.log("error get drafts");
    console.log(error);
    // return something and abort
  }
  /**prev null check is ok */
  if (prev == null) {
    console.log("+++++++prev is null++++++++++++++++++++");
    console.log("+++++++prev is null++++++++++++++++++++");
    console.log("prev");
    console.log(prev);
    prev = "";
  } else {
    length_llm =
      prev.split("------------------").length -     1; /** we need to split to get the llm exisiting on prev*/
    console.log(    "-----------------------how many llm delimiter length llm ----------------------------"  );
    console.log(
      "-----------------------how many llm delimiter length llm ----------------------------"
    );

    console.log(model);
    console.log(length_llm);

    /* we are reading the prev by llm = what is the prev delimiters >> put it on console or */
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(prev.split("------------------")[0]);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>");

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(prev.split("------------------")[1]);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>");
  }
  /* If theres still no llm delimiter  or less llm then update */
  if (length_llm < 3) {
    // usince length_llm is < 3 proceed with update
    // also add if the llm is included in prev dont proceed
    console.log("newupdate 2 length_llm < 3  newupdate 2 length_llm < 3 =");
    console.log(length_llm);
    let newupdate = await update_prev_content({
      prev,
      content,
      plid,
      model,
      length_llm,
    }).then((value) => {
      console.log("new update");
      console.log(value);

      if (value !== null) {
        /* checks if there is an updated string returned [updated meaning new string] */
        return true;
      } else {
        /* If  model occured in prev */
        return "Skip!";
      }
    });

    console.log("awaited newupdate");
    console.log("awaited newupdate");
    console.log("awaited newupdate");
    console.log("awaited newupdate");
    console.log("========awaited newupdate=============");
    console.log(newupdate);
    console.log(typeof newupdate);

    console.log("======WHY THE newupdate.length > 0 false ========");
  } else {
    // close the batch work here
    console.log("index of mistral", prev.indexOf("mistralai/Mistral"));
    console.log("index of turbo", prev.indexOf("Instruct-Turbo"));
    console.log("index of scout", prev.indexOf("Llama-4-Scout"));

    const query = `UPDATE nc_process_logs
      SET status = $1 WHERE id = $2 and status = 'DRAFT_START'
      RETURNING *
    `;

    try {
      const result = await pool.query(query, ["DRAFT_VERIFY", plid]);
      console.log("@@ after update of status to draft_verify!");
      console.log(result.rows[0]);
    } catch (error) {
      console.log("Error in update of nc logs to DRAFT_VERIFY");
      console.log(error);
    }

    // if process logs updated status and
    console.log("close the batch work here");
    return "Error in updating processor many llm ";
  }
};


const pushVDraftsinfo = async (data) => {
  const { content, plid, model } = data;
console.log("++++++pushvdraftsinfo++++++");
console.log("++++++pushvdraftsinfo++++++");
  /**Get the row to be updated s prev value first */
  const query_prev = "Select *  from  nc_processed_content where plid = $1  ";
  //select nc.*, pl.*  from  nc_processed_content nc , nc_process_logs pl  where pl.id in (select id from nc_process_logs where processor ='process-a') and pl.status = 'DRAFT_START' and nc.plid in (select id from nc_process_logs where processor ='process-a') limit 1";

  /** length_llm is about the checking of existing llm on the prev content so we dont need to update  */
  let prev = null;
  let length_llm = 0;

  try {
    const prev_content = await pool.query(query_prev, [plid]);

    console.log(" @@drafts SELECT process_content   ");
    console.log(  "==================prev_content.rows[0] after selecting previous content ========================" );
    console.log(prev_content.rows[0].results);

    prev = prev_content.rows[0].results_2;
  } catch (error) {
    console.log("error get drafts");
    console.log(error);
    // return something and abort
  }
  /**prev null check is ok */
  if (prev == null) {
    console.log("+++++++prev is null++++++++++++++++++++");
    console.log("+++++++prev is null++++++++++++++++++++");
    console.log("prev");
    console.log(prev);
    prev = "";
  } else {
    length_llm =
      prev.split("------------------").length -     1; /** we need to split to get the llm exisiting on prev*/
    console.log(    "-----------------------how many llm delimiter length llm ----------------------------"  );
    console.log(
      "-----------------------how many llm delimiter length llm ----------------------------"
    );

    console.log(model);
    console.log(length_llm);

    /* we are reading the prev by llm = what is the prev delimiters >> put it on console or */
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(prev.split("------------------")[0]);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>");

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(prev.split("------------------")[1]);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>");
  }
  /* If theres still no llm delimiter  or less llm then update */
  if (length_llm < 3) {
    // usince length_llm is < 3 proceed with update
    // also add if the llm is included in prev dont proceed
    console.log("newupdate 2 length_llm < 3  newupdate 2 length_llm < 3 =");
    console.log(length_llm);
     let newupdate = await update_prev_content_vdraft({
      prev,
      content,
      plid,
      model,
      length_llm,
    }).then((value) => {
      console.log("new update");
      console.log(value);

      if (value !== null) {
        /* checks if there is an updated string returned [updated meaning new string] */
        return true;
      } else {
        /* If  model occured in prev */
        return "Skip!";
      }
    });

    console.log("awaited newupdate");
    console.log("awaited newupdate");
    console.log("awaited newupdate");
    console.log("awaited newupdate");
    console.log("========awaited newupdate=============");
    console.log(newupdate);
    console.log(typeof newupdate);

    console.log("======WHY THE newupdate.length > 0 false ========");
  } else {
    // close the batch work here
    console.log("index of mistral", prev.indexOf("mistralai/Mistral"));
    console.log("index of turbo", prev.indexOf("Instruct-Turbo"));
    console.log("index of scout", prev.indexOf("Llama-4-Scout"));

    const query = `UPDATE nc_process_logs
      SET status = $1 WHERE id = $2 and status = 'DRAFT_START'
      RETURNING *
    `;

    try {
      const result = await pool.query(query, ["DRAFT_VERIFY", plid]);
      console.log("@@ after update of status to draft_verify!");
      console.log(result.rows[0]);
    } catch (error) {
      console.log("Error in update of nc logs to DRAFT_VERIFY");
      console.log(error);
    }

    // if process logs updated status and
    console.log("close the batch work here");
    return "Error in updating processor many llm ";
  }
};


const getSearchedfriends = async (data) => {
  const { searched } = data;
  let search = `'%"Name"%:%${searched}%'`;

  // todo add another search for last name and firstname separately searched
  const query = "SELECT * FROM nc_users WHERE nc_details_user ilike " + search;

  try {
    const result = await pool.query(query, []);

    return result.rows;
  } catch (error) {
    console.log("error");
    console.log(error);
    throw new Error(`Error getting search results: ${error.message}`);
  }
};

module.exports = {
  pool,
  createUserDB,
  getUserByEmailDB,
  getUserByIdDB,
  gefriendsById,
  updateUserDB,
  deleteUserDB,
  postMicro,
  postUsersubs,
  postUserfriends,
  getUserSubsByEmail,
  getSearchedchannels,
  getSearchedfriends,
  postArticle,
  getDrafts,
  pushDraftsinfo,
  getVerificDr,
  pushVDraftsinfo,
};
