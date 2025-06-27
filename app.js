const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const searchRoutes = require("./routes/searchRoutes");
const channelsRoutes = require("./routes/channelsRoutes");
const friendsRoutes = require("./routes/friendsRoutes");
const profileRoutes = require("./routes/profileRoutes");
const publisherRoutes = require("./routes/publisherRoutes");
const editorRoutes = require("./routes/editorRoutes");
const readRoutes = require("./routes/readRoutes");

const {
    getDrafts,
    pushDraftsinfo,
    getVerificDr2,
    pushV2Draftsinfo,
    getVerificDr,
    pushVDraftsinfo,
    getDraftsRes3,
    getContentHtml,
} = require("./db");

const app = express();

// kluster ai api key
const apiKey = "b96b0973-fa7c-4e93-82ba-8d253e3938c7";

async function fetch_kly1(idarticle, paragraph_art, modelname) {
    let returned_result = "";

    let model = "";
    if (modelname.indexOf('Mistral') > -1) {
        model = "Mistral-Small-24B"
    }
    if (modelname.indexOf('Turbo') > -1) {
        model = "Llama-3.1-8B";
    }
    if (modelname.indexOf('Scout') > -1) {
        model = "Llama-4-Scout-17B";
    }

    const response = await fetch("https://api.kluster.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: modelname,
                messages: [{
                    role: "system",
                    content: `Play a role of a machine-like system giving exact answers and not being conversational. Do not try to answer like Explainable AIs. You are given a paragraph and you must take 4 citations (sentences) and minimum of 2 citation sentences which you know can't be a misinformation based on context of the paragraph. The citations you will make must be complete, coherent sentence presenting fact-based, real world info. Don't cite a sentence that is not understandably a standalone statement. The citaion can be 2 sentences to complete this requirement of being understable and clear info. You must also support this sentence with info from your own knowledge (Max 2 sentences). You are like a web misinformation machine you don't have to explain your logic. Output with this format: first you must  add a number then the sentence cited from the paragraph, then add supporting info under the numbering of the cited. Dont add asterisk on any output to make it bold. This is the format: \n1. Cited: [Cited Sentence] \n ${model} Supporting Info: [ Your training data, definition etc ] \n2. Cited: [Cited Sentence] \n ${model} Supporting Info:   ..etc.`,
                }, {
                    role: "user",
                    content: paragraph_art
                }, ],
            }),
        })
        .then(async(fetch_value) => {
            if (!fetch_value.ok) {
                const error = await fetch_value.text();
                throw new Error(`API error: ${error}`);
            } else {
                let res = await fetch_value.body;

                const reader = fetch_value.body.getReader();
                const decoder = new TextDecoder();
                let result = "";
                let done_ = false;
                async function read() {
                    return reader.read().then(async({
                        done,
                        value
                    }) => {
                        if (done) {
                            console.log("result is here - add to db here");
                            console.log(typeof result);

                            returned_result = result;

                            console.log("result");

                            console.log(JSON.parse(result).choices[0].message.content);
                            const data = {
                                plid: idarticle,
                                model: modelname,
                                content: JSON.parse(result).choices[0].message.content,
                            };

                            const posting = await pushDraftsinfo(data)
                                .then(async(vl) => {
                                    console.log(
                                        "++++++++++++++end pushDraftsinfo vl true++++++++++",
                                    );
                                    console.log(vl);
                                })
                                .catch(console.error);

                            return result; // full response text
                        }

                        result += decoder.decode(value, {
                            stream: true
                        });
                        // Optionally, process partial data here
                        read();
                    });
                }

                let r = await read().then((response) => {
                    console.log("response await reader");
                    console.log(response);
                    return response;
                });
            }
        })
        .then((v) => {
            console.log("delayed value ");
            console.log(v);
        });
}

async function fetch_klp3(plid, content_draft, modelname, prevmodel, prevmodel2) {


    console.log("+++content_draft klp3 klp3+++");
    console.log(content_draft);
    let returned_result = "";
    let model = "";
    if (modelname.indexOf('Mistral') > -1) {
        model = "Mistral-Small-24B"
    }
    if (modelname.indexOf('Turbo') > -1) {
        model = "Llama-3.1-8B";
    }
    if (modelname.indexOf('Scout') > -1) {
        model = "Llama-4-Scout-17B";
    }

    let content_d = `You are a system giving exact answers and not being chatty. You must fact-check the given  cited and other infos. There are 2 supporting infos from different model from input, verify these too.t explain your thoughts like Explainable AI. You are given a paragraph (with Cited & Supporting Infos) and you must verify the truthfulness of each cited and its supporting info using your own knowledge.Iterate thru the citations. For each iterations consider this : If you agree that the cited info (labeled as Cited) is true and the supporting info (labeled as ${prevmodel } and the other labeled as ${ prevmodel2 } Supporting Info) is also true and really gives evidence to the truthfulness of the cited based on real world facts, then add your own supporting info. Just put a '${model} Supporting Info' label and add your own knowledge that must also give evidence to the Cited but must be similar in meaning with the given supporting infos.  Limit your answers to 1-2 short sentences. All supporting infos must be similar in meaning, if you think this is not true for the input then reject the citation number and skip it and remove the  citation set & infos from your output, adjust the numbering (so it won't reflect the input).  Move to next number.Don't explain why you reject a citation set. Don't output it just adjust numbers. Output instructions: Put a number, then copy cited statement. Then copy all the supporting infos from input. Finally add your own supporting info, follow the output format. Move to next iteration. Output format: [Numbering]. Cited: [ Copy from input ] \n ${prevmodel} Supporting Info: [ Copy input ]\n ${prevmodel2} Supporting Info: [ Copy input ]\n ${model} Supporting Info: [ Supporting Info from training data, your knowledge ] \n 2.. 3.. 4... [No rejected citation set here]`;

    const response = await fetch("https://api.kluster.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: modelname,
                messages: [{
                    role: "system",
                    content: content_d,
                }, {
                    role: "user",
                    content: content_draft,
                }, ],
            }),
        })
        .then(async(fetch_value) => {
            if (!fetch_value.ok) {
                const error = await fetch_value.text();
                throw new Error(`API error: ${error}`);
            } else {
                let res = await fetch_value.body;

                const reader = fetch_value.body.getReader();
                const decoder = new TextDecoder();
                let result = "";
                let done_ = false;
                async function read() {
                    return reader.read().then(async({
                        done,
                        value
                    }) => {
                        if (done) {
                            console.log("result is here - add to db here");
                            // console.log(result);
                            // console.log(JSON.parse(result).choices[0].message.content);
                            returned_result = result;

                            console.log(
                                "Res3 res3 res3:: mistral result3 ===========returned_result======",
                            );
                            // console.log(returned_result);
                            // const content_txt = filtertx(JSON.parse(result).choices[0].message.content);
                            console.log(JSON.parse(result).choices[0].message.content);
                            const data = {
                                plid: plid,
                                model: modelname,
                                content: JSON.parse(result).choices[0].message.content,
                            };

                            const posting = await pushV2Draftsinfo(data)
                                .then(async(vl) => {
                                    console.log("+++++++end pushDraftsinfo vl should be true+++++");
                                    console.log(vl);
                                })
                                .catch(console.error);

                            return result; // full response text
                        }

                        result += decoder.decode(value, {
                            stream: true
                        });
                        // Optionally, process partial data here
                        read();
                    });
                }

                let r = await read().then((response) => {
                    console.log(
                        "response await reader]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]",
                    );
                    console.log(response);
                    return response;
                });
                console.log("what is r");
                console.log("what is r");
                console.log("what is r");
                console.log("what is r");
                console.log(await r);
                return r;
            }
        })
        .then((v) => {
            console.log("delayed value ");
            console.log(v);
        });

    return await response;
}

async function fetch_klp2(plid, content_draft, modelname, prevmodel) {
    let returned_result = "";
    let model = "";
    if (modelname.indexOf('Mistral') > -1) {
        model = "Mistral-Small-24B"
    }
    if (modelname.indexOf('Turbo') > -1) {
        model = "Llama-3.1-8B";
    }
    if (modelname.indexOf('Scout') > -1) {
        model = "Llama-4-Scout-17B";
    }

    console.log("+++prevmodel+++++");
    // console.log();
    let content_d = `You are a system giving exact answers and not being chatty. You must fact-check the given  cited and other infos. Don't explain your thoughts like Explainable AI. You are given a paragraph (with Cited & Supporting Infos) and you must verify the truthfulness of each cited and its supporting info using your own knowledge. If you agree that the cited info (labeled as Cited) is true and the supporting info (labeled as ${prevmodel } Supporting Info) is also true and really gives evidence to the cited based on real world facts, then put a '${model} Supporting Info' label and add your own knowledge that must also give evidence to the Cited but must be similar in meaning with the given supporting infos. All supporting infos must be similar in meaning, if not reject the Cited & supporting info item and skip it don't add the citation item set in the output.Then adjust the numbering (so the skipped citation wont be numbered). Limit your answers to 1-2 short sentences. Move to next number in the input. Don't explain why you reject a citation set. Don't output it just adjust numbers.  Output format: [Numbering]. Cited: [ Copy from input ] \n ${prevmodel} Supporting Info: [ Copy input ]\n ${model} Supporting Info: [ Your Supporting Info from training data, your knowledge ] \n etc..`;

    const response = await fetch("https://api.kluster.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: modelname,
                messages: [{
                    role: "system",
                    content: content_d,
                }, {
                    role: "user",
                    content: content_draft,
                }, ],
            }),
        })
        .then(async(fetch_value) => {
            if (!fetch_value.ok) {
                const error = await fetch_value.text();
                throw new Error(`API error: ${error}`);
            } else {
                let res = await fetch_value.body;

                const reader = fetch_value.body.getReader();
                const decoder = new TextDecoder();
                let result = "";
                let done_ = false;
                async function read() {
                    return reader.read().then(async({
                        done,
                        value
                    }) => {
                        if (done) {
                            console.log("result is here - add to db here");
                            // console.log(result);
                            // console.log(JSON.parse(result).choices[0].message.content);
                            returned_result = result;

                            console.log(
                                "TODO:: mistral=================returned_result-==============",
                            );
                            // console.log(returned_result);
                            // const content_txt = filtertx(JSON.parse(result).choices[0].message.content);
                            console.log(JSON.parse(result).choices[0].message.content);
                            const data = {
                                plid: plid,
                                model: modelname,
                                content: JSON.parse(result).choices[0].message.content,
                            };

                            const posting = await pushVDraftsinfo(data)
                                .then(async(vl) => {
                                    console.log("++++++++++++++end pushDraftsinfo vl should be  true++++++++++");
                                    console.log(vl);
                                })
                                .catch(console.error);

                            return result; // full response text
                        }

                        result += decoder.decode(value, {
                            stream: true
                        });
                        // Optionally, process partial data here
                        read();
                    });
                }

                let r = await read().then((response) => {
                    console.log(
                        "response await reader]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]",
                    );
                    console.log(response);
                    return response;
                });
                console.log("what is r");
                console.log("what is r");
                console.log("what is r");
                console.log("what is r");
                console.log(await r);
                return r;
            }
        })
        .then((v) => {
            console.log("delayed value ");
            console.log(v);
        });

    return await response;
}




//Kluster AI

// View engine

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", authRoutes);
app.use("/app", dashboardRoutes);
app.use("/search", searchRoutes);
app.use("/channels", channelsRoutes);
app.use("/publisher", publisherRoutes);
app.use("/editor", editorRoutes);

app.use("/micro", dashboardRoutes);
app.use("/friends", friendsRoutes);
app.use("/myprofile", profileRoutes);
app.use("/r", readRoutes);

// home route
app.get("/", (req, res) => {
    res.render("page", {
        title: "Express Auth App"
    });
});



app.get("/drafts_final", async(req, res) => {




    

    try {
        console.log("getres 3 ==========================");
        const drafts = await getDraftsRes3().then(async(vl) => {

            let {
                plid,
                content,
                id,
                results_3, 
                articleid
            } = vl[0];


            console.log("Index of ??????????????? ", results_3.indexOf("2025v New Circuit Model: klusterai/Meta-Llama-3.1-8B-Instruct-Turbo"));
            console.log("Index of ??????????????? ", results_3.indexOf("------------------"));
            results_3 = results_3.replaceAll("2025v New Circuit Model: klusterai/Meta-Llama-3.1-8B-Instruct-Turbo", "");
            results_3 = results_3.replaceAll("2025v New Circuit Model: meta-llama/Llama-4-Scout-17B-16E-Instruct", "");
            results_3 = results_3.replaceAll("------------------", "");
            results_3 = results_3.replaceAll("2025v New Circuit Model: mistralai/Mistral-Small-24B-Instruct-2501", "");



            console.log("]]]]]]]]]]]]]]]]]]]]]");
            console.log("]]]]]]]]]]]]]]]]]]]]] ==  indexOf ----", results_3.indexOf("------------------"));
            console.log("]]]]]]]]]]]]]]]]]]]]]");
            console.log("]]]]]]]]]]]]]]]]]]]]]");
            console.log("]]]]]]]]]]]]]]]]]]]]]");

            /** let results_ = results_3.replace("1. Cited", "Cited").replace("2. Cited", "Cited" ).replace("3. Cited", "Cited").replace("4. Cited", "Cited")    */





            let results_ = results_3.replaceAll("1. Cited :", "Cited:");
            results_ = results_.replaceAll("2. Cited :", "Cited:");
            results_ = results_.replaceAll("3. Cited :", "Cited:");
            results_ = results_.replaceAll("4. Cited :", "Cited:");
            results_ = results_.replaceAll("1. Cited:", "Cited:");
            results_ = results_.replaceAll("2. Cited:", "Cited:");
            results_ = results_.replaceAll("3. Cited:", "Cited:");
            results_ = results_.replaceAll("4. Cited:", "Cited:");

            let cited_collectn = results_.split("Cited:");

            console.log(results_.split("Cited:"));
            console.log("++++++++++++++++++++++++++++++++");

            try {
                console.log("getres 3 ==========================");
                const drafts = await getContentHtml({
                    id: articleid
                }).then(async(vl) => {

                    if( vl == null  ){

                        
                    }else{

                                            let {                       id, nc_isdraft,  nc_content              } = vl[0];
                        console.log("==============Article==================================" , nc_isdraft , "======", nc_content );

                        
                    }
                    
                    /**

                        let art_cont = {db vl};



                        for (let i = 0; i < results_cln.length; i++) {
                            if( (artcontent).indexOf(  )  ){

                                //art_cont.indexOf( res_cllctn[i].substring( 0 ,res_cllctn[i].indexOf("Mistral") ) )
                                //                  const nums = [90, 79, 101];


                                let nums = [res_cllctn[i].indexOf("Mistral-Small-24B") , res_cllctn[i].indexOf("Llama-3.1-8B") , res_cllctn[i].indexOf("Llama-4-Scout-17B") ]; 
                                const models = [
                                  { llm_in: res_cllctn[i].indexOf("Mistral-Small-24B Supporting Info:") , model_name: "Mistral-Small-24B" },
                                  { llm_in: res_cllctn[i].indexOf("Llama-3.1-8B Supporting Info:"), model_name: "Llama-3.1-8B" },
                                  { llm_in: res_cllctn[i].indexOf("Llama-4-Scout-17B Supporting Info:"), model_name: "Llama-4-Scout-17B" }
                                ];

                                // Step 1: Get the least number
                                const least = Math.min(...nums);

                                // Step 2: Find the matching model object
                                const matchedModel = models.find(model => model.llm_in === least);

                                // Step 3: Output the model_name
                                console.log(matchedModel.model_name);  // Output: "Trbo"

                                let model_nearest = matchedModel.model_name;
                                // find the citation from the db article  -- if found insert webinfo
                                if( dbart.indexOf( citation_current ) ){


                                } 


                            }


                        }


                    **/

                }).catch (error);

                
            } catch (error) {



            }
            /** 
            const cita1 = extractWordsRecurringCollect(results_3, "1. Cited", "2. Cited");
            const cita2 = extractWordsRecurringCollect(results_3, "2. Cited", "3. Cited");
            const cita3 = extractWordsRecurringCollect(results_3, "3. Cited", "4. Cited");
            const cita4 = extractWordsRecurringCollect(results_3, "4. Cited", "EndText-None");



            console.log("\\\\\\\\\\cita1\\\\\\\\\\/////////");
            console.log("\\\\\\\\\\cita1\\\\\\\\\\/////////");
            console.log("\\\\\\\\\\cita1\\\\\\\\\\/////////", cita1);
            console.log("\\\\\\\\\\cita2\\\\\\\\\\/////////");
            console.log("\\\\\\\\\\cita2\\\\\\\\\\/////////");
            console.log("\\\\\\\\\\cita2\\\\\\\\\\/////////");


            console.log("\\\\\\\\\\cita2\\\\\\\\\\/////////", cita2);
            console.log("\\\\\\\\\\cita3\\\\\\\\\\/////////");
            console.log("\\\\\\\\\\cita3\\\\\\\\\\/////////");
            console.log("\\\\\\\\\\cita3\\\\\\\\\\/////////");


            console.log("\\\\\\\\\\cita3\\\\\\\\\\/////////", cita3);
            console.log("\\\\\\\\\\cita3\\\\\\\\\\/////////");
            console.log("\\\\\\\\\\cita3\\\\\\\\\\/////////");
            console.log("len 1", cita1.length);
            console.log("len 2", cita2.length);
            console.log("len 3", cita3.length);
            console.log("len 4 ", cita4.length);

**/

        });
    } catch (error) {
        console.log("Error!! Nothing to process @ drafts_finalize ", error);
    }
});



app.get("/drafts_db", async(req, res) => {

    const process_name = req.query.process_name;

    console.log("process_name    =====");    console.log("process_name    =====");
console.log("process_name    =====");    console.log("process_name    =====", process_name);



    if (!process_name) {
        return res.status(400).json({
            error: "Missing 'process name' query parameter"
        });
    }

    try {
        console.log("getDrafts ==========================");
        const drafts = await getDrafts({
            process_name
        }).then(async(vl) => {
            // get variables

            let {
                plid,
                content,
                id,
                results,
                processor,
                articleid
            } = vl[0];
            console.log(plid);
            console.log("vl==========================");
            console.log(vl);

            const sentences = content
                .split(".")
                .map((sentence) => sentence.trim())
                .filter((sentence) => sentence.length > 0);

            console.log(sentences.length);

            let prg_parts = sentences.length / 4;
            //prg_parts are number of sentences in 1 paragraph

            let pargph_1 = sentences.slice(0, prg_parts);
            let pargph_2 = sentences.slice(prg_parts + 1, prg_parts + prg_parts);
            let pargph_3 = sentences.slice(
                prg_parts + prg_parts,
                prg_parts + prg_parts + prg_parts,
            );

            const art_prgph_1 = pargph_1.join(". ");
            const art_prgph_2 = pargph_2.join(". ");
            const art_prgph_3 = pargph_3.join(". ");

            console.log("==============art_prgph");

            let kl_llma = await fetch_kly1(
                    plid,
                    art_prgph_1,
                    "klusterai/Meta-Llama-3.1-8B-Instruct-Turbo",
                )
                .then((v) => {
                    console.log(v);
                })
                .catch(console.error);

            let kl_mist = await fetch_kly1(
                    plid,
                    art_prgph_2,
                    "meta-llama/Llama-4-Scout-17B-16E-Instruct",
                )
                .then((v) => {
                    console.log(v);
                })
                .catch(console.error);

            let kl_dsek = await fetch_kly1(
                    plid,
                    art_prgph_3,
                    "mistralai/Mistral-Small-24B-Instruct-2501",
                )
                //// 
                .then((v) => {
                    console.log(v);
                })
                .catch(console.error);

            console.log("======kl_llma=true =====");
        });
    } catch (error) {
        console.log("Error!! Nothing to process @ drafts_db @app.js ", error);
    }
});
// verify drafts db

app.get("/draftsverif_db", async(req, res) => {

    const process_name = req.query.process_name;
    let user = null;
    let chk_db_artcl = null;
    try {

        console.log("getDrafts ==========================");
        const verifying = await getVerificDr({
            process_name
        }).then(async(vl) => {
            // get variables

            let {
                plid,
                content,
                id,
                results,
                processor,
                articleid
            } = vl[0];

            let index = null;
            let par3_tx = results.split(
                "2025v New Circuit Model: mistralai/Mistral-Small-24B-Instruct-2501",
            )[1];

            const scout = results.split(
                "2025v New Circuit Model: meta-llama/Llama-4-Scout-17B-16E-Instruct",
            )[1];
            index = scout.indexOf(
                "2025v New Circuit Model: mistralai/Mistral-Small-24B-Instruct-2501",
            );
            let par2_tx = null;
            if (index !== -1) {
                par2_tx = scout.slice(0, index); // Cut string from 0 to the occurrence of the substring
            }

            let par1_tx = null;

            const trbo = results.split(
                "2025v New Circuit Model: klusterai/Meta-Llama-3.1-8B-Instruct-Turbo",
            )[1];
            index = trbo.indexOf(
                "2025v New Circuit Model: meta-llama/Llama-4-Scout-17B-16E-Instruct",
            );
            if (index !== -1) {
                par1_tx = trbo.slice(0, index); // Cut string from 0 to the occurrence of the substring 
            }


            let kl_llm0 = await fetch_klp2(
                plid,
                par1_tx,
                "meta-llama/Llama-4-Scout-17B-16E-Instruct", "Llama-3.1-8B",
            ).then((v) => {
                console.log("The result klp2 par1_tx========================");
                console.log("what is r");
                console.log(v);
            }).catch(console.error);

            let kl_llm1 = await fetch_klp2(
                    plid,
                    par2_tx,
                    "mistralai/Mistral-Small-24B-Instruct-2501", "Llama-4-Scout-17B",
                )
                .then((v) => {
                    console.log("The result klp2 par2_tx========================");
                    console.log("what is r");
                    console.log(v);
                })
                .catch(console.error);

            let kl_llm2 = await fetch_klp2(
                    plid,
                    par3_tx,
                    "klusterai/Meta-Llama-3.1-8B-Instruct-Turbo", "Mistral-Small-24B",
                )
                .then((v) => {
                    console.log("The result klp2 par3_tx========================");
                    console.log("what is r");
                    console.log(v);
                })
                .catch(console.error);

            console.log("======kl_llma=true =====");
            console.log(kl_llm0);

        });

    } catch (error) {
        console.log("Error in  processing @ drafts_db @app.js ", error);
    }
});


// verify drafts db
app.get("/draftsverif_db2", async(req, res) => {
    let user = null;

    const process_name = req.query.process_name;
    let chk_db_artcl = null;
    try {
        console.log("getDrafts ==========================");
        const verifying = await getVerificDr2({
            process_name
        }).then(async(vl) => {
            let {
                plid,
                content,
                id,
                results_2,
                processor,
                articleid
            } = vl[0];
            let res = null;
            let index = null;
            let par3_tx = results_2.split(
                "2025v New Circuit Model: klusterai/Meta-Llama-3.1-8B-Instruct-Turbo",
            )[1];



            const scout = results_2.split(
                "2025v New Circuit Model: mistralai/Mistral-Small-24B-Instruct-2501",
            )[1];
            index = scout.indexOf("Llama-4-Scout-17B Supporting Info");
            // good 
            let par2_tx = null
            par2_tx = scout.substring(0, scout.indexOf("2025v New Circuit Model: klusterai/Meta-Llama-3.1-8B-Instruct-Turbo"));
            //                   console.log("par 2 tx ///////////// ok ok ", par2_tx);                }
            let par1_tx = null;
            const trbo = results_2.split(
                "2025v New Circuit Model: meta-llama/Llama-4-Scout-17B-16E-Instruct",
            )[1];
            par1_tx = trbo.substring(0, trbo.indexOf("2025v New Circuit Model: mistralai/Mistral-Small-24B-Instruct-2501"));

            console.log(plid, " < PLID par_1==================", par1_tx);
            console.log(plid, " << PLID par_2===============", par2_tx);
            console.log(plid, " <<PLID par_3=============", par3_tx);
            let kl_llm0 = await fetch_klp3(
                    plid,
                    par1_tx,
                    "mistralai/Mistral-Small-24B-Instruct-2501", "Llama-4-Scout-17B", "Llama-3.1-8B",
                )
                .then((v) => {
                    console.log("The result klp2 par1_tx========================");

                    console.log("what is r");
                    console.log(v);
                })
                .catch(console.error);

            let kl_llm1 = await fetch_klp3(
                    plid,
                    par2_tx,
                    "klusterai/Meta-Llama-3.1-8B-Instruct-Turbo", "Mistral-Small-24B", "Llama-4-Scout-17B"
                )
                .then((v) => {
                    console.log("The result klp2 par2_tx=========");
                    console.log("what is r");
                    console.log(v);
                })
                .catch(console.error);

            let kl_llm2 = await fetch_klp3(
                    plid,
                    par3_tx,
                    "meta-llama/Llama-4-Scout-17B-16E-Instruct", "Llama-3.1-8B", "Mistral-Small-24B",
                )
                .then((v) => {
                    console.log("The result klp2 par3_tx============");
                    console.log("what is r");
                    console.log(v);
                })
                .catch(console.error);

            console.log("======kl_llma=true =====");
            // console.log(

            // kl_llm0);
        });
    } catch (error) {
        console.log("Error in  processing @ drafts_db @app.js ", error);
    }
});


// 404 Page handler
app.use((req, res) => {
    res.status(404).render("404", {
        title: "Page Not Found"
    });
});


module.exports = app;
