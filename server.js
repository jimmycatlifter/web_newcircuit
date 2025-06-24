const app = require("./app");

const PORT = process.env.PORT || 3038;

async function fetch_a() {
  try {
    console.log("After 2 min");

    const response = await fetch("https://19c5d00c-4bcb-4c9e-b73b-ea7dbae4e736-00-3cdgwp38kfppi.worf.replit.dev/draftsverif_db");
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




async function fetch_b() {
  try {
    console.log("hi fetch b");

    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts/3"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Fetch error:", error.message);
  }
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("++++++++app+++++++");

    setInterval(() => {
      // fetch_a();
      // console.log("\\\\\\\\\\\\\");
    }, 38000); 
    // setInterval(fetch_b, 200 000);
});


