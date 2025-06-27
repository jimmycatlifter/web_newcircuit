const app = require("./app");
const PORT = process.env.PORT || 3004;

async function a_draft_start() {
  try {
    console.log("After 2 min");
    const response = await fetch("https://19c5d00c-4bcb-4c9e-b73b-ea7dbae4e736-00-3cdgwp38kfppi.worf.replit.dev:4200/drafts_final?process_name=process-a");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("remove await");
    console.log(data);
  } catch (error) {
    console.error(error);
    console.error("Fetch error!!:", error.message);
  }
 
}

async function b_draft_start() {
  try {
    console.log("After 2 min");
    const response = await fetch("https://19c5d00c-4bcb-4c9e-b73b-ea7dbae4e736-00-3cdgwp38kfppi.worf.replit.dev:3003/drafts_db?process_name=process-b");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("remove await");
    console.log(data);
  } catch (error) {
    console.error(error);
    console.error("Fetch error!!:", error.message);
  }

}

async function b_draft_verify() {
  try {
    console.log("After 2 min");
    const response = await fetch("https://19c5d00c-4bcb-4c9e-b73b-ea7dbae4e736-00-3cdgwp38kfppi.worf.replit.dev:3003/draftsverif_db?process_name=process-b");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("remove await");
    console.log(data);
  } catch (error) {
    console.error(error);
    console.error("Fetch error!!:", error.message);
  }

}


async function a_draft_verify() {
  try {
    console.log("After 2 min");
    const response = await fetch("https://19c5d00c-4bcb-4c9e-b73b-ea7dbae4e736-00-3cdgwp38kfppi.worf.replit.dev:3003/draftsverif_db?process_name=process-a");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("remove await");
    console.log(data);
    
  } catch (error) {
    console.error(error);
    console.error("Fetch error!!:", error.message);
  }

}


async function a_draft_verify2() {
  try {
    console.log("After 2 min");
    const response = await fetch("https://19c5d00c-4bcb-4c9e-b73b-ea7dbae4e736-00-3cdgwp38kfppi.worf.replit.dev:3003/draftsverif_db2?process_name=process-a");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("remove !!");
    console.log(data);
  } catch (error) {
    console.error(error);
    console.error("Fetch error!!:", error.message);
  }

}


async function b_draft_verify2() {
  try {
    console.log("After 2 min");

    const response = await fetch("https://19c5d00c-4bcb-4c9e-b73b-ea7dbae4e736-00-3cdgwp38kfppi.worf.replit.dev:3003/draftsverif_db2?process_name=process-b");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("remove await");
    console.log(data);
  } catch (error) {
    console.error(error);
    console.error("Fetch error!!:", error.message);
  }

}



 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("+++++app+++");


  
  // setInterval(() => {    a_draft_verify(); console.log("///???a_draft_start")    }, 31000);
  // setInterval(() => {    b_draft_verify(); console.log("///???b_draft_start")    }, 38000);
  
    setInterval(() => {    a_draft_start();  console.log("///???a_draft_start")    }, 16000); 
  // setInterval(() => {    b_draft_start();  console.log("///???b_draft_start")    }, 29000); 
  
  // setInterval(() => {   a_draft_verify2(); console.log("??????")    }, 18000); 
  // setInterval(() => {   b_draft_verify2(); console.log("???")    }, 28000);  

  

  

});


