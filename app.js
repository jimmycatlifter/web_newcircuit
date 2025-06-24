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
    getVerificDr,
    pushVDraftsinfo,
} = require("./db");

const app = express();

// kluster ai api key
const apiKey = "b96b0973-fa7c-4e93-82ba-8d253e3938c7";

async function fetch_kly1(idarticle, paragraph_art, modelname) {
    let returned_result = "";
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
                        content: "Play a role of a machine-like system giving exact answers and not being conversational. Do not try to answer like Explainable AIs. You are given a paragraph and you must take 4 citations (sentences) and minimum of 2 citation sentences which you know can't be a misinformation based on context of the paragraph. You must also support this sentence from your own knowledge (Max 2 sentences). You are like a web misinformation machine you don't have to explain your logic. Output with this format: first you must number the sentence cited from the paragraph, then add supporting info under the numbering of the cite; add delimiter 5 asterisks after supporting info , dont add asterisk on your chosen citation to make it bold. This is the format: \n1. Cited: [Cited Sentence] \n Supporting Info : [ Your training data, definition etc ] \n2. Cited: [Cited Sentence] \n Supporting Info :   ..etc.",
                    },
                    {
                        role: "user",
                        content: paragraph_art
                    },
                ],
            }),
        })
        .then(async (fetch_value) => {
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
                    return reader.read().then(async ({
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
                                .then(async (vl) => {
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

async function fetch_klp3(plid, content_draft, modelname, prevmodel) {


    console.log("+++++content_draft klp3 klp3+++++");
console.log(content_draft);
    let returned_result = "";
let model = "";
    if( modelname.indexOf('Mistral') > -1 ){

        model = "Mistral-Small-24B" }

    if( modelname.indexOf('Turbo') > -1 ){

        model = "Llama-3.1-8B";
    }
    if( modelname.indexOf('Scout') > -1 ){

        model = "Llama-4-Scout-17B";
    }
    
    let content_d = `You are a system giving exact answers and not being conversational. Don't explain your thoughts like Explainable AI. You are given a paragraph (with Cited & Supporting Info) and you must verify the truthfulness of each cited and its supporting info using your own knowledge. If you agree that the cited info (labeled as Cited) is true and the supporting info ( labeled as Info from ${prevmodel} ) is also true and really relates to the Cited statement and gives evidence to its truthfulness based on real world facts, put Yes to Verifier field, if not put No. Then put an Info label and  add your own knowledge that must also give evidence to the Cited but must be similar in meaning with that supporting info (from the input). Limit your answers to 1-2 short sentences. To output properly copy the cited & model supporting info from the input, then add a label info which has your own knowledge Instruction for output. First put number then add the label Cited which will have the cited statement from input then add the label Verifier this value is Yes or No. Then copy info from model, its label and value. Finally add Info from ${model} label where you add your own knowledge. If you answered No to Verifier, then put nothing else on the number (but the cited and the Verifier: No). Output format: 1. Cited : [ Just copy the the same value from input ] \n Verifier : [Yes/No] \n Info From ${prevmodel} : [ Copy from input ] \n Info from ${model} : [ Your training data, knowledge  ] \n 2. Cited : [ Just copy the the same value from input ] \n Verifier: [Yes/No] \n Info From ${prevmodel} : [ Copy from input ] \nInfo from ${model} : [ Your training data, knowledge  ]`;

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
                        content:  content_d,
                    },
                    {
                        role: "user",
                        content: content_draft,
                    },
                ],
            }),
        })
        .then(async (fetch_value) => {
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
                    return reader.read().then(async ({
                        done,
                        value
                    }) => {
                        if (done) {
                            console.log("result is here - add to db here");
                            // console.log(result);
                            // console.log(JSON.parse(result).choices[0].message.content);
                            returned_result = result;

                            console.log(
                                "Res3 res3 res3:: mistral result3 =================returned_result-==============",
                            );
                            // console.log(returned_result);
                            // const content_txt = filtertx(JSON.parse(result).choices[0].message.content);
                            console.log(JSON.parse(result).choices[0].message.content);
                            // const data = {
                            //     plid: plid,
                            //     model: modelname,
                            //     content: JSON.parse(result).choices[0].message.content,
                            // };

                            // const posting = await pushVDraftsinfo(data)
                            //     .then(async (vl) => {
                            //         console.log("++++++++++++++end pushDraftsinfo vl should be  true++++++++++");

                            //         console.log(vl);
                            //     })
                            //     .catch(console.error);

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

async function fetch_klp2(plid, content_draft, modelname) {
    let returned_result = "";
let model = "";
    if( modelname.indexOf('Mistral') > -1 ){

        model = "Mistral-Small-24B" }

    if( modelname.indexOf('Turbo') > -1 ){

        model = "Llama-3.1-8B";
    }
    if( modelname.indexOf('Scout') > -1 ){

        model = "Llama-4-Scout-17B";
    }

    let content_d = `You are a system giving exact answers and not being conversational. Don't explain your thoughts like Explainable AI. You are given a paragraph (with Cited & Supporting Info) and you must verify the truthfulness of each cited and its supporting info using your own knowledge. If you agree that the cited info (labeled as Cited) is true and the supporting info (labeled as Info from Specific-Model ) is also true and really relates to the Cited statement and gives evidence to its truthfulness based on real world facts, put Yes to Verifier field, if not put No. Then put a Supporting Info label and  add your own knowledge that must also give evidence to the Cited but must be similar in meaning with that supporting info (from the input). Limit your answers to 1-2 short sentences. To output properly copy the cited & model  info from the input, then add a label supporting info which has your own knowledge. Move to next number in the input and do the same. Instruction for output. First put number then add the label Cited which will have the cited statement from input then add the label Verifier this value is Yes or No. Then copy info from model, its label and value. Finally add Supporting Info label where you add your own knowledge. If you answered No to Verifier, then put nothing else on the number (but the cited and the Verifier: No). Output format: 1. Cited : [ Just copy the the same value from input ] \n Verifier : [Yes/No] \n Info From ${model} : [ Copy from input ] \n Supporting Info : [ Your training data, knowledge  ] \n 2. Cited : [ Just copy the the same value from input ] \n Verifier: [Yes/No] \n Info From ${model} : [ Copy from input ] Supporting Info : [ Your training data, knowledge  ]`;

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
                        content:  content_d,
                    },
                    {
                        role: "user",
                        content: content_draft,
                    },
                ],
            }),
        })
        .then(async (fetch_value) => {
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
                    return reader.read().then(async ({
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
                                .then(async (vl) => {
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

app.get("/drafts_db", async (req, res) => {
    let user = null;
    /** settimeout 3mins and search for plid if the plid on content has all models in string then update status DRAFT_verify then end func */

    let chk_db_artcl = null;
    try {
        console.log("getDrafts ==========================");
        const postingblog = await getDrafts().then(async (vl) => {
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

app.get("/draftsverif_db", async (req, res) => {
    let user = null;
    /** settimeout 3mins and search for plid if the plid on content has all models in string then update status DRAFT_verify then end func */

    let chk_db_artcl = null;
    try {
        console.log("getDrafts ==========================");
        const verifying = await getVerificDr().then( async (vl) => {
            // get variables

            let {
                plid,  content,   id, results, processor,          articleid
            } = vl[0];

            let index = null;
            let par3_tx = results.split(
                "2025v New Circuit Model: mistralai/Mistral-Small-24B-Instruct-2501",
            )[1];
            if (par3_tx.indexOf("Supporting Info :") > -1) {
                let res = par3_tx.replace("Supporting Info :", "Info From Mistral: ");
                par3_tx = res;
                console.log("----par3_text------");
                console.log("----par3_text------");
                console.log("----par3_text------");
                console.log(par3_tx);
            }

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

            if (par2_tx.indexOf("Supporting Info :") > -1) {
                let res = par2_tx.replace("Supporting Info :", "Info From Llama-Scout: ");
                par2_tx = res;
                console.log("----par2_text------");
                console.log("----par2_text------");
                console.log("----par2_text------");
                console.log(par2_tx);
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

            if (par1_tx.indexOf("Supporting Info :") > -1) {
                let res = par1_tx.replace("Supporting Info :", "Info From Llama 8B: ");
                par1_tx = res;
                console.log("----par1_text------");
                console.log("----par1_text------");
                console.log("----par1_text------");
                console.log(par1_tx);
            }
            console.log("SPLIIIIIIIIIT?????????????");
            console.log("SPLIIIIIIIIIT?????????????");
            // console.log(trbo_tx);
            console.log("llamascout]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]");
            console.log("SPLIIIIIIIIIT?????????????");
            console.log("SPLIIIIIIIIIT?????????????");
            // console.log(scout_tx);
            //
            console.log("mistral]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]");
            console.log("SPLIIIIIIIIIT?????????????");
            console.log("SPLIIIIIIIIIT?????????????");
            // console.log(mistr_tx);

            console.log("==============art_prgph");
            console.log(plid);

            let kl_llm0 = await fetch_klp2(
                    plid,
                    par1_tx,
                    "meta-llama/Llama-4-Scout-17B-16E-Instruct",
                )
                .then((v) => {
                    console.log("The result klp2 par1_tx========================");

                    console.log("what is r");
                    console.log(v);
                })
                .catch(console.error);

            let kl_llm1 = await fetch_klp2(
                    plid,
                    par2_tx,
                    "mistralai/Mistral-Small-24B-Instruct-2501",
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
                    "klusterai/Meta-Llama-3.1-8B-Instruct-Turbo",
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
app.get("/draftsverif_db2", async (req, res) => {
    let user = null; 

    let chk_db_artcl = null;
    try {
        console.log("getDrafts ==========================");
        const verifying = await getVerificDr2().then(async (vl) => {
            // get variables

            let {
                plid,
                content,
                id,
                results_2,
                processor,
                articleid
            } = vl[0];

            let index = null;
            let par3_tx = results_2.split(
                "2025v New Circuit Model: klusterai/Meta-Llama-3.1-8B-Instruct-Turbo",
            )[1];
            
            if (par3_tx.indexOf("Supporting Info :") > -1) {
                let res = par3_tx.replace("Supporting Info :", "Info From Mistral: ");
                par3_tx = res;
                console.log("----par3_text------");
                console.log("----par3_text------");
                console.log("----par3_text------");
                console.log(par3_tx);
            }

            const scout = results_2.split(
                "2025v New Circuit Model: mistralai/Mistral-Small-24B-Instruct-2501",
            )[1];
            index = scout.indexOf(
                "2025v New Circuit Model: mistralai/Mistral-Small-24B-Instruct-2501",
            );
            let par2_tx = null;
            if (index !== -1) {
                par2_tx = scout.slice(0, index); // Cut string from 0 to the occurrence of the substring
                console.log("substring substring par2_tx==========");

                console.log(par2_tx);
                if (par2_tx.indexOf("Supporting Info :") > -1) {
                    let res = par2_tx.replace("Supporting Info :", "Info From Llama-Scout: ");
                    par2_tx = res;
                    console.log("----par2_text------");
                    console.log("----par2_text------");
                    console.log("----par2_text------");
                    console.log(par2_tx);
                }
            }

            
            let par1_tx = null;

            const trbo = results_2.split(
                "2025v New Circuit Model: meta-llama/Llama-4-Scout-17B-16E-Instruct",
            )[1];
            index = trbo.indexOf(
                "2025v New Circuit Model: meta-llama/Llama-4-Scout-17B-16E-Instruct",
            );
            if (index !== -1) {
                par1_tx = trbo.slice(0, index); // Cut string from 0 to the occurrence of the substring 
                console.log("substring substrung substring", par1_tx);
                if (par1_tx.indexOf("Supporting Info :") > -1) {
                    let res = par1_tx.replace("Supporting Info :", "Info From Llama 8B: ");
            
            }











                
                
                 
                
                par1_tx = res;
                console.log("----par1_text------");
                console.log("----par1_text------");
                console.log("----par1_text------");
                console.log(par1_tx);
            }
            console.log("SPLIIIIIIIIIT?????????????");
            console.log("SPLIIIIIIIIIT?????????????");
            // console.log(trbo_tx);
            console.log("llamascout]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]");
            console.log("SPLIIIIIIIIIT?????????????");
            console.log("SPLIIIIIIIIIT?????????????");
            // console.log(scout_tx);
            //
            console.log("mistral]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]");
            console.log("SPLIIIIIIIIIT?????????????");
            console.log("SPLIIIIIIIIIT?????????????");
            // console.log(mistr_tx);

            console.log("==============art_prgph");
            console.log(plid);

               
            let kl_llm0 = await fetch_klp3(
                    plid,
                    par1_tx,
                    "mistralai/Mistral-Small-24B-Instruct-2501","Llama-4-Scout-17B"
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
                    "klusterai/Meta-Llama-3.1-8B-Instruct-Turbo","Mistral-Small-24B"
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
                    "meta-llama/Llama-4-Scout-17B-16E-Instruct","Llama-3.1-8B",
                )
                .then((v) => {
                    console.log("The result klp2 par3_tx============");
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
 

// 404 handler
app.use((req, res) => {
    res.status(404).render("404", {
        title: "Page Not Found"
    });
});

module.exports = app;
